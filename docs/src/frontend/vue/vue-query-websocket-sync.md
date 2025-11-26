---
title: Vue Query에서 WebSocket으로 실시간 동기화 문제 해결기
description: Vue Query를 WebSocket으로 전환하여 실시간 데이터 동기화 문제를 해결한 경험을 공유합니다. WebSocket 설정, Vue Query와의 통합 방법을 포함합니다.
keywords: Vue Query, WebSocket, 실시간 동기화, Vue.js, 실시간 데이터, 프론트엔드 개발
date: 2024-01-01
---

# Vue Query에서 WebSocket으로: 실시간 동기화 문제 해결기

## 문제의 발생

우리 팀은 Vue Query를 사용하여 데이터를 관리하는 협업 애플리케이션을 개발하고 있었습니다.<br>
초기에는 모든 것이 순조로워 보였지만, 실제 운영 환경에서 심각한 문제가 발생했습니다.

**핵심 문제:** 여러 사용자가 동시에 작업할 때,<br>
다른 사람이 수정한 내용이 내 화면에 즉시 반영되지 않았습니다.<br>
이로 인해 데이터 충돌과 작업 손실이 빈번하게 발생했습니다.

## Vue Query의 한계

문제의 원인을 분석해보니 Vue Query의 동작 방식에서 비롯되었습니다:

```javascript
// 기존 Vue Query 설정

const { data } = useQuery({
  queryKey: ["documents", documentId],

  queryFn: fetchDocument,

  refetchInterval: 5000, // 5초마다 폴링

  refetchOnWindowFocus: true,
});
```

Vue Query는 기본적으로 다음과 같은 상황에서만 데이터를 갱신합니다:

- 창에 포커스가 돌아왔을 때

- 네트워크가 다시 연결되었을 때

- 설정한 `refetchInterval`에 따라 주기적으로

**문제점:** 사용자가 다른 탭을 보거나 화면을 최소화하면, 백그라운드에서는 HTTP 요청을 하지 않습니다. <br>
이는 브라우저의 성능 최적화 메커니즘이지만, 협업 환경에서는 치명적이었습니다.

## 첫 번째 시도: SSE(Server-Sent Events)

실시간성을 개선하기 위해 SSE를 도입했습니다:

```javascript
// SSE 연결 설정

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

SSE를 통해 서버에서 클라이언트로 실시간 업데이트를 푸시할 수 있게 되었고,<br>
일정 부분 문제가 해결되었습니다. 다른 사용자의 변경사항이 거의 실시간으로 반영되기 시작했습니다.

## 새로운 문제: 서버 부하

하지만 시간이 지나면서 새로운 문제가 발생했습니다.<br>
동시 접속자가 증가하고 데이터가 누적되면서 서버에 심각한 부하가 걸리기 시작했습니다.

**SSE의 한계:**

1. 단방향 통신: 서버에서 클라이언트로만 데이터를 보낼 수 있습니다

2. 연결 관리: 각 클라이언트마다 열린 HTTP 연결을 유지해야 합니다

3. 폴링 방식: 서버가 주기적으로 모든 연결된 클라이언트에게 데이터를 전송해야 합니다

```

동시 접속자 100명 × 5초마다 업데이트 = 서버에서 초당 20번의 브로드캐스트

```

사용자가 늘어날수록 이 수치는 기하급수적으로 증가했고, 서버 응답 시간이 급격히 느려졌습니다.

## 최종 해결책: WebSocket

근본적인 해결을 위해 WebSocket으로 전환하기로 결정했습니다.

### WebSocket을 선택한 이유

1. **양방향 통신**: 클라이언트와 서버가 서로 자유롭게 메시지를 주고받을 수 있습니다

2. **효율적인 연결 관리**: 단일 TCP 연결을 통해 실시간 통신을 유지합니다

3. **이벤트 기반 업데이트**: 변경사항이 있을 때만 메시지를 전송합니다

4. **낮은 지연시간**: HTTP 오버헤드 없이 즉각적인 통신이 가능합니다

### 구현 방법

#### 1. WebSocket 연결 설정

```javascript
// composables/useWebSocket.js

import { ref, onMounted, onUnmounted } from "vue";

import { useQueryClient } from "@tanstack/vue-query";

export const useWebSocket = (documentId) => {
  const ws = ref(null);

  const queryClient = useQueryClient();

  const isConnected = ref(false);

  onMounted(() => {
    // WebSocket 연결

    ws.value = new WebSocket(
      `wss://api.example.com/documents/${documentId.value}`
    );

    ws.value.onopen = () => {
      console.log("WebSocket 연결됨");

      isConnected.value = true;
    };

    ws.value.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "document_update":
          // Vue Query 캐시 업데이트

          queryClient.setQueryData(
            ["documents", documentId.value],

            message.data
          );

          break;

        case "user_joined":
          // 사용자 입장 알림

          console.log(`${message.username}님이 입장했습니다`);

          break;

        case "user_left":
          // 사용자 퇴장 알림

          console.log(`${message.username}님이 퇴장했습니다`);

          break;
      }
    };

    ws.value.onerror = (error) => {
      console.error("WebSocket 에러:", error);
    };

    ws.value.onclose = () => {
      console.log("WebSocket 연결 종료");

      isConnected.value = false;
    };
  });

  onUnmounted(() => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.close();
    }
  });

  // 메시지 전송 함수

  const sendMessage = (type, data) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ type, data }));
    }
  };

  return { isConnected, sendMessage };
};
```

#### 2. 컴포넌트에서 사용

```vue
<!-- components/DocumentEditor.vue -->

<script setup>
import { ref } from "vue";

import { useQuery, useMutation } from "@tanstack/vue-query";

import { useWebSocket } from "../composables/useWebSocket";

const props = defineProps({
  documentId: String,
});

const content = ref("");

const { isConnected, sendMessage } = useWebSocket(props.documentId);

// 초기 데이터 로드 (Vue Query)

const { data: document } = useQuery({
  queryKey: ["documents", props.documentId],

  queryFn: () => fetchDocument(props.documentId),
});

// 사용자가 내용을 수정할 때

const handleChange = (newContent) => {
  content.value = newContent;

  // WebSocket을 통해 변경사항 전송

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

#### 3. 서버 측 구현 예시 (Node.js)

```javascript
// server.js

const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

// 문서별 연결된 클라이언트 관리

const documentClients = new Map();

wss.on("connection", (ws, req) => {
  const documentId = extractDocumentId(req.url);

  // 클라이언트 그룹에 추가

  if (!documentClients.has(documentId)) {
    documentClients.set(documentId, new Set());
  }

  documentClients.get(documentId).add(ws);

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "content_change") {
      // 같은 문서를 보고 있는 다른 클라이언트들에게 브로드캐스트

      const clients = documentClients.get(documentId);

      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "document_update",

              data: data.data,
            })
          );
        }
      });
    }
  });

  ws.on("close", () => {
    // 연결 종료 시 클라이언트 제거

    const clients = documentClients.get(documentId);

    if (clients) {
      clients.delete(ws);

      if (clients.size === 0) {
        documentClients.delete(documentId);
      }
    }
  });
});
```

## 개선 효과

구체적인 지표를 측정하지는 못했지만,<br>
실제 사용 과정에서 다음과 같은 개선을 명확하게 체감할 수 있었습니다:

**응답 속도**

- SSE: 다른 사용자의 변경사항이 수 초 후에 반영되어 답답함을 느꼈습니다

- WebSocket: 거의 즉시 반영되어 마치 같은 화면을 보는 것처럼 자연스러운 협업이 가능했습니다

**서버 안정성**

- SSE: 사용자가 늘어날수록 서버 응답이 느려지고 간헐적으로 타임아웃이 발생했습니다

- WebSocket: 동시 접속자가 많아져도 안정적으로 동작했습니다

**네트워크 효율성**

- SSE: 변경사항이 없어도 주기적으로 데이터를 전송해야 했습니다

- WebSocket: 실제 변경이 발생했을 때만 데이터를 주고받아 불필요한 트래픽이 줄었습니다

## 배운 점

1. **Vue Query는 여전히 유용합니다**: 초기 데이터 로드, 캐싱, 낙관적 업데이트 등에서 Vue Query의 강력한 기능을 활용하고, 실시간 동기화는 WebSocket으로 보완하는 하이브리드 접근이 최선이었습니다.

2. **적절한 도구 선택의 중요성**: SSE는 서버에서 클라이언트로 단방향 알림이 필요한 경우에 적합하지만, 협업 애플리케이션처럼 양방향 통신이 필요한 경우에는 WebSocket이 더 적합합니다.

3. **확장성 고려**: 초기 설계 단계에서 예상 트래픽과 동시 접속자 수를 고려한 아키텍처 선택이 중요합니다.

## 결론

Vue Query만으로는 실시간 협업 환경의 요구사항을 충족하기 어려웠습니다. SSE를 거쳐 최종적으로 WebSocket을 도입함으로써, 사용자 경험을 크게 개선하고 서버 부하도 줄일 수 있었습니다.

**핵심 교훈:** 기술 선택은 현재 요구사항뿐만 아니라 미래의 확장성도 함께 고려해야 합니다.<br>
때로는 처음부터 올바른 해결책을 찾기보다,<br>
문제를 겪으며 점진적으로 개선하는 과정이 팀의 성장에 더 도움이 됩니다.
