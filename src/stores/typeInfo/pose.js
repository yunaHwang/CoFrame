import { EXTRA_TYPES, TYPES, SIMPLE_PROPERTY_TYPES } from "open-vp";
import { LocationIconStyled, WaypointIconStyled, statusIcon } from "./icons";
import { FiMoreHorizontal } from "react-icons/fi";
import { COMPILE_FUNCTIONS } from "../Constants";
import './rotate.css'
import { baseIndicatorLabelFn, baseTypeData } from "./baseType";
import { merge } from "lodash";

// TODO - update locationDoc to refer to from/to connector 
const locationDoc = "Locations are meaningful positions in the scene. For example, they can be used to define goals for placing or picking up [Things](thingType), or specifying starting or ending positions for the [Robot](robotAgentType). [Waypoints](waypointType) can be used in [Trajectories](trajectoryType) to specify intermediates between pairs of locations.";
const waypointDoc = "Waypoints are positions and orientations that are used as parts of [Trajectories](trajectoryType), and unlike [Locations](fromToType), do not have inherent meaning other than to allow greater specificity of the manner with which the [Robot](robotAgentType) moves between a pair of locations."
const placeDoc = "Places are meaningful positions in the scene. For example, they can be used to define goals for placing or picking up [Things](thingType), or specifying starting or ending positions for the [Robot](robotAgentType). [Waypoints](waypointType) can be used in [Trajectories](trajectoryType) to specify intermediates between pairs of locations.";


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
    position: {
      name: 'Position',
      type: SIMPLE_PROPERTY_TYPES.IGNORED, 
      default: {x: 0, y: 0, z: 0},
      isList: false,
      fullWidth: true
    },
    rotation: {
      name: 'Rotation',
      type: SIMPLE_PROPERTY_TYPES.IGNORED,
      default: {x: 0, y: 0, z: 0},
      isList: false,
      fullWidth: true
    },
    // states: {
    //   name: 'States',
    //   type: SIMPLE_PROPERTY_TYPES.IGNORED,
    //   default: {}
    // },
    // reachability: {
    //   name: 'Reachability',
    //   type: SIMPLE_PROPERTY_TYPES.IGNORED,
    //   default: {}
    // },
    compileFn: {
      default: COMPILE_FUNCTIONS.POSE
    },
    updateFields: {
      default: ['position','rotation']
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

const locationFeatures = {
  name: 'From/To Connectors',
  description: locationDoc,
  referenceBlock: {
    color: "#8624E0",
    icon: LocationIconStyled
  }
}

const waypointFeatures = {
  name: 'Waypoint',
  description: waypointDoc,
  referenceBlock: {
    color: "#AD1FDE",
    icon: WaypointIconStyled
  }
}

export const fromToType = merge(locationFeatures, baseTypeData, poseFeatures);
export const waypointType = merge(waypointFeatures, baseTypeData, poseFeatures);
// added new Type
export const placeType = merge(placeFeatures, baseTypeData, poseFeatures);