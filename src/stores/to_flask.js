// src/api.js
let lastProgramFlush = Promise.resolve();   // shared Promise

export function sendProgramDataToFlask(programData) {
  lastProgramFlush = fetch("http://localhost:5000/receive_data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ programData }),
  });
  return lastProgramFlush;                 // callers may await
}

export function waitForProgramFlush() {
  return lastProgramFlush;                 // always the latest promise
}

let lastFallbackFlush = Promise.resolve();

export function sendFallbackActionsToFlask(fallbackActions) {
  lastFallbackFlush = fetch("http://localhost:5000/receive_fallback_actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fallbackActions }),
  });
  return lastFallbackFlush;
}

export function waitForFallbackFlush() {
  return lastFallbackFlush;
}

// export function sendSourceDestInfoToFlask(sourceInfo, destInfo) {
//   return fetch("http://localhost:5000/receive_source_dest", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ sourceInfo, destInfo }),
//   });
// }
