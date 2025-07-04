import { EXTRA_TYPES, TYPES, SIMPLE_PROPERTY_TYPES } from "open-vp";
import { ProcessIconStyled, LocationIconStyled, WaypointIconStyled, statusIcon, PrimitiveIconStyled } from "./icons";
import { FiMoreHorizontal } from "react-icons/fi";
import { COMPILE_FUNCTIONS } from "../Constants";
import './rotate.css'
import { baseIndicatorLabelFn, baseTypeData } from "./baseType";
import { merge } from "lodash";

// TODO - update locationDoc to refer to from/to connector 
const locationDoc = "Locations are meaningful positions in the scene. For example, they can be used to define goals for placing or picking up [Things](thingType), or specifying starting or ending positions for the [Robot](robotAgentType). [Waypoints](waypointType) can be used in [Trajectories](trajectoryType) to specify intermediates between pairs of locations.";
const waypointDoc = "Waypoints are positions and orientations that are used as parts of [Trajectories](trajectoryType), and unlike [Locations](locationType), do not have inherent meaning other than to allow greater specificity of the manner with which the [Robot](robotAgentType) moves between a pair of locations."
const placeDoc = "Places are meaningful positions in the scene. For example, they can be used to define goals for placing or picking up [Things](thingType), or specifying starting or ending positions for the [Robot](robotAgentType). [Waypoints](waypointType) can be used in [Trajectories](trajectoryType) to specify intermediates between pairs of locations.";


const poseFeatures = {
  type: TYPES.OBJECT,
  instanceBlock: null,
  referenceBlock: {
    onCanvas: false,
    extras: [
      EXTRA_TYPES.LOCKED_INDICATOR,
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
          EXTRA_TYPES.DOC_TOGGLE,
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

// add new features for new type definition -> placeType

const placeFeatures = {
  name: 'Locations',
  description: placeDoc,
  referenceBlock: {
    color: "#AD1FDE",
    icon: WaypointIconStyled
  }
}

// //added...
const fromInstanceBlock = {
  hideNewPrefix: true,
  onCanvas: false,
  color: "#8624E0",  // same as your LocationIcon color
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
        EXTRA_TYPES.DOC_TOGGLE,
        EXTRA_TYPES.SELECTION_TOGGLE
      ]
    }
  ]
};

// //added...
const toInstanceBlock = {
  hideNewPrefix: true,
  onCanvas: false,
  color: "#8624E0",  // same as your LocationIcon color
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
        EXTRA_TYPES.DOC_TOGGLE,
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
    // let's temporarily change this to thingType (worked)
    // back to placeType
    place: {
      name: "Location",
      accepts: ["placeType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.POSE },
    updateFields: {
      default: ["place"], // let's temporarily change this to thingType -> back to placeType
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
  name: "To Connector",
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
  instanceBlock: toInstanceBlock,
  properties: {
    description: { default: "some descriptor" },
    // let's temporarily change this to thingType (worked)
    // back to placeType
    place: {
      name: "Location",
      accepts: ["placeType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.POSE },
    updateFields: {
      default: ["place"], // let's temporarily change this to thingType -> back to placeType
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



//console.log("Are you creating errors here!! ", locationType.properties);