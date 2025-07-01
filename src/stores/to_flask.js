
import { v4 as uuid } from "uuid";

const bins = {};                       
let   openId = null;                   // the "current" event bin
let   lastFlush = Promise.resolve();

function newEventId() {
  return `${Date.now()}-${uuid()}`;
}

function currentId() {
  if (!openId || isBinComplete(openId)) {
    openId = newEventId();             // start a fresh bin
  }
  bins[openId] ||= { op: "add", programData:null, sourceInfo:null, destInfo:null };
  return openId;
}

function isBinComplete(id) {
  const b = bins[id];
  return b && b.programData && b.sourceInfo && b.destInfo;
}

function flushIfReady(id) {
  const bin = bins[id];
  if (isBinComplete(id)) {
    const payload = { ...bin };        
    lastFlush = fetch("http://localhost:5000/receive_data", {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(payload)
    });
    delete bins[id];                   // free memory
    if (openId === id) openId = null;  // reset for next event
  }
  return lastFlush;
}

// ------------ public API -------------------
export function stageProgramData(program) {
  const id = currentId();
  bins[id].programData = program;
  return flushIfReady(id);
}

export function stageSourceInfo(src) {
  const id = currentId();
  bins[id].sourceInfo = src;
  return flushIfReady(id);
}

export function stageDestInfo(dst) {
  const id = currentId();
  bins[id].destInfo = dst;
  return flushIfReady(id);
}

export function stageDelete(data, parentId) {
  return fetch("http://localhost:5000/receive_data", {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify({
      op       : "delete",
      data,
      parentId
    })
  });
}

export function waitForFlush() {
  return lastFlush;
}






// let staged = { programData: null, sourceInfo: null, destInfo: null };
// let lastFlush = Promise.resolve();  

// function flushIfReady() {
//   const { programData, sourceInfo, destInfo } = staged;
//   if (programData && sourceInfo && destInfo) {
//     lastFlush = fetch("http://localhost:5000/receive_data", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(staged)
//     });
  
//     staged = { programData: null, sourceInfo: null, destInfo: null };
//   }
//   return lastFlush;
// }

// export function stageProgramData(p)  { staged.programData = p;  return flushIfReady(); }
// export function stageSourceInfo(s)   { staged.sourceInfo  = s;  return flushIfReady(); }
// export function stageDestInfo(d)     { staged.destInfo    = d;  return flushIfReady(); }
// export function waitForFlush()       { return lastFlush; }

// // export function sendProgramDataToFlask(programData) {
// //   lastProgramFlush = fetch("http://localhost:5000/receive_data", {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify({ programData }),
// //   });
// //   return lastProgramFlush;                 // callers may await
// // }

// // export function waitForProgramFlush() {
// //   return lastProgramFlush;                 // always the latest promise
// // }

// let lastFallbackFlush = Promise.resolve();

// export function sendFallbackActionsToFlask(fallbackActions) {
//   lastFallbackFlush = fetch("http://localhost:5000/receive_fallback_actions", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ fallbackActions }),
//   });
//   return lastFallbackFlush;
// }

// export function waitForFallbackFlush() {
//   return lastFallbackFlush;
// }

// // export function sendSourceDestInfoToFlask(sourceInfo, destInfo) {
// //   return fetch("http://localhost:5000/receive_source_dest", {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify({ sourceInfo, destInfo }),
// //   });
// // }
