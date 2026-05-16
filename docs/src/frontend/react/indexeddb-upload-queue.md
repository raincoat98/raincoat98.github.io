---
categories: [React]
title: React IndexedDB 업로드 큐 만들기
description: 오피스 빌딩 와이파이 끊김 환경에서 파일 업로드 실패를 IndexedDB 큐로 해결하는 방법. 즉시 전송 대신 저장 후 백그라운드 업로드 패턴을 구현합니다.
date: 2025-11-26
tags: [React, IndexedDB, 오프라인]
platform: Browser
readingTime: 8
---

# React IndexedDB 업로드 큐 만들기

오피스 빌딩에서 층간 이동, 엘리베이터, 지하 주차장 등 와이파이가 끊기는 순간 파일 업로드가 실패하고, 메모리에 있던 `File` 객체가 사라져서 사용자가 다시 촬영해야 하는 문제를 겪었습니다.

해결책은 단순합니다. 파일을 즉시 서버로 보내지 말고, IndexedDB에 먼저 저장한 뒤 백그라운드에서 업로드하는 것입니다.

---

## 기존 방식의 문제

```js
async function uploadFile(file) {
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  // 네트워크 끊기는 순간 → File 객체 소실 → 재촬영 필요
}
```

즉시 전송 방식은 네트워크 의존도가 100%입니다. 끊기면 데이터 손실, 재시도 불가, UX 악화가 한 번에 옵니다.

## 개선 플로우

```
파일 선택
   │
   ▼
IndexedDB에 Blob 저장 (0.1초)
   │
   ├─ 사용자에게 "저장 완료" 즉시 피드백
   │
   ▼
백그라운드 업로드 시도
   │
   ├─ 성공 → IndexedDB에서 삭제
   └─ 실패 → 상태만 갱신, 나중에 재시도
```

네트워크 끊김 = 데이터 손실 → **네트워크 끊김 = 잠시 대기**로 바뀝니다.

---

## 1. IndexedDB 스키마

`idb` 라이브러리를 쓰면 Promise 기반으로 깔끔하게 작성할 수 있습니다.

```js
import { openDB } from "idb";

const DB_NAME = "AppDB";
const STORE_NAME = "uploadQueue";

export async function initDatabase() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("status", "status");
        store.createIndex("createdAt", "createdAt");
      }
    },
  });
}
```

## 2. 파일 저장

```js
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function saveFileToQueue(file, metadata = {}) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("파일 크기가 50MB를 초과합니다");
  }

  const db = await initDatabase();
  const queueItem = {
    id: crypto.randomUUID(),
    blob: file,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    metadata,
    status: "pending", // pending | uploading | failed
    retryCount: 0,
    createdAt: Date.now(),
    errorMessage: null,
  };

  await db.add(STORE_NAME, queueItem);
  return queueItem.id;
}
```

Blob을 그대로 IndexedDB에 저장할 수 있다는 게 핵심입니다. 별도 직렬화가 필요 없어요.

## 3. 업로드 처리 엔진

오프라인이면 시도조차 하지 않고, 온라인일 때만 `pending` 항목을 순회하며 업로드합니다.

```js
const UPLOAD_TIMEOUT_MS = 30_000;

export async function processUploadQueue() {
  if (!navigator.onLine) return;

  const db = await initDatabase();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const pendingItems = await tx.store.index("status").getAll("pending");

  for (const item of pendingItems) {
    try {
      await tx.store.put({ ...item, status: "uploading", lastAttempt: Date.now() });

      const formData = new FormData();
      formData.append("file", item.blob, item.fileName);
      formData.append("metadata", JSON.stringify(item.metadata));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await tx.store.delete(item.id);
    } catch (error) {
      await tx.store.put({
        ...item,
        status: "failed",
        retryCount: item.retryCount + 1,
        errorMessage: error.message,
      });
    }
  }

  await tx.done;
}
```

## 4. 자동 재시도 트리거

업로드 시도를 어떤 시점에 트리거할지가 중요합니다. 네 가지를 조합하면 거의 모든 상황을 커버할 수 있어요.

```js
// ① 네트워크 복구 시
window.addEventListener("online", processUploadQueue);

// ② 페이지 복귀 시
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && navigator.onLine) processUploadQueue();
});

// ③ 주기적 체크
setInterval(() => {
  if (navigator.onLine) processUploadQueue();
}, 60_000);

// ④ 페이지 로드 시
processUploadQueue();
```

## 5. React 컴포넌트 통합

```jsx
import { useState, useEffect } from "react";
import { initDatabase, saveFileToQueue, processUploadQueue } from "./queue";

function FileUploader() {
  const [queueCount, setQueueCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSaving, setIsSaving] = useState(false);

  const refreshQueueCount = async () => {
    const db = await initDatabase();
    const items = await db.getAll("uploadQueue");
    setQueueCount(items.length);
  };

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      processUploadQueue().then(refreshQueueCount);
    };
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    refreshQueueCount();
    processUploadQueue();
    const interval = setInterval(refreshQueueCount, 3000);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(interval);
    };
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      await saveFileToQueue(file, { uploadedBy: "user123" });
      await refreshQueueCount();
      await processUploadQueue();
      await refreshQueueCount();
    } catch (err) {
      console.error("저장 실패:", err);
    } finally {
      setIsSaving(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <div>{isOnline ? "🟢 온라인" : "🔴 오프라인"}</div>
      {queueCount > 0 && <div>📤 대기 중: {queueCount}개</div>}
      <input type="file" onChange={handleFileChange} disabled={isSaving} />
    </div>
  );
}

export default FileUploader;
```

---

## 운영 팁

### 오래된 항목 정리

재시도가 5번 이상 실패하고 일주일 지난 항목은 자동 삭제합니다.

```js
export async function cleanupOldQueue() {
  const db = await initDatabase();
  const items = await db.getAll("uploadQueue");
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const item of items) {
    if (item.createdAt < weekAgo && item.retryCount > 5) {
      await db.delete("uploadQueue", item.id);
    }
  }
}

setInterval(cleanupOldQueue, 24 * 60 * 60 * 1000);
```

### 저장 용량 모니터링

브라우저 IndexedDB 용량은 디바이스마다 다르므로 사용량을 체크합니다.

```js
export async function checkStorageQuota() {
  if (!("storage" in navigator)) return;
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();

  if (usage / quota > 0.8) {
    await cleanupOldQueue();
  }
}
```

### 수동 재시도

실패한 항목을 사용자가 직접 재시도할 수 있게 하려면:

```js
export async function manualRetry(itemId) {
  const db = await initDatabase();
  const item = await db.get("uploadQueue", itemId);
  if (item) {
    await db.put("uploadQueue", { ...item, status: "pending", retryCount: 0 });
    await processUploadQueue();
  }
}
```

---

## 기존 vs IndexedDB 큐

| 상황 | 기존 방식 | IndexedDB 큐 |
| --- | --- | --- |
| 엘리베이터 이동 | 즉시 실패, 데이터 소실 | 큐 유지, 복구 후 자동 재시도 |
| 층간 AP 전환 | 2~4초 공백에도 실패 | 짧은 공백 후 재시도 |
| 지하 주차장 | 오프라인 즉시 실패 | 다음날 자동 업로드 |
| UX | 재촬영/재선택 반복 | "저장 완료" 즉시 피드백 |

---

즉시 전송하지 말고 IndexedDB에 먼저 저장 → 네트워크 안정될 때 백그라운드에서 업로드.

같은 패턴을 초안 자동 저장, 메시지 큐, 오프라인 동기화에도 그대로 적용할 수 있습니다.
