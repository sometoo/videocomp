/* ============================================================
   coi-serviceworker.js  (GitHub Pages 전용)
   Cross-Origin Isolation을 Service Worker로 구현합니다.
   → COOP / COEP 헤더를 클라이언트 측에서 주입하여
     SharedArrayBuffer를 활성화합니다. (FFmpeg.wasm 필수)
   ============================================================ */

/* 설치 즉시 활성화 */
self.addEventListener("install", () => self.skipWaiting());

/* 활성화 후 모든 탭 즉시 제어 */
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* 모든 fetch 요청 가로채기 */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // GET 이외 메서드 (POST 등) 는 그냥 통과
  if (req.method !== "GET") return;

  // only-if-cached 는 same-origin 에서만 동작
  if (req.cache === "only-if-cached" && req.mode !== "same-origin") return;

  const isSameOrigin = new URL(req.url).origin === self.location.origin;

  event.respondWith(
    fetch(req)
      .then((response) => {
        // 오류 응답 또는 opaque 응답은 그대로 반환
        if (response.status === 0) return response;

        const headers = new Headers(response.headers);

        if (isSameOrigin) {
          // 동일 출처 리소스: COOP + COEP 헤더 추가
          headers.set("Cross-Origin-Opener-Policy", "same-origin");
          headers.set("Cross-Origin-Embedder-Policy", "require-corp");
        } else {
          // 외부 CDN 리소스 (unpkg 등): CORP 헤더 추가
          // → COEP 환경에서도 로드될 수 있도록 허용
          if (!headers.has("Cross-Origin-Resource-Policy")) {
            headers.set("Cross-Origin-Resource-Policy", "cross-origin");
          }
        }

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      })
      .catch(() => fetch(req)) // 실패 시 원래 요청으로 폴백
  );
});
