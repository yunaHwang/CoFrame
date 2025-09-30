import { create } from "zustand";
import { shallow } from "zustand/shallow";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { GuiSlice } from "./GuiSlice";
import { EvdSlice } from "./EvdSlice";
import { ProgrammingSlice } from "open-vp";
import { ProgrammingSliceOverride } from "./ProgrammingSlice";
import {
  computedSliceCompiledSubscribe,
  computedSliceSubscribe,
} from "./ComputedSlice";
import lodash from "lodash";
import roboplanb from "./RoboPlanB.json" 
import useCompiledStore from "./CompiledStore";
import { Timer } from "./Timer";
import { mapValues } from "lodash";
import { ProgramStoreSlice } from "./ProgramStoreSlice";

const store = (set, get) => ({
  loaded: false,
  setLoaded: (loaded) => {
    console.log('new loaded',loaded);
    set({loaded});
    console.log('new loaded test',get().loaded);
  },
  ...ProgrammingSlice(set, get), // default programming slice for open-vp
  ...ProgrammingSliceOverride(set, get), // overrides data-editing functionality to update pending properties
  ...GuiSlice(set, get),
  ...EvdSlice(set, get),
  ...ProgramStoreSlice(set, get),

  // added to keep track of sourceInfo (aka the name of the action during transferblock) so that icons move
  lastSourceInfo: null,
  lastTransfer: null,
  setLastSourceInfo: (info) => set({ lastSourceInfo: info }),

  fallbackMode: false,
  setFallbackMode : (value) => set({fallbackMode: value}),

  globalBatteryLevel: 100, // change when testing
  setGlobalBatteryLevel: (val) => set({ globalBatteryLevel: val }),

  globalDistanceTravel: 0, // change when testing
  setGlobalDistanceTravel: (val) => set({ globalDistanceTravel: val }),


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

  //person block warning for error popping
  personBlockWarning: false,
  setPersonBlockWarning: (v) => set({ personBlockWarning : v}),

  // heavy warning for error popping
  heavyWarning: false,
  setHeavyWarning: (v) => set({ heavyWarning: v }),

  // [5-1] cart/fence warning for error popping
  cartBlockWarning: false,
  setCartBlockWarning: (v) => set({ cartBlockWarning : v}),

  // [5-2] package blocking warning for error popping
  packageBlockWarning: false,
  setPackageBlockWarning: (v) => set({ packageBlockWarning : v}),

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

  perScenarioOffsets: {},
  setScenarioOffset: (scenario, offset) =>
    set((state) => ({
      perScenarioOffsets: {
        ...state.perScenarioOffsets,
        [scenario]: offset
      }
    })),

  getScenarioOffset: (scenario) => {
    const state = get();
    return state.perScenarioOffsets[scenario] || { x: 0, y: 0 };
  },
  
  
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

  // booleans used for failure/warnings clearing off
  showBatteryCharged: false,
  setShowBatteryCharged: (v) => set({ showBatteryCharged: v }),
  showSensorCleared: false,
  setShowSensorCleared: (v) => set({ showSensorCleared: v }),
  showPersonblockCleared: false,
  setShowPersonblockCleared: (v) => set({ showPersonblockCleared: v }),
  showHeavyCleared: false,
  setShowHeavyCleared: (v) => set({ showHeavyCleared: v }),
  showCartblockCleared: false,
  setShowCartblockCleared: (v) => set({ showCartblockCleared: v }),
  showPackageblockCleared: false,
  setShowPackageblockCleared: (v) => set({ showPackageblockCleared: v }),

  actionTracking: [],
  setActionTracking: (val) => set({ actionTracking: val }),

  batteryResetActionCount: 0,
  setBatteryResetActionCount: (val) => set({ batteryResetActionCount: val }),
  distanceResetActionCount: 0,
  setDistanceResetActionCount: (val) => set({ distanceResetActionCount: val }),


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

    // BATTERY ERROR should always precede any other errors
    if (curr.warn20 && !prev.warn20) {
      if (!store.batteryErrorBlockMade20) {
        useStore.getState().addBatterySetBlock(20, programId);
        useStore.setState((s) => { s.batteryErrorBlockMade20 = true });
        added = true;
      }
    }

    if (curr.warn5 && !prev.warn5) {
        if (!store.batteryErrorBlockMade5) {
          useStore.getState().addBatterySetBlock(5, programId);
          useStore.setState((s) => { s.batteryErrorBlockMade5 = true });
          added = true;
        }
      }
    // SENSOR/PERSON BLOCK/TOO HEAVY/CART BLOCK/PACKAGE BLOCK ERROR(s) 
    if (curr.scenario2Sensor && !prev.scenario2Sensor) {
      setTimeout(() => {
        useStore.getState().addScenario2ErrorSetBlock(programId);
        useStore.setState(s => { s.scenario2ErrorBlockMade = true });

        useCompiledStore.setState({});
        useStore.getState().performCompileProcess();
      }, 30);

    }

    if (curr.scenario3Person && !prev.scenario3Person) {
      setTimeout(() => {
        useStore.getState().addScenario3ErrorSetBlock(programId);
        useStore.setState(s => { s.scenario3ErrorBlockMade = true });

        useCompiledStore.setState({});
        useStore.getState().performCompileProcess();
      }, 30);

    }

    if (curr.scenario4Heavy && !prev.scenario4Heavy) {
      setTimeout(() => {
        useStore.getState().addScenario4ErrorSetBlock(programId);
        useStore.setState(s => { s.scenario4ErrorBlockMade = true });

        useCompiledStore.setState({});
        useStore.getState().performCompileProcess();
      }, 30);

    }

    if (curr.scenario5Cart && !prev.scenario5Cart) {
      setTimeout(() => {
        useStore.getState().addScenario5CartErrorSetBlock(programId);
        useStore.setState(s => { s.scenario5CartErrorBlockMade = true });

        useCompiledStore.setState({});
        useStore.getState().performCompileProcess();
      }, 30);

    }

    if (curr.scenario5Package && !prev.scenario5Package) {
      setTimeout(() => {
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
  // Load all the programs
  useStore.getState().addProgramData("RoboPlanB", roboplanb, {});
  useStore.getState().setData(roboplanb);
}

computedSliceCompiledSubscribe(useCompiledStore, useStore);

export default useStore;
