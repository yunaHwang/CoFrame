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


// const poseFeatures = {
//   type: TYPES.REFERENCE,
//   instanceBlock: null,
//   referenceBlock: {
//     onCanvas: false,
//     extras: [
//       EXTRA_TYPES.LOCKED_INDICATOR,
//       { 
//         type: EXTRA_TYPES.INDICATOR_ICON,
//         accessor: statusIcon,
//         label: baseIndicatorLabelFn
//       },
//       {
//         icon: FiMoreHorizontal,
//         type: EXTRA_TYPES.DROPDOWN,
//         contents: [
//           EXTRA_TYPES.NAME_EDIT_TOGGLE,
//           EXTRA_TYPES.DELETE_BUTTON,
//           EXTRA_TYPES.DOC_TOGGLE,
//           EXTRA_TYPES.SELECTION_TOGGLE
//         ]
//       }
//     ]
//   },
//   properties: {
//     compileFn: {
//       default: COMPILE_FUNCTIONS.POSE
//     },
//     updateFields: {
//       default: []
//     },
//     singleton: {
//       default: true
//     }
//   }
// }

// add new features for new type definition -> placeType

const placeFeatures = {
    name: 'Location',
    type: TYPES.OBJECT,
    instanceBlock: null,
    description: placeDoc,
    referenceBlock: {
      onCanvas: false,
      color: "#E08024",
      icon: WaypointIconStyled,
      extras: [
        EXTRA_TYPES.LOCKED_INDICATOR,
        EXTRA_TYPES.NAME_EDIT_TOGGLE,
        {
          icon: FiMoreHorizontal,
          type: EXTRA_TYPES.DROPDOWN,
          contents: [
            EXTRA_TYPES.DELETE_BUTTON,
            EXTRA_TYPES.DEBUG_TOGGLE,
            EXTRA_TYPES.DOC_TOGGLE,
            EXTRA_TYPES.SELECTION_TOGGLE
          ]
        }
      ]
    },
    properties: {
      compileFn: {
        default: COMPILE_FUNCTIONS.PROPERTY
      },
      updateFields: {
        default: []
      },
      singleton: {
        default: true
      }
    }
  }
// const placeFeatures = {
//   name: 'Locations',
//   description: placeDoc,
//   referenceBlock: {
//     color: "#AD1FDE",
//     icon: WaypointIconStyled
//   }
// }

export const placeType = merge(placeFeatures, baseTypeData,
);