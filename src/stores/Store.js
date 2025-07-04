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
  setLastSourceInfo: (info) => set({ lastSourceInfo: info }),

  fallbackMode: false,
  setFallbackMode : (value) => set({fallbackMode: value}),
  batteryWarning: true,
  setBatteryWarning: (value) => set({ batteryWarning: value }),
  batteryLevel: 100,
  setbatteryLevel: (value) => set({ batteryLevel: value }),
  battery20Warning: false,
  battery5Warning: false,
  setBattery20Warning: (v) => set({ battery20Warning: v }),
  setBattery5Warning: (v) => set({ battery5Warning: v }),
  distanceTravel: 0,
  setdistanceTravel: (value) => set({ distanceTravel: value }),
  batteryErrorBlockMade20: false,
  batteryErrorBlockMade5:  false,
  setBatteryErrorBlockMade20: (v) => set({ batteryErrorBlockMade20: v }),
  setBatteryErrorBlockMade5:  (v) => set({ batteryErrorBlockMade5:  v }),

  errorMessage: null,
  setErrorMessage: (message) => set({ errorMessage: message }),
  showError: false,
  setShowError: (show) => set({ showError: show }),

  actionDeleted: false,
  setActionDeleted: (deleted) => set({ actionDeleted: deleted }),

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
    warn5 : state.battery5Warning
  }),
  (curr, prev) => {
    const store = useStore.getState();

    // Fire once when each flag flips false → true
    if (curr.warn20 && !prev.warn20) {
      if (!store.batteryErrorBlockMade20) {
        //added
        // useStore.getState().addCheckpointBlock(20);
        // useCompiledStore.setState({});
        // useStore.getState().performCompileProcess();
        
        useStore.getState().addBatteryBlock(20);
        store.batteryErrorBlockMade20 = true;
        useCompiledStore.setState({});
        useStore.getState().performCompileProcess();
      }
    }
    if (curr.warn5 && !prev.warn5) {
      if (!store.batteryErrorBlockMade5) {
        //added
        // useStore.getState().addCheckpointBlock(5);
        // useCompiledStore.setState({});
        // useStore.getState().performCompileProcess();

        useStore.getState().addBatteryBlock(5);
        store.batteryErrorBlockMade5 = true;
        useCompiledStore.setState({});
        useStore.getState().performCompileProcess();
      }
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
  const skillName    = `Action Cluster ${new Date().toLocaleTimeString()}`;
  const emptyActions = [];      // nothing inside yet
  useStore.getState().addSkillWithActions(skillName, emptyActions);
  useCompiledStore.setState({});
  useStore.getState().performCompileProcess();

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
