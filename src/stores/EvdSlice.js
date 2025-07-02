// import { arrayMove, deleteAction } from './helpers';
import {pick, omit, mapValues} from "lodash";
// import { FiClipboard, FiBriefcase, FiGrid, FiBox, FiLogOut, FiMoreHorizontal, FiLayers, FiFeather } from "react-icons/fi";
import { DATA_TYPES } from "open-vp";

import typeInfo from "./typeInfo";
import actionTypes from './typeInfo/action'; // using the unflattened version aha

// import { performPoseProcess } from './planner-worker';
import { instanceTemplateFromSpec } from "open-vp";
import useCompiledStore from './CompiledStore';
import * as Comlink from "comlink";
/* eslint-disable import/no-webpack-loader-syntax */
import PlannerWorker from "./planner-worker?worker";

//import { sendProgramDataToFlask } from "./to_flask"; 
import { stageProgramData } from "./to_flask";

import { generateUuid } from "./generateUuid";

// const plannerWorkerUrl = new URL('./planner-worker.js',import.meta.url);
// const workerInstance = new ComlinkWorker(plannerWorkerUrl,{});
// console.warn('workerInstance',workerInstance)

import {
  LocationIconStyled,
  PrimitiveIconStyled,
  MachineIconStyled,
  ProcessIconStyled,
  SkillIconStyled,
  ThingIconStyled,
  WaypointIconStyled,
  ContainerIconStyled,
  ToolIconStyled,
} from "./typeInfo/icons";

const cleanedObjectType = (objectType) =>
  pick(objectType, ["name", "properties", "type"]);

// const sendProgramDataToFlask = async (programData) => {
//   console.log("Attempting to send programData:", programData);
//   try {
//     const res = await fetch("http://localhost:5000/receive_data", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ programData }),
//     });
//     const result = await res.json();
//     console.log("Flask response:", result);
//   } catch (err) {
//     console.error("Error sending data to Flask:", err);
//   }
// };


export const EvdSlice = (set, get) => ({
  solver: null,
  programSpec: {
    drawers: [
      {
        title: "Action Clusters",
        dataType: DATA_TYPES.INSTANCE,
        objectTypes: ["skillType"],
        icon: SkillIconStyled,
      },

      // Icon is FiGrid, otherwise no icons show in the drawer
      {
        // in typeInfo > action.js > "moveGripperType"
        title: "Actions",
        dataType: DATA_TYPES.INSTANCE,
        objectTypes: [
          //"moveGripperType",
          //"closeGripperType",
          "grabType",
          "placeAsideType",
          //"lookForType",
          "handObjToType",
          "stopStretchType",
          "saveLogStretchType",
          "sayType",
          "moveForwardType",
          "rotateType",
          "slowerStretchType",
          "fasterStretchType",
        ],
        icon: PrimitiveIconStyled,
      },

      {
        title: "Objects",
        dataType: DATA_TYPES.REFERENCE,
        objectType: "thingType",
        icon: ThingIconStyled,
      },

      {
        title: "People",
        dataType: DATA_TYPES.REFERENCE,
        objectType: "personType",
        icon: WaypointIconStyled,
      },

      {
        title: "Speech Utterance",
        dataType: DATA_TYPES.REFERENCE,
        objectType: "speechType",
        icon: SkillIconStyled,
      },

      {
        title: "Directionality",
        dataType: DATA_TYPES.REFERENCE,
        objectType: "directionalityType",
        icon: ProcessIconStyled,
      },

      {
        title: "Action Macros",
        dataType: DATA_TYPES.INSTANCE,
        objectTypes: ["toLocationType", "concurrentType"],
        icon: LocationIconStyled,
      },

      {
        title: "Locations",
        dataType: DATA_TYPES.REFERENCE,
        objectType: "placeType",
        icon: WaypointIconStyled,
      },
    ],
    objectTypes: typeInfo,
  },
  programData: {},
  // All the old stuff below
  // data: {
  //   "program-484de43e-adaa-4801-a23b-bca38e211365": {
  //     "name": "Knife Assembly",
  //     "editable": true,
  //     "deleteable": false,
  //     "description": "The top-level program",
  //     "parameters": {},
  //     "children": [],
  //     "transform": { "x": 0, "y": 0 }
  //   }
  // },
  // A macro for updating the entire program from raw data
  addAgent: (data) =>
    set((state) => {
    state.programData = { ...state.programData, ...data };
    }, false, "addAgent"),                         // ← Zustand action name
    // ) &&                                          // ← after-set side-effect
    // sendProgramDataToFlask(get().programData),    // flush & store Promise
    // set((state) => {

    //   //added
    //   const after = Object.keys(state.programData).concat(Object.keys(data));
    //   console.log("catch every single drawer in UI? ", after);

    //   state.programData = { ...state.programData, ...data };
    // }),
  replaceAgent: (newData) => set((state)=>{
    //console.log("or is it here replaceAgent? ", newData); // this shows up as soon the UI renders
    const agent = Object.values(newData).filter(d=>d.type==='robotAgentType')[0];
    // Delete any links, meshes, collisionBodies, collisionShapes that are associated with this agent
    Object.values(state.programData).forEach(value=>{
      if (value.type === 'linkType' && value.properties?.agent !== agent.id) {
        if (value.properties.mesh && state.programData[value.properties.mesh]) {
          // Delete mesh
          delete state.programData[value.properties.mesh]
        }
        if (value.properties.collision && state.programData[value.properties.collision]) {
          state.programData[value.properties.collision].properties.componentShapes.forEach(componentShape=>{
            // delete collisionShape
            delete state.programData[componentShape]
          })
          // delete collisionBody
          delete state.programData[value.properties.collision]
        }
        // Delete link
        delete state.programData[value.id]
      }
    });
    
    // Move over robot zones
    Object.values(state.programData)
        .filter(d=>d.type==='zoneType' && state.programData[d.properties.agent].type === 'robotAgentType' && d.properties.agent !== agent.id)
        .forEach((zone)=>{
          state.programData[zone.id].properties.agent = agent.id
    });

    // Delete the agent
    Object.values(state.programData).filter(d=>d.type==='robotAgentType').forEach(robotAgent=>{
      delete state.programData[robotAgent.id]
    })

    state.programData = {...state.programData,...newData}
  }),
  setData: (data) =>
    set((state) => {
      const {tabs, activeTab, ...programData} = data;
      const newData = mapValues(programData, (d) => {
        if (d.dataType === DATA_TYPES.INSTANCE) {
          const defaultv = instanceTemplateFromSpec(
            d.type,
            state.programSpec.objectTypes[d.type],
            false
          );
          return {
            ...d,
            properties: {
              ...defaultv.properties,
              ...omit(d.properties, [
                "status",
                "compiled",
                "compileFn",
                "updateFields",
              ]),
            },
          };
        } else {
          return d;
        }
      });
      console.log("or is it here? ", newData);
      state.programData = newData;
      state.loaded = true;
      if (tabs) {
        state.tabs = tabs
      }
      if (activeTab) {
        state.activeTab = activeTab
      }
    }),
  // setData: (data) => set((_) => ({ programData: data})),
  updatePoseJoints: (id, value, process) =>
    set((state) => {
      state.programData[id].joints = value;
      state.processes[id] = process;
    }),
  updatePlanProcess: (newData, process) =>
    set((state) => {
      if (newData) {
        console.log("this is newData, ", newData);
        let reviewableChanges = 0;
        // state.programData = lodash.merge(state.programData, newData);
        Object.keys(newData).forEach((entry) => {
          reviewableChanges += 1;
          newData[entry].properties.pendingChanges = 0;
          Object.keys(newData[entry].properties)
            .forEach((field) => {
              if (field !== 'compiled') {
                state.programData[entry].properties[field] =
                  newData[entry].properties[field];
              }
          });
        });
        state.reviewableChanges += reviewableChanges;
      }
      state.processes.planProcess = process;
      // console.log(useCompiledStore.getState())
    }),
// adding new logic for battery checkpoint popping
// huh i don't know why it hates this - TypeError: Cannot read properties of undefined (reading 'onCanvas')
  addCheckpointBlock: (level /* 20 or 5 */) =>
    set((state) => {
      const batteryId   = generateUuid("batteryType");

      // Same template call you trust elsewhere
      const batteryObj  = instanceTemplateFromSpec(
        "batteryType",
        state.programSpec.objectTypes["batteryType"],
        false
      );
      console.log("what does batteryObj look like, ", batteryObj);

      // Fill in the bits you care about
      batteryObj.id       = batteryId;
      batteryObj.name     =
        level === 5 ? "Battery-Critical!" : "Battery-Low!";
      batteryObj.position = { x: 250, y: 100 };          // tweak as you like
      //batteryObj.onCanvas = false;
      batteryObj.properties.children = [];               // starts empty

      state.programData[batteryId] = batteryObj;

      // Hook it into the root program node
      const root = Object.values(state.programData)
        .find((b) => b.type === "programType");
      if (root) {
        root.properties.children ??= [];
        root.properties.children.push(batteryId);
      }

      state.programData = { ...state.programData };    // trigger re-render
    }, false, "addCheckpointBlock"),

  // adding new logic for battery fallback block popping
  addBatteryBlock: (level /* 20 or 5 */) =>
    set((state) => {
      const fallbackId   = generateUuid("fallbackType");

      // Same template call you trust elsewhere
      const fallbackObj  = instanceTemplateFromSpec(
        "fallbackType",
        state.programSpec.objectTypes["fallbackType"],
        false
      );

      // Fill in the bits you care about
      fallbackObj.id       = fallbackId;
      fallbackObj.name     =
        level === 5 ? "Battery-Critical Fallback" : "Battery-Low Fallback";
      fallbackObj.position = { x: 250, y: 100 };          // tweak as you like
      fallbackObj.properties.children = [];               // starts empty

      state.programData[fallbackId] = fallbackObj;

      // Hook it into the root program node
      const root = Object.values(state.programData)
        .find((b) => b.type === "programType");
      if (root) {
        root.properties.children ??= [];
        root.properties.children.push(fallbackId);
      }

      state.programData = { ...state.programData };    // trigger re-render
    }, false, "addBatteryBlock"),


  // addBatteryBlock: (level) =>
  //   set((state) => {
  //     const batteryId = generateUuid("batteryType")
  //     const batteryObj = state.programData[batteryId] = instanceTemplateFromSpec(
  //       "batteryType",
  //       state.programSpec.objectTypes["batteryType"],
  //       false
  //     );

  //     const label = level === 5 ? "Critical Battery Level"
  //                              : "Low Battery Level";
  //     batteryObj.id = batteryId;
  //     batteryObj.name = label;
  //     batteryObj.position = { x: 200, y: 60 }; 

  //     state.programData[batteryId] = batteryObj;
      
  //     const root = Object.values(state.programData)
  //       .find((b) => b.type === "programType");
  //     if (root) {
  //       root.properties.children ??= [];
  //       root.properties.children.push(batteryId);   //last in order
  //     }

  //     state.programData = { ...state.programData };
  //   }, false, "addBatteryErrorBlock"),
  

  // adding new logic for adding the skill block with actions
  addSkillWithActions: (skillName, actionsData) =>
    set((state) => {
      const skillId = generateUuid("skillType")
      state.programData[skillId] = instanceTemplateFromSpec(
      "skillType",
      state.programSpec.objectTypes["skillType"],
      false
    );
      state.programData[skillId].id        = skillId;
      state.programData[skillId].name      = skillName || "New Skill";
      state.programData[skillId].position  = { x: 200, y: 60 }; 
      state.programData[skillId].properties.children = [];

      actionsData.forEach((raw, idx) => {
        const typeName = raw.type;
        //console.log("what is the typeName here, ", typeName);
        //console.log("is this none, ", actionTypes[typeName]);
        if (!actionTypes[typeName]) return;          // ignore unknown types

        const actId  = generateUuid(typeName);
        const actObj = instanceTemplateFromSpec(
          typeName,
          state.programSpec.objectTypes[typeName],
          false
        );

      Object.assign(actObj.properties, raw.data?.properties ?? {});

      actObj.id       = actId;
      actObj.name     = raw.name || actObj.name;
      actObj.position = { x: 400, y: 60 + idx * 120 };

      state.programData[actId] = actObj;
      state.programData[skillId].properties.children.push(actId);
    });

      const root = Object.values(state.programData)
        .find((b) => b.type === "programType");
      if (root) {
        root.properties.children ??= [];
        root.properties.children.push(skillId);   //last in order
      }

      state.programData = { ...state.programData };
  }, false, "addSkillWithActions"),

  performCompileProcess: async () => {
    console.log('starting plan processing')
    const currentProcess = get().processes.planProcess;
    if (currentProcess) {
      console.log('terminating current plan process')
      currentProcess.terminate();
    }
    // Create a new worker
    const plannerWorker = new PlannerWorker();
    const { performCompileProcess } = Comlink.wrap(plannerWorker);
    get().updatePlanProcess(null, plannerWorker);
    const programData = get().programData;
    console.log("what does this look like, ", programData); // this also shows as soon as the UI renders
    // everytime a new block is added (transferBlock), then this gets updated, along with 
    // log -> transferBlock, data, sourceInfo, destInfo, REPLANNING, starting plan processing, terminating current plan process,
    // and then "what does this look like"
    //await sendProgramDataToFlask(programData);
    await stageProgramData(programData);
    
    console.log('sent from React!')
    console.log('step 1')
    const result = await performCompileProcess({
      programData,
      compiledData: useCompiledStore.getState(),
      objectTypes: mapValues(
        get().programSpec.objectTypes,
        cleanedObjectType
      ),
    });
    get().updatePlanProcess(result.data, null);

    // // Update the compiled store
    for (const key in result.compiledData) {
      useCompiledStore.setState({[key]:result.compiledData[key]})
    }

    //await sendProgramDataToFlask(programData);
    //console.log("Sent from React!");
  },
  processes: {},
  reviewableChanges: 0,
  // setReviewableChanges: (reviewableChanges) => set({reviewableChanges})
});
