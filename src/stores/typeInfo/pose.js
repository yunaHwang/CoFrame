import { EXTRA_TYPES, TYPES } from "open-vp";
import { ProcessIconStyled, LocationIconStyled, WaypointIconStyled } from "./icons";
import { FiMoreHorizontal } from "react-icons/fi";
import { COMPILE_FUNCTIONS } from "../Constants";
import './rotate.css'
import { baseTypeData } from "./baseType";
import { merge } from "lodash";

const locationDoc = "";
const waypointDoc = ""
const placeDoc = "";


const poseFeatures = {
  type: TYPES.OBJECT,
  instanceBlock: null,
  referenceBlock: {
    onCanvas: false,
    extras: [
      // EXTRA_TYPES.LOCKED_INDICATOR,
      // { 
      //   type: EXTRA_TYPES.INDICATOR_ICON,
      //   accessor: statusIcon,
      //   label: baseIndicatorLabelFn
      // },
      {
        icon: FiMoreHorizontal,
        type: EXTRA_TYPES.DROPDOWN,
        contents: [
          EXTRA_TYPES.NAME_EDIT_TOGGLE,
          EXTRA_TYPES.DELETE_BUTTON,
          // EXTRA_TYPES.DOC_TOGGLE,
          EXTRA_TYPES.SELECTION_TOGGLE
        ]
      }
    ]
  },
  properties: {
    compileFn: {
      default: COMPILE_FUNCTIONS.POSE
    },
    updateFields: {
      default: []
    },
    singleton: {
      default: true
    }
  }
}


const placeFeatures = {
  name: 'Locations',
  description: placeDoc,
  referenceBlock: {
    color: "#AD1FDE",
    icon: LocationIconStyled
  }
}


const fromInstanceBlock = {
  hideNewPrefix: true,
  onCanvas: false,
  color: "#8624E0",  
  icon: LocationIconStyled,
  extras: [
    //EXTRA_TYPES.LOCKED_INDICATOR,
    // { 
    //   type: EXTRA_TYPES.INDICATOR_ICON,
    //   accessor: statusIcon,
    //   label: baseIndicatorLabelFn
    // },
    {
      icon: FiMoreHorizontal,
      type: EXTRA_TYPES.DROPDOWN,
      contents: [
        EXTRA_TYPES.NAME_EDIT_TOGGLE,
        EXTRA_TYPES.DELETE_BUTTON,
        // EXTRA_TYPES.DOC_TOGGLE,
        EXTRA_TYPES.SELECTION_TOGGLE
      ]
    }
  ]
};

const toInstanceBlock = {
  hideNewPrefix: true,
  onCanvas: false,
  color: "#8624E0",  
  icon: ProcessIconStyled,
  extras: [
    //EXTRA_TYPES.LOCKED_INDICATOR,
    // { 
    //   type: EXTRA_TYPES.INDICATOR_ICON,
    //   accessor: statusIcon,
    //   label: baseIndicatorLabelFn
    // },
    {
      icon: FiMoreHorizontal,
      type: EXTRA_TYPES.DROPDOWN,
      contents: [
        EXTRA_TYPES.NAME_EDIT_TOGGLE,
        EXTRA_TYPES.DELETE_BUTTON,
        // EXTRA_TYPES.DOC_TOGGLE,
        EXTRA_TYPES.SELECTION_TOGGLE
      ]
    }
  ]
};

// this is for from
const locationFeatures = {
  name: "From Connector",
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
  instanceBlock: fromInstanceBlock,
  properties: {
    description: { default: "some descriptor" },
    place: {
      name: "Location",
      accepts: ["placeType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.POSE },
    updateFields: {
      default: ["place"], 
    },
    singleton: {default: false}
  },
  referenceBlock: {
    color: "#8624E0",
    icon: LocationIconStyled
  }
};

// this is for to
const toLocationFeatures = {
  name: "To",
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
  instanceBlock: toInstanceBlock,
  properties: {
    description: { default: "some descriptor" },
    place: {
      name: "Location",
      accepts: ["placeType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.POSE },
    updateFields: {
      default: ["place"], 
    },
    singleton: {default: false}
  },
  referenceBlock: {
    color: "#8624E0",
    icon: LocationIconStyled
  }
};

const waypointFeatures = {
  name: 'Waypoint',
  description: waypointDoc,
  referenceBlock: {
    color: "#AD1FDE",
    icon: WaypointIconStyled
  }
}


export const placeType = merge(placeFeatures, baseTypeData, poseFeatures
);

// this is for from
export const locationType = merge(
  {},
  poseFeatures,
  baseTypeData,
  {
    ...locationFeatures,
    type: TYPES.OBJECT,
    instanceBlock: fromInstanceBlock 
  }
);

// this is for to
export const toLocationType = merge(
  {},
  poseFeatures,
  baseTypeData,
  {
    ...toLocationFeatures,
    type: TYPES.OBJECT,
    instanceBlock: toInstanceBlock 
  }
);


export const waypointType = merge(waypointFeatures, baseTypeData, poseFeatures);