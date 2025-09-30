import { EXTRA_TYPES, TYPES, SIMPLE_PROPERTY_TYPES } from "open-vp";
import { SkillIconStyled, statusIcon } from "./icons";
import {
  FiMoreHorizontal,
  FiAlertOctagon,
  FiThumbsUp,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import { STATUS, COMPILE_FUNCTIONS } from "../Constants";
import { baseTypeData } from "./baseType";
import { merge } from "lodash";

const skillFeatures = {
  //name: "Skill",
  type: TYPES.OBJECT,
  instanceBlock: {
    hideNewPrefix: true,
    onCanvas: false,
    color: "#62869e",
    icon: SkillIconStyled,
    extras: [
      // EXTRA_TYPES.LOCKED_INDICATOR,
      // EXTRA_TYPES.NAME_EDIT_TOGGLE,
      {
        icon: FiMoreHorizontal,
        type: EXTRA_TYPES.DROPDOWN,
        contents: [
          EXTRA_TYPES.NAME_EDIT_TOGGLE,
          EXTRA_TYPES.SELECTION_TOGGLE,
          EXTRA_TYPES.DELETE_BUTTON,
          // EXTRA_TYPES.LOCKED_INDICATOR,
          // EXTRA_TYPES.DOC_TOGGLE,
          // {
          //   type: EXTRA_TYPES.ADD_ARGUMENT_GROUP,
          //   allowed: [
          //     "machineType",
          //     "locationType",
          //     "thingType",
          //     "toolType",
          //     "trajectoryType",
          //   ],
          // },
        ],
      },
    ],
  },
  referenceBlock: {
    onCanvas: false,          
    color: "#62869e",
    icon: SkillIconStyled,
    extras: [
      // EXTRA_TYPES.LOCKED_INDICATOR,
      // EXTRA_TYPES.NAME_EDIT_TOGGLE,
      {
        icon: FiMoreHorizontal,
        type: EXTRA_TYPES.DROPDOWN,
        contents: [
          EXTRA_TYPES.DELETE_BUTTON,
          // EXTRA_TYPES.DEBUG_TOGGLE,
          // EXTRA_TYPES.DOC_TOGGLE,
          EXTRA_TYPES.SELECTION_TOGGLE
        ]
      }
    ]
  },
  properties: {
    compileFn:   { default: COMPILE_FUNCTIONS.PROPERTY },
    updateFields:{ default: [] },
    singleton:   { default: false }
  },

  ...baseTypeData};

const emptySkillFeatures = {
  name: "Sequential Action Cluster",
  description: "A cluster of actions that will be executed sequentially, one-by-one",
  properties: {
    description: { default: "A cluster of actions that will be executed sequentially, one-by-one" },
    children: {
      name: "Actions",
      accepts: [
      "grabType", "putAsideType", "handObjToType", "stopStretchType", "saveLogStretchType",
        "sayType", "moveForwardType", "rotateType", "slowerStretchType", "fasterStretchType", "toLocationType",
        "resetCameraType", "adjustGripLighterType", "adjustGripHeavierType", "lookForType"
      ],
      default: [],
      isList: true,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.SIMPLE },
    updateFields: {
      default: ["children"],
    },
  },
};

const emptyConcurrentFeatures = {
  name: "Concurrent Action Cluster",
  description: "A cluster of actions that will be executed all at the same time. This may include the robot moving its body while saying something.",
  properties: {
    description: { default: "A cluster of actions that will be executed all at the same time. This may include the robot moving its body while saying something."},
    children: {
      name: "Actions",
      accepts: ["grabType", "putAsideType", "handObjToType", "stopStretchType", "saveLogStretchType",
        "sayType", "moveForwardType", "rotateType", "slowerStretchType", "fasterStretchType", "toLocationType",
        "resetCameraType", "adjustGripLighterType", "adjustGripHeavierType", "lookForType"
      ],
      default: [],
      isList: true,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.SIMPLE },
    updateFields: {
      default: ["children"],
    },
  },
};



export const skillType = merge(emptySkillFeatures, skillFeatures, {
  instanceBlock: { color: "#62869e" },           
  referenceBlock: { color: "#62869e" }
});
export const concurrentType = merge(emptyConcurrentFeatures, skillFeatures, {
  instanceBlock: { color: "#7e57c2" },            
  referenceBlock: { color: "#7e57c2" }
});
