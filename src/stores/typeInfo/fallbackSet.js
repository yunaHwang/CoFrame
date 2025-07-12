import { EXTRA_TYPES, TYPES, SIMPLE_PROPERTY_TYPES } from "open-vp";
import { SkillIconStyled, statusIcon, FixtureIconStyled } from "./icons";
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

const fallbackSetFeatures = {
  type: TYPES.OBJECT,
  instanceBlock: {
    hideNewPrefix: true,
    onCanvas: false,
    color: "#fcd49d",
    icon: FixtureIconStyled,
    extras: [
      EXTRA_TYPES.LOCKED_INDICATOR,
      EXTRA_TYPES.NAME_EDIT_TOGGLE,
      {
        icon: FiMoreHorizontal,
        type: EXTRA_TYPES.DROPDOWN,
        contents: [
          EXTRA_TYPES.NAME_EDIT_TOGGLE,
          EXTRA_TYPES.SELECTION_TOGGLE,
          EXTRA_TYPES.DELETE_BUTTON,
          EXTRA_TYPES.LOCKED_INDICATOR,
          EXTRA_TYPES.DOC_TOGGLE,
          {
            type: EXTRA_TYPES.ADD_ARGUMENT_GROUP,
            allowed: [
              "machineType",
              "locationType",
              "thingType",
              "toolType",
              "trajectoryType",
            ],
          },
        ],
      },
    ],
  },
  referenceBlock: null,
  ...baseTypeData
};

const emptyFallbackSetFeatures = {
  name: "New Priority Fallback Sets",
  description: "some string",
  properties: {
    description: { default: "some string" },
    children: {
      name: "Fallbacks",
      accepts: ["fallbackType"
      ],
      default: [],
      isList: true,
      nullValid: true,
    },

    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: ["children"],
    },
  },
};
export const fallbackSetType = merge(emptyFallbackSetFeatures, fallbackSetFeatures);