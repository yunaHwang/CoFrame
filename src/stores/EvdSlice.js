// import { arrayMove, deleteAction } from './helpers';
import {pick, omit, mapValues} from "lodash";
// import { FiClipboard, FiBriefcase, FiGrid, FiBox, FiLogOut, FiMoreHorizontal, FiLayers, FiFeather } from "react-icons/fi";
import { DATA_TYPES } from "open-vp";

import typeInfo from "./typeInfo";
import actionTypes from './typeInfo/action'; // using the unflattened version aha

// import { performPoseProcess } from './planner-worker';
import { instanceTemplateFromSpec } from "open-vp";
//import { CANVAS } from "@people_and_robots/open-core";

import useCompiledStore from './CompiledStore';
import * as Comlink from "comlink";
/* eslint-disable import/no-webpack-loader-syntax */
import PlannerWorker from "./planner-worker?worker";

//import { sendProgramDataToFlask } from "./to_flask"; 
import { stageProgramData, stageSourceInfo, stageDestInfo } from "./to_flask";

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
  statusIcon,
  FixtureIconStyled
} from "./typeInfo/icons";

const cleanedObjectType = (objectType) =>
  pick(objectType, ["name", "properties", "type"]);


export const EvdSlice = (set, get) => ({
  solver: null,
  programSpec: {
    drawers: [
      {
        title: "Programs",
        dataType: DATA_TYPES.INSTANCE,
        objectTypes: ["programType"],
        icon: MachineIconStyled,
      },
      {
        title: "Fallbacks",
        dataType: DATA_TYPES.INSTANCE,
        objectTypes: ["fallbackType"],
        icon: FixtureIconStyled,
      },
      {
        title: "Action Clusters",
        dataType: DATA_TYPES.INSTANCE,
        objectTypes: ["skillType", "concurrentType"],
        icon: SkillIconStyled,
      },
      {
        title: "Action Macros",
        dataType: DATA_TYPES.INSTANCE,
        objectTypes: ["toLocationType"],
        icon: ProcessIconStyled,
      },
      {
        title: "Actions",
        dataType: DATA_TYPES.INSTANCE,
        objectTypes: [
          "moveForwardType",
          "rotateType",
          "grabType",
          "putAsideType",
          "handObjToType",
          "sayType",
          "stopStretchType",
          "saveLogStretchType",
        ],
        icon: PrimitiveIconStyled,
      },
      {
        title: "Movement",
        dataType: DATA_TYPES.REFERENCE,
        objectType: "movementType",
        icon: WaypointIconStyled,
      },

      {
        title: "Locations",
        dataType: DATA_TYPES.REFERENCE,
        objectType: "placeType",
        icon: LocationIconStyled,
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
        icon: ContainerIconStyled,
      },

      {
        title: "Speech Utterance",
        dataType: DATA_TYPES.REFERENCE,
        objectType: "speechType",
        icon: ToolIconStyled,
      },

    ],
    objectTypes: typeInfo,
  },
  programData: {},

  // A macro for updating the entire program from raw data
  addAgent: (data) =>
    set((state) => {
    state.programData = { ...state.programData, ...data };
    }, false, "addAgent"),                         // ← Zustand action name

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
  addBatterySetBlock: (level, programId) => 
    set((state) => {
      if (!programId) {
        console.warn("addBatterySetBlock: no programId - skipping");
        return;
      }

      const fallbackSetId = generateUuid("fallbackSetType");
      const fallbackId = generateUuid("fallbackType");

      const fallbackSetObj = instanceTemplateFromSpec(
        "fallbackSetType",
        state.programSpec.objectTypes["fallbackSetType"],
        false
      );
      const fallbackObj = instanceTemplateFromSpec(
        "fallbackType",
        state.programSpec.objectTypes["fallbackType"],
        false
      );

      fallbackSetObj.id = fallbackSetId;
      fallbackObj.id = fallbackId;

      fallbackSetObj.name = level === 5 ? "Priority list of fallbacks (battery 5%)" : "Priority list of fallbacks (battery 20%)";
      fallbackObj.name = level === 5 ? "Battery-Critical Fallback" : "Battery-Low Fallback";

      fallbackSetObj.position = { x: 250, y: 100 };  
      fallbackObj.position = { x: 250, y: 180 };  

      fallbackObj.properties.children = [];
      // fallbackSetObj.properties.children = [fallbackObj];
      
      state.programData[fallbackId] = fallbackObj;
      state.programData[fallbackSetId] = fallbackSetObj;

      console.log("this is fallbackSetObj, ", fallbackSetObj);


      // Hook it into the root program node
      const root = state.programData[programId];
      if (root?.type === "programType") {
        root.properties.children ??= [];
        root.properties.children.push(fallbackSetId);
        //console.log("see root.properties.children to see how to get idx, ", root.properties.children);
      }
      fallbackSetObj.properties.children = [fallbackId];

      const fallbackSetIdx = root.properties.children.length; // because it is just pushed?

      const sourceInfo = { 
        id: fallbackSetId,
        data: { id: fallbackSetId, name: fallbackSetObj.name }   // backend expects: sourceInfo["data"]["name"]
      };

      const destInfo = { 
        id: programId,
        parentId: programId,
        idx: fallbackSetIdx      
      };

      stageProgramData(state.programData);
      stageSourceInfo(sourceInfo);
      stageDestInfo(destInfo);

      state.programData = { ...state.programData };    // trigger re-render
    }, false, "addBatterySetBlock"),


  // adding new logic for battery fallback block popping
  addBatteryBlock: (level, programId) =>
    set((state) => {
      if (!programId) {
      console.warn("addBatteryBlock: no programId – skipping");
      return;
    }

      const fallbackId   = generateUuid("fallbackType");

      // Same template call you trust elsewhere
      const fallbackObj  = instanceTemplateFromSpec(
        "fallbackType",
        state.programSpec.objectTypes["fallbackType"],
        false
      );

      fallbackObj.id       = fallbackId;
      fallbackObj.name     =
        level === 5 ? "Battery-Critical Fallback" : "Battery-Low Fallback";
      fallbackObj.position = { x: 250, y: 100 };          
      fallbackObj.properties.children = [];               // starts empty

      fallbackObj.properties.errorType = [ "battery20Warning" 
        // TODO: should read directly from backend?
      ];
      console.log("this is is fallbackObj, ", fallbackObj);

      state.programData[fallbackId] = fallbackObj;

      // Hook it into the root program node
      const root = state.programData[programId];
      if (root?.type === "programType") {
        root.properties.children ??= [];
        root.properties.children.push(fallbackId);
        //console.log("see root.properties.children to see how to get idx, ", root.properties.children);
      }

      // Send this to backend as well so fallback blocks are associated with the program blocks
      // const sourceInfo = { id: fallbackId, name: fallbackObj.name };
      // const destInfo = { id: programId, name: root.name };

      const fallbackIdx = root.properties.children.length; // because it is just pushed?

      const sourceInfo = { 
        id: fallbackId,
        data: { id: fallbackId, name: fallbackObj.name }   // backend expects: sourceInfo["data"]["name"]
      };

      const destInfo = { 
        id: programId,
        parentId: programId,
        idx: fallbackIdx      
      };

      stageProgramData(state.programData);
      stageSourceInfo(sourceInfo);
      stageDestInfo(destInfo);

      state.programData = { ...state.programData };    // trigger re-render
    }, false, "addBatteryBlock"),

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

  },
  processes: {},
  reviewableChanges: 0,
  // setReviewableChanges: (reviewableChanges) => set({reviewableChanges})
});
