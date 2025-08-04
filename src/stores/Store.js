import { create } from "zustand";
import { shallow } from "zustand/shallow";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { GuiSlice } from "./GuiSlice";
import { ReviewSlice } from "./ReviewSlice";
import { EvdSlice } from "./EvdSlice";
import { RosSlice } from "./RosSlice";
import { ProgrammingSlice } from "open-vp";
import { ProgrammingSliceOverride } from "./ProgrammingSlice";
import {
  computedSliceCompiledSubscribe,
  computedSliceSubscribe,
} from "./ComputedSlice";
import { SceneSlice } from "robot-scene";
import lodash from "lodash";
// import KnifeAssembly from "./Knife_Assembly_Simple_VP_UR5.json";
//import KnifeAssembly from "./Empty_Program.json";
import KnifeAssembly from "./Yuna_Skeleton_Program.json" // uncomment this to work with a failing skeleton json
// import KnifeAssemblyCompiled from "./UR5_Compiled_Knife_Assembly.json";
// import KnifeAssembly from './Prime_Process_2_v29.json';
import KnifeAssemblyCompiled from "./Knife_Assembly_Example_Compiled.json";
import TestProgram2 from "./TestProgram2.json";
// import PandaDemo from "./Panda_Demo.json";
import { STATUS } from "./Constants";
import useCompiledStore from "./CompiledStore";
import { Timer } from "./Timer";
import { mapValues } from "lodash";
import { ProgramStoreSlice } from "./ProgramStoreSlice";
// import { TauriStorage } from "./TauriStorage";

const store = (set, get) => ({
  loaded: false,
  setLoaded: (loaded) => {
    console.log('new loaded',loaded);
    set({loaded});
    console.log('new loaded test',get().loaded);
  },
  ...SceneSlice(set, get),
  ...ProgrammingSlice(set, get), // default programming slice for open-vp
  ...ProgrammingSliceOverride(set, get), // overrides data-editing functionality to update pending properties
  ...GuiSlice(set, get),
  ...ReviewSlice(set, get),
  ...EvdSlice(set, get),
  ...RosSlice(set, get),
  ...ProgramStoreSlice(set, get),

  // added to keep track of sourceInfo (aka the name of the action during transferblock) so that icons move
  lastSourceInfo: null,
  lastTransfer: null,
  setLastSourceInfo: (info) => set({ lastSourceInfo: info }),

  fallbackMode: false,
  setFallbackMode : (value) => set({fallbackMode: value}),

  globalBatteryLevel: 100,
  setGlobalBatteryLevel: (val) => set({ globalBatteryLevel: val }),

  batteryWarning: true,
  setBatteryWarning: (value) => set({ batteryWarning: value }),

  batteryLevel: 100,
  setbatteryLevel: (value) => set({ batteryLevel: value }),
  
  //battery warnings for error popping
  battery20Warning: false,
  battery5Warning: false,
  setBattery20Warning: (v) => set({ battery20Warning: v }),
  setBattery5Warning: (v) => set({ battery5Warning: v }),

  //sensor warning for error popping
  sensorWarning: false,
  setSensorWarning: (v) => set({ sensorWarning : v}),

  distanceTravel: 0,
  setdistanceTravel: (value) => set({ distanceTravel: value }),

  batteryErrorBlockMade20: false,
  batteryErrorBlockMade5:  false,
  setBatteryErrorBlockMade20: (v) => set({ batteryErrorBlockMade20: v }),
  setBatteryErrorBlockMade5:  (v) => set({ batteryErrorBlockMade5:  v }),

  scenario2ErrorBlockMade: false,
  setScenario2ErrorBlockMade: (v) => set({ scenario2ErrorBlockMade: v }),
  scenario3ErrorBlockMade: false,
  setScenario3ErrorBlockMade: (v) => set({ scenario3ErrorBlockMade: v }),
  scenario4ErrorBlockMade: false,
  setScenario4ErrorBlockMade: (v) => set({ scenario4ErrorBlockMade: v }),

  scenario5CartErrorBlockMade: false,
  setScenario5CartErrorBlockMade: (v) => set({ scenario5CartErrorBlockMade: v }),
  scenario5PackageErrorBlockMade: false,
  setScenario5PackageErrorBlockMade: (v) => set({ scenario5PackageErrorBlockMade: v }),
  
  
  
  deletedFieldInfo: null,
  deletedParentInfo: null,
  deletedData: null,
  deletedData: (info) => set({ deletedData: info }),
  setDeletedFieldInfo: (info) => set({ deletedFieldInfo: info }),
  setDeletedParentInfo: (info) => set({ deletedParentInfo: info }),
  robotOrientation: "E", 
  setRobotOrientation: (orientation) => set({ robotOrientation: orientation }),

  actionMessage: null,
  setActionMessage: (msg) => {
    set({ actionMessage: msg });
    setTimeout(() => set({ actionMessage: null }), 5000);
  },

  clean: true,
  setClean: (v) => set({clean: v}),

  chargePending: false,
  setChargePending: (v) => set({ chargePending: v }),

  showBatteryCharged: false,
  setShowBatteryCharged: (v) => set({ showBatteryCharged: v }),

  actionTracking: [],
  setActionTracking: (val) => set({ actionTracking: val }),

  batteryResetActionCount: 0,
  setBatteryResetActionCount: (val) => set({ batteryResetActionCount: val }),


  errorMessage: null,
  setErrorMessage: (message) => set({ errorMessage: message }),
  showError: false,
  setShowError: (show) => set({ showError: show }),

  actionDeleted: false,
  setActionDeleted: (deleted) => set({ actionDeleted: deleted }),

  currentProgramId: null,
  currentFallbackTypeId: null,
  setCurrentFallbackTypeId: (id) => set({ currentFallbackTypeId: id }),


  clock: new Timer(),
  playing: true,
  pause: () => {
    set({playing:false});
    get().clock.setTimescale(0);
  },
  play: (speed) => {
    set({playing:true});
    get().clock.setTimescale(speed ? speed : 1);
  },
  reset: (time) => {
    get().clock._elapsed = time ? time * 1000 : 0;
  },
  tabs: [
    {
      title:'Main',
      id: 'default',
      visible: true,
      blocks: []
    }
  ],
  updateItemDocActive: (id, value) => {
    set((state) => {
      console.log("setting doc active to ", value);
      state.programData = mapValues(state.programData,d=>({
        ...d,
        docActive: id === d.id && value ? true : false
      }))
    });
  },
  activeTab:'default',
  reviewExpanded: true,
  setReviewExpanded: (expanded) => set(state=>{state.reviewExpanded = expanded})
});

const immerStore = immer(store);
const subscribeStore = subscribeWithSelector(immerStore);

const useStore = create(subscribeStore);

useStore.subscribe(
  (state) =>
    lodash.mapValues(state.programData, (value) => {
      return value?.properties?.pendingChanges
        ? value.properties.pendingChanges
        : 0;
    }),
  (currentStatuses, previousStatuses) => {
    if (
      Object.keys(currentStatuses).some(
        (id) =>
          currentStatuses[id] > previousStatuses[id]
      )
    ) {
      console.log("REPLANNING");
      useStore.getState().performCompileProcess();
    }

    // const data = useStore.getState();
    // console.log(data);
    // performCompileProcess({programData:data.programData,objectTypes:data.programSpec.objectTypes})
  },
  { equalityFn: shallow }
);

useStore.subscribe(
  state => ({  // selector returns *both* flags
    warn20: state.battery20Warning,
    warn5 : state.battery5Warning,
    scenario2Sensor: state.scenario2ErrorBlockMade,
    scenario3Person: state.scenario3ErrorBlockMade,
    scenario4Heavy: state.scenario4ErrorBlockMade,
    scenario5Cart: state.scenario5CartErrorBlockMade,
    scenario5Package: state.scenario5PackageErrorBlockMade,

  }),
  (curr, prev) => {
    const store = useStore.getState();
    const programId = store.currentProgramId;
    console.log("current programId, ", programId);

    if (!programId) return; 

    let added = false;

    console.log("curr.warn20", curr.warn20, "prev.warn20", prev.warn20);
    console.log("curr.warn5", curr.warn5, "prev.warn5", prev.warn5);

    // console.log("curr.scenario2Sensor ", curr.scenario2Sensor );
    // console.log("prev.scenario2Sensor", prev.scenario2Sensor);
    // console.log("store.scenario2ErrorBlockMade, ", store.scenario2ErrorBlockMade);

    // BATTERY ERROR should always precede any other errors
    if (curr.warn20 && !prev.warn20) {
    //console.log("is it flipped or what, printing if it's going to go in the if condition, ", store.batteryErrorBlockMade20);
      if (!store.batteryErrorBlockMade20) {

        
        useStore.getState().addBatterySetBlock(20, programId);
        //store.batteryErrorBlockMade20 = true;
        useStore.setState((s) => { s.batteryErrorBlockMade20 = true });
        added = true;
      }
    }

    // TODO: maybe get rid of prev, here?
    if (curr.warn5 && !prev.warn5) {
        if (!store.batteryErrorBlockMade5) {


          useStore.getState().addBatterySetBlock(5, programId);
          //store.batteryErrorBlockMade5 = true;
          useStore.setState((s) => { s.batteryErrorBlockMade5 = true });
          added = true;
          console.log("this battery5 block is done");
        }
      }
    // SENSOR/PERSON BLOCK/TOO HEAVY/CART BLOCK/PACKAGE BLOCK ERROR(s) 
    if (curr.scenario2Sensor && !prev.scenario2Sensor) {
      setTimeout(() => {
        // try to give a slight delay?
        useStore.getState().addScenario2ErrorSetBlock(programId);
        useStore.setState(s => { s.scenario2ErrorBlockMade = true });

        useCompiledStore.setState({});
        useStore.getState().performCompileProcess();
      }, 30);

    }

    if (curr.scenario3Person && !prev.scenario3Person) {
      setTimeout(() => {
        // try to give a slight delay?
        useStore.getState().addScenario3ErrorSetBlock(programId);
        useStore.setState(s => { s.scenario3ErrorBlockMade = true });

        useCompiledStore.setState({});
        useStore.getState().performCompileProcess();
      }, 30);

    }

    if (curr.scenario4Heavy && !prev.scenario4Heavy) {
      setTimeout(() => {
        // try to give a slight delay?
        useStore.getState().addScenario4ErrorSetBlock(programId);
        useStore.setState(s => { s.scenario4ErrorBlockMade = true });

        useCompiledStore.setState({});
        useStore.getState().performCompileProcess();
      }, 30);

    }

    if (curr.scenario5Cart && !prev.scenario5Cart) {
      setTimeout(() => {
        // try to give a slight delay?
        useStore.getState().addScenario5CartErrorSetBlock(programId);
        useStore.setState(s => { s.scenario5CartErrorBlockMade = true });

        useCompiledStore.setState({});
        useStore.getState().performCompileProcess();
      }, 30);

    }

    if (curr.scenario5Package && !prev.scenario5Package) {
      setTimeout(() => {
        // try to give a slight delay?
        useStore.getState().addScenario5PackageErrorSetBlock(programId);
        useStore.setState(s => { s.scenario5PackageErrorBlockMade = true });

        useCompiledStore.setState({});
        useStore.getState().performCompileProcess();
      }, 30);

    }

    if (added) {
      useCompiledStore.setState({});
      store.performCompileProcess();
    }


  }
);


// Create subscribers for scene data
computedSliceSubscribe(useStore);

if (Object.keys(useStore.getState().programData).length === 0) {
  console.log("Setting with Knife Assembly Task");
  // Load all the programs
  useStore.getState().addProgramData("KnifeAssembly", KnifeAssembly, {});
  // useStore.getState().addProgramData("testProgram2", TestProgram2, {});
  useStore.getState().setData(KnifeAssembly);

  // also start with empty skills block
  // const skillName    = `Action Cluster ${new Date().toLocaleTimeString()}`;
  // const emptyActions = [];      // nothing inside yet
  // useStore.getState().addSkillWithActions(skillName, emptyActions);
  // useCompiledStore.setState({});
  // useStore.getState().performCompileProcess();

  // ORIGINAL
  // Set the starting program
  // useCompiledStore.setState({});
  // useStore.getState().setData(KnifeAssembly);
  // useStore.getState().performCompileProcess();
  // useStore.persist.rehydrate()
}



// if (Object.keys(useStore.getState().programData).length === 0) {
//   // this is not the final thing I settled upon but it IS working in a sense that the UI is rendering
//   // comment out computedSliceCompile (and its Subscribe version) when uncommenting this code block
//   const emptyProgram = {
//     name: "EmptyProgram",
//     instances: {
//       // optional: one minimal instance so UI/scene code can read transform safely
//       defaultInstance: {
//         id: "defaultInstance",
//         type: "thingType",
//         properties: {},
//         transform: {
//           position: { x: 0, y: 0, z: 0 },
//           rotation: { x: 0, y: 0, z: 0 }
//         }
//       }
//   },
//   connections: [],
//   metadata: {}
// };

//   useStore.getState().addProgramData("DevProgram", emptyProgram, {});
//   useCompiledStore.setState({});
//   useStore.getState().setData(emptyProgram);
//   useStore.getState().performCompileProcess();
// }


computedSliceCompiledSubscribe(useCompiledStore, useStore);

export default useStore;
