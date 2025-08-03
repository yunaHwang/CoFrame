import { EXTRA_TYPES, TYPES, SIMPLE_PROPERTY_TYPES } from "open-vp";
import { SkillIconStyled, statusIcon, FixtureIconStyled } from "./icons";
import {
  FiMoreHorizontal,
  FiAlertOctagon,
  FiThumbsUp,
  FiAlertTriangle,
  FiRefreshCw,
  FiEdit2
  //FaPencilAlt
} from "react-icons/fi";
import { STATUS, COMPILE_FUNCTIONS } from "../Constants";
import { baseTypeData } from "./baseType";
import { merge } from "lodash";

const fallbackFeatures = {
  //name: "Skill",
  type: TYPES.OBJECT,
  instanceBlock: {
    hideNewPrefix: true,
    onCanvas: false,
    color: "##b86e2d",
    icon: FixtureIconStyled,
    extras: [
      // EXTRA_TYPES.LOCKED_INDICATOR,
      EXTRA_TYPES.SELECTION_TOGGLE,
      {
        icon: FiEdit2,
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
  referenceBlock: null,
  ...baseTypeData
};

const emptyFallbackFeatures = {
  name: "New Fallback Behaviors",
  description: "some string",
  properties: {
    description: { default: "some string" },
    children: {
      name: "Fallback Behavior",
      accepts: ["toLocationType", "grabType", "putAsideType", "handObjToType", "stopStretchType", "saveLogStretchType",
        "sayType", "moveForwardType", "rotateType", "skillType", "concurrentType", "lookForType", "resetCameraType", "adjustGripLighterType",
        "adjustGripHeavierType",
      ],
      default: [],
      isList: true,
      nullValid: true,
    },
    errorType: {
      name: "Error names",
      default: [],
      type: SIMPLE_PROPERTY_TYPES.IGNORED,
      default: null,
      nullValid: true
    },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: ["children"],
    },
  },
};
export const fallbackType = merge(emptyFallbackFeatures, fallbackFeatures);