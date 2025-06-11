import { EXTRA_TYPES, TYPES, SIMPLE_PROPERTY_TYPES } from "open-vp";
import { LocationIconStyled, WaypointIconStyled, statusIcon, PrimitiveIconStyled } from "./icons";
import { FiMoreHorizontal } from "react-icons/fi";
import { COMPILE_FUNCTIONS } from "../Constants";
import './rotate.css'
import { baseIndicatorLabelFn, baseTypeData } from "./baseType";
import { merge } from "lodash";

// TODO - update locationDoc to refer to from/to connector 
const locationDoc = "Locations are meaningful positions in the scene. For example, they can be used to define goals for placing or picking up [Things](thingType), or specifying starting or ending positions for the [Robot](robotAgentType). [Waypoints](waypointType) can be used in [Trajectories](trajectoryType) to specify intermediates between pairs of locations.";
const waypointDoc = "Waypoints are positions and orientations that are used as parts of [Trajectories](trajectoryType), and unlike [Locations](locationType), do not have inherent meaning other than to allow greater specificity of the manner with which the [Robot](robotAgentType) moves between a pair of locations."
const placeDoc = "Places are meaningful positions in the scene. For example, they can be used to define goals for placing or picking up [Things](thingType), or specifying starting or ending positions for the [Robot](robotAgentType). [Waypoints](waypointType) can be used in [Trajectories](trajectoryType) to specify intermediates between pairs of locations.";

// const basicActionData = {
//   type: TYPES.OBJECT,
//   instanceBlock: {
//     hideNewPrefix: true,
//     onCanvas: false,
//     color: "#629e6c",
//     icon: PrimitiveIconStyled,
//     extras: [
//       // EXTRA_TYPES.LOCKED_INDICATOR,
//       {
//         type: EXTRA_TYPES.INDICATOR_ICON,
//         accessor: statusIcon,
//         label: baseIndicatorLabelFn,
//       },
//       EXTRA_TYPES.DOC_TOGGLE,
//       {
//         icon: FiMoreHorizontal,
//         type: EXTRA_TYPES.DROPDOWN,
//         contents: [
//           EXTRA_TYPES.DELETE_BUTTON,
//           EXTRA_TYPES.SELECTION_TOGGLE
//         ],
//       },
//     ],
//   },
//   referenceBlock: null,
//   ...baseTypeData
// };


const poseFeatures = {
  type: TYPES.OBJECT,
  instanceBlock: null,
  referenceBlock: {
    onCanvas: false,
    extras: [
      EXTRA_TYPES.LOCKED_INDICATOR,
      { 
        type: EXTRA_TYPES.INDICATOR_ICON,
        accessor: statusIcon,
        label: baseIndicatorLabelFn
      },
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
// const fromToInstanceBlock = {
//   onCanvas: false,
//   color: "#8624E0",  // same as your LocationIcon color
//   icon: LocationIconStyled,
//   extras: [
//     //EXTRA_TYPES.LOCKED_INDICATOR,
//     { 
//       type: EXTRA_TYPES.INDICATOR_ICON,
//       accessor: statusIcon,
//       label: baseIndicatorLabelFn
//     },
//     {
//       icon: FiMoreHorizontal,
//       type: EXTRA_TYPES.DROPDOWN,
//       contents: [
//         EXTRA_TYPES.NAME_EDIT_TOGGLE,
//         EXTRA_TYPES.DELETE_BUTTON,
//         EXTRA_TYPES.DOC_TOGGLE,
//         EXTRA_TYPES.SELECTION_TOGGLE
//       ]
//     }
//   ]
// };
// // in tandem with the above code
// const locationFeatures = {
//   name: 'From/To Connectors',
//   description: locationDoc,
//   instanceBlock: fromToInstanceBlock,
//   properties: {
//     description: { default: "Point from and to a location, or a place, namely `Locations` or `placeType` (apologize for the confusing naming convention)" },
//     place: {
//       name: "Object",
//       accepts: ["placeType"],
//       default: null,
//       isList: false,
//       nullValid: true,
//     },
//     compileFn: { default: COMPILE_FUNCTIONS.POSE },
//     updateFields: {
//       default: ["place"],
//     },
//   },
//   referenceBlock: {
//     color: "#8624E0",
//     icon: LocationIconStyled
//   }
// }


// const locationFeatures = {
//   name: 'From/To Connectors',
//   description: locationDoc,
//   properties: {
//     description: { default: "Point from and to a location, or a place, namely `Locations` or `placeType` (apologize for the confusing naming convention)" },
//     place: {
//       name: "Object",
//       accepts: ["placeType"],
//       default: null,
//       isList: false,
//       nullValid: true,
//     },
//     compileFn: { default: COMPILE_FUNCTIONS.POSE },
//     updateFields: {
//       default: ["place"],
//     },
//   },
//   referenceBlock: {
//     color: "#8624E0",
//     icon: LocationIconStyled
//   }
// }

// this is for open
const locationFeatures = {
  name: "From/To Connectors",
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
  properties: {
    description: { default: "some descriptor" },
    place: {
      name: "Object",
      accepts: ["placeType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.POSE },
    updateFields: {
      default: ["place"],
    },
  },
  referenceBlock: {
    color: "#8624E0",
    icon: LocationIconStyled
  }
};

// const locationFeatures = {
//   name: 'From/To Connectors',
//   description: locationDoc,
//   referenceBlock: {
//     color: "#8624E0",
//     icon: LocationIconStyled
//   }
// }

const waypointFeatures = {
  name: 'Waypoint',
  description: waypointDoc,
  referenceBlock: {
    color: "#AD1FDE",
    icon: WaypointIconStyled
  }
}

//export const locationType = merge(locationFeatures, baseTypeData, poseFeatures);

//export const locationType = merge({}, baseTypeData, locationFeatures);

export const placeType = merge(placeFeatures, baseTypeData, poseFeatures
);

export const locationType = merge(locationFeatures, baseTypeData, poseFeatures);

// export const locationType = {
//   ...poseFeatures,
//   ...baseTypeData,
//   ...locationFeatures,
//   properties: {
//     ...poseFeatures.properties,
//     ...baseTypeData.properties,
//     ...locationFeatures.properties,
//   },
// };

export const waypointType = merge(waypointFeatures, baseTypeData, poseFeatures);
// added new Type


//console.log("Are you creating errors here!! ", locationType.properties);