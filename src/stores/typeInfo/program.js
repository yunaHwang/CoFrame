import { EXTRA_TYPES, TYPES, SIMPLE_PROPERTY_TYPES } from "open-vp";
import { MachineIconStyled } from "./icons";
import {
  FiMoreHorizontal
} from "react-icons/fi";
import { COMPILE_FUNCTIONS } from "../Constants";
import "./rotate.css";
import { baseTypeData } from "./baseType";
import { merge } from "lodash";

const programDoc = `A Program consists of actions, action clusters, and fallback behaviors`;

const programFeatures = {
  name: "Day in the life of Stretch",
  type: TYPES.OBJECT,
  description: programDoc,
  instanceBlock: {
    hideNewPrefix: true,
    onCanvas: true,
    color: "#3f3f3f",
    icon: MachineIconStyled,
    extras: [
      // {
      //   type: EXTRA_TYPES.INDICATOR_ICON,
      //   accessor: statusIcon,
      //   label: baseIndicatorLabelFn,
      // },
      // EXTRA_TYPES.DOC_TOGGLE,
      {
        icon: FiMoreHorizontal,
        type: EXTRA_TYPES.DROPDOWN,
        contents: [
          EXTRA_TYPES.NAME_EDIT_TOGGLE,
          // EXTRA_TYPES.LOCKED_INDICATOR,
          EXTRA_TYPES.SELECTION_TOGGLE,
          // {
          //   type: EXTRA_TYPES.INDICATOR_TEXT,
          //   accessor: (data) => data.properties.children.length,
          //   label: "Size",
          // },
        ],
      }
    ],
  },
  referenceBlock: null,
  properties: {
    description: {
      name: "Description",
      type: SIMPLE_PROPERTY_TYPES.IGNORED,
      default: "",
      isList: false,
      fullWidth: true,
    },
    children: {
      name: "Children",
      accepts: [
        //"moveGripperType",
        //"closeGripperType",
        "grabType",
        "handObjToType",
        "stopStretchType",
        "saveLogStretchType",
        "sayType",
        "moveForwardType",
        "rotateType",
        "slowerStretchType",
        "fasterStretchType",
        // "locationType", 
        "toLocationType",
        "putAsideType",
        // "thingType",
        // "speechType",
        // "gripperType",
        "skillType", // this is the action cluster
        "concurrentType",
        "lookForType",
        "resetCameraType",
        "adjustGripLighterType",
        "adjustGripHeavierType"
        //"fallbackType"
      ],
      default: [],
      isList: true,
      fullWidth: true,
    },
    compileFn: {
      default: COMPILE_FUNCTIONS.SIMPLE,
    },
    updateFields: {
      default: ["children"],
    }
  },
};

export const programType = merge(programFeatures, baseTypeData);