let staged = { programData: null, sourceInfo: null, destInfo: null };
let lastFlush = Promise.resolve();  

function flushIfReady() {
  const { programData, sourceInfo, destInfo } = staged;
  if (programData && sourceInfo && destInfo) {
    lastFlush = fetch("http://localhost:5000/receive_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staged)
    });
  
    staged = { programData: null, sourceInfo: null, destInfo: null };
  }
  return lastFlush;
}

export function stageProgramData(p)  { staged.programData = p;  return flushIfReady(); }
export function stageSourceInfo(s)   { staged.sourceInfo  = s;  return flushIfReady(); }
export function stageDestInfo(d)     { staged.destInfo    = d;  return flushIfReady(); }
export function waitForFlush()       { return lastFlush; }

// export function sendProgramDataToFlask(programData) {
//   lastProgramFlush = fetch("http://localhost:5000/receive_data", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ programData }),
//   });
//   return lastProgramFlush;                 // callers may await
// }

// export function waitForProgramFlush() {
//   return lastProgramFlush;                 // always the latest promise
// }

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
