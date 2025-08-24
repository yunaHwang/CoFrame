
import { v4 as uuid } from "uuid";

import useStore from "./Store";

const bins = {};                       
let   openId = null;                   // the "current" event bin
let   lastFlush = Promise.resolve();

const listeners = new Set();
export function subscribeFlush(fn)   { listeners.add(fn); }
export function unsubscribeFlush(fn) { listeners.delete(fn); }

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
    })
      .then(r => r.json())                 // parse once
      .then(json => {
        // notify every subscriber
        listeners.forEach(fn => fn(json));
        return json;                       // keep promise chain intact
      });

    delete bins[id];
    if (openId === id) openId = null;
  }
  return lastFlush;
}


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

export function stageDelete(parentId, data) {
  const programData = useStore.getState().programData;

  return fetch("http://localhost:5000/receive_data", {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify({
      op       : "delete",
      parentId,
      data,
      programData
    })
  })
    .then(r => r.json())          
    .then(json => {
      listeners.forEach(fn => fn(json));   
      return json;                         // keep the Promise chain intact
    });
}


export function stageBatteryWarning(level, value, scenario) {
  return fetch("http://localhost:5000/receive_data", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ op:"battery", level, value, scenario })
  }).then(r => r.json())
    .then(json => {
      listeners.forEach(fn => fn(json));   
      return json;
    });
}

export function stageScenario2SensorError(value, scenario) {
  return fetch("http://localhost:5000/receive_data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "scenario2_error", value, scenario })
  }).then(r => r.json())
    .then(json => {
      listeners.forEach(fn => fn(json));
      return json;
    });
}
export function stageScenario3PersonBlockError(value, scenario) {
  return fetch("http://localhost:5000/receive_data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "scenario3_error", value, scenario })
  }).then(r => r.json())
    .then(json => {
      listeners.forEach(fn => fn(json));
      return json;
    });
}
export function stageScenario4HeavyError(value, scenario) {
  return fetch("http://localhost:5000/receive_data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "scenario4_error", value, scenario })
  }).then(r => r.json())
    .then(json => {
      listeners.forEach(fn => fn(json));
      return json;
    });
}

export function stageScenario5CartBlock(value, scenario) {
  return fetch("http://localhost:5000/receive_data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "scenario5_cartblock", value, scenario })
  }).then(r => r.json())
    .then(json => {
      listeners.forEach(fn => fn(json));
      return json;
    });
}

export function stageScenario5PackageBlock(value, scenario) {
  return fetch("http://localhost:5000/receive_data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "scenario5_packageblock", value, scenario })
  }).then(r => r.json())
    .then(json => {
      listeners.forEach(fn => fn(json));
      return json;
    });
}


export function waitForFlush() {
  return lastFlush;
}

