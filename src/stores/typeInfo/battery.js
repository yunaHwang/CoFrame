import { EXTRA_TYPES, TYPES, SIMPLE_PROPERTY_TYPES } from "open-vp";
import { PrimitiveIconStyled, statusIcon } from "./icons";
import {
  FiMoreHorizontal
} from "react-icons/fi";
import { merge } from "lodash";
import { COMPILE_FUNCTIONS, STATUS, ERROR } from "../Constants";
import "./rotate.css";
import { baseTypeData, baseIndicatorLabelFn } from "./baseType";

const basicBatteryData = {
  type: TYPES.OBJECT,
  instanceBlock: {
    hideNewPrefix: true,
    onCanvas: false,
    color: "#3f3f3f",
    icon: statusIcon,
    extras: [
      EXTRA_TYPES.DOC_TOGGLE,
      {
        icon: FiMoreHorizontal,
        type: EXTRA_TYPES.DROPDOWN,
        contents: [
          EXTRA_TYPES.DELETE_BUTTON,
          EXTRA_TYPES.SELECTION_TOGGLE
        ],
      },
    ],
  },
  referenceBlock: null,
  ...baseTypeData
};


const batteryFeatures = {
  name: "Battery Block",
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
  properties: {
    description: { default: "Denote that there is battery shortage" },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: [],
    },
  },
};

export const batteryType = merge(batteryFeatures, baseTypeData);
