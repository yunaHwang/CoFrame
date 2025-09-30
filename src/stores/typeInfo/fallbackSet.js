import { EXTRA_TYPES, TYPES } from "open-vp";
import { FixtureIconStyled } from "./icons";
import {
  FiEdit2
} from "react-icons/fi";
import { COMPILE_FUNCTIONS } from "../Constants";
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

const emptyFallbackSetFeatures = {
  name: "New Priority Fallback Sets",
  description: "",
  properties: {
    description: { default: "" },
    children: {
      name: "Different Fallback Behaviors",
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