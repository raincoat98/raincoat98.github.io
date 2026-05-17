---
categories: [Vue]
title: Vue 폴링 → SSE → WebSocket 전환기
description: 협업 애플리케이션에서 실시간 동기화 문제를 해결하기 위해 Vue Query 폴링 → SSE → WebSocket으로 단계적으로 전환한 경험을 공유합니다.
created: 2025-11-26
tags: [Vue|green, WebSocket|blue, SSE|blue, Vue Query|green, 실시간 동기화|teal]
platform: Vue Query
readingTime: 10
---

# Vue 폴링 → SSE → WebSocket 전환기

협업 애플리케이션을 개발하면서 실시간 동기화 문제로 꽤 오래 고생했습니다.
Vue Query 폴링으로 시작해서 SSE를 거쳐 최종적으로 WebSocket으로 갈아탄 과정을 정리했습니다.

---

## 처음엔 Vue Query 폴링으로 시작했습니다

초기 구현은 단순했습니다. Vue Query의 `refetchInterval`로 5초마다 서버에서 데이터를 가져오는 방식이었습니다.

```javascript
const { data } = useQuery({
  queryKey: ["documents", documentId],
  queryFn: fetchDocument,
  refetchInterval: 5000,
  refetchOnWindowFocus: true,
});
```

개발 환경에서는 별 문제가 없었습니다. 그런데 실제 운영에 들어가면서 문제가 드러났습니다.

**다른 사람이 수정한 내용이 내 화면에 즉시 반영되지 않았습니다.**

원인은 브라우저의 성능 최적화 메커니즘이었습니다. 사용자가 다른 탭을 보거나 화면을 최소화하면 백그라운드에서 HTTP 요청을 보내지 않습니다. 협업 환경에서는 치명적인 동작이었습니다. 5초 간격 폴링만으로는 실시간 협업이 불가능했습니다.

---

## SSE로 바꿨더니 서버가 힘들어했습니다

실시간성을 높이기 위해 SSE(Server-Sent Events)를 도입했습니다. 서버에서 클라이언트로 변경사항을 푸시하는 방식입니다.

```javascript
onMounted(() => {
  const eventSource = new EventSource(
    `/api/documents/${documentId.value}/stream`
  );

  eventSource.onmessage = (event) => {
    const newData = JSON.parse(event.data);
    queryClient.setQueryData(["documents", documentId.value], newData);
  };

  onUnmounted(() => {
    eventSource.close();
  });
});
```

다른 사용자의 변경사항이 거의 즉시 반영되기 시작했습니다. 일단은 만족스러웠습니다.

그런데 동시 접속자가 늘어나면서 새로운 문제가 생겼습니다.

```
동시 접속자 100명 × 5초마다 업데이트 = 서버에서 초당 20번 브로드캐스트
```

SSE는 각 클라이언트마다 HTTP 연결을 열어두고, 서버가 주기적으로 모든 연결에 데이터를 밀어넣어야 합니다. 사용자가 늘어날수록 서버 부하가 기하급수적으로 증가했고, 응답 시간이 눈에 띄게 느려졌습니다.

SSE의 한계가 명확했습니다.

- 서버 → 클라이언트 **단방향 통신**만 가능
- 클라이언트마다 **별도 HTTP 연결 유지** 필요
- 변경사항이 없어도 **주기적으로 전송** 필요

---

## 결국 WebSocket으로 갔습니다

근본적인 해결을 위해 WebSocket으로 전환했습니다. WebSocket을 선택한 이유는 명확했습니다.

- **양방향 통신**: 클라이언트와 서버가 서로 자유롭게 메시지를 주고받을 수 있습니다
- **단일 TCP 연결**: 연결 수립 후 오버헤드 없이 실시간 통신이 유지됩니다
- **이벤트 기반**: 변경사항이 있을 때만 메시지를 전송합니다

### WebSocket 연결 composable

```javascript
// composables/useWebSocket.js
import { ref, onMounted, onUnmounted } from "vue";
import { useQueryClient } from "@tanstack/vue-query";

export const useWebSocket = (documentId) => {
  const ws = ref(null);
  const queryClient = useQueryClient();
  const isConnected = ref(false);

  onMounted(() => {
    ws.value = new WebSocket(
      `wss://api.example.com/documents/${documentId.value}`
    );

    ws.value.onopen = () => {
      isConnected.value = true;
    };

    ws.value.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "document_update":
          // Vue Query 캐시를 직접 업데이트
          queryClient.setQueryData(
            ["documents", documentId.value],
            message.data
          );
          break;
        case "user_joined":
          console.log(`${message.username}님이 입장했습니다`);
          break;
        case "user_left":
          console.log(`${message.username}님이 퇴장했습니다`);
          break;
      }
    };

    ws.value.onerror = (error) => {
      console.error("WebSocket 에러:", error);
    };

    ws.value.onclose = () => {
      isConnected.value = false;
    };
  });

  onUnmounted(() => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.close();
    }
  });

  const sendMessage = (type, data) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ type, data }));
    }
  };

  return { isConnected, sendMessage };
};
```

### 컴포넌트에서 사용

```vue
<!-- components/DocumentEditor.vue -->
<script setup>
import { ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useWebSocket } from "../composables/useWebSocket";

const props = defineProps({ documentId: String });

const content = ref("");
const { isConnected, sendMessage } = useWebSocket(props.documentId);

// 초기 데이터는 Vue Query로 로드
const { data: document } = useQuery({
  queryKey: ["documents", props.documentId],
  queryFn: () => fetchDocument(props.documentId),
});

// 사용자가 내용을 수정하면 WebSocket으로 전송
const handleChange = (newContent) => {
  content.value = newContent;
  if (isConnected.value) {
    sendMessage("content_change", {
      documentId: props.documentId,
      content: newContent,
      timestamp: Date.now(),
    });
  }
};
</script>

<template>
  <div>
    <div class="status">
      {{ isConnected ? "🟢 연결됨" : "🔴 연결 끊김" }}
    </div>
    <textarea
      v-model="content"
      @input="handleChange(content)"
      placeholder="문서를 작성하세요..."
    />
  </div>
</template>
```

### 서버 측 구현 (Node.js)

```javascript
// server.js
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

// 문서별로 연결된 클라이언트 관리
const documentClients = new Map();

wss.on("connection", (ws, req) => {
  const documentId = extractDocumentId(req.url);

  if (!documentClients.has(documentId)) {
    documentClients.set(documentId, new Set());
  }
  documentClients.get(documentId).add(ws);

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "content_change") {
      // 같은 문서를 보고 있는 다른 클라이언트에게만 브로드캐스트
      const clients = documentClients.get(documentId);
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "document_update", data: data.data }));
        }
      });
    }
  });

  ws.on("close", () => {
    const clients = documentClients.get(documentId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) documentClients.delete(documentId);
    }
  });
});
```

---

## 세 가지 방식 비교

| 항목 | Vue Query 폴링 | SSE | WebSocket |
|------|---------------|-----|-----------|
| 통신 방향 | 단방향 (클→서버) | 단방향 (서버→클) | 양방향 |
| 실시간성 | 낮음 (5초 간격) | 중간 | 높음 (즉시) |
| 서버 부하 | 낮음 | 접속자 증가 시 높아짐 | 낮음 |
| 구현 난이도 | 쉬움 | 중간 | 중간 |
| 적합한 상황 | 실시간성 불필요 | 단방향 알림 | 협업, 채팅, 실시간 편집 |

---

## 이 과정에서 배운 것

**Vue Query는 여전히 유용합니다.** 초기 데이터 로드, 캐싱, 낙관적 업데이트는 Vue Query가 훨씬 편합니다. WebSocket으로 받은 데이터를 `queryClient.setQueryData()`로 캐시에 반영하면 두 가지를 함께 쓸 수 있습니다. 대체가 아니라 보완입니다.

**SSE는 단방향 알림에 적합합니다.** 공지 알림, 진행 상태 표시처럼 서버에서 클라이언트로만 정보를 보내면 되는 경우라면 SSE가 WebSocket보다 구현이 단순합니다. 협업처럼 양방향 통신이 필요한 경우에는 맞지 않습니다.

**확장성은 처음부터 고려해야 합니다.** SSE로 전환할 때 동시 접속자가 늘어날 경우를 충분히 고려하지 못했습니다. 처음부터 WebSocket으로 갔더라면 전환 비용을 아낄 수 있었을 것입니다.

---

## 한 줄 정리

> Vue Query는 초기 로드와 캐싱, 실시간 동기화는 WebSocket. 둘은 대체가 아니라 역할 분담입니다.
