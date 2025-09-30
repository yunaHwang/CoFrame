import { EXTRA_TYPES, TYPES} from "open-vp";
import { PrimitiveIconStyled} from "./icons";
import {
  FiMoreHorizontal
} from "react-icons/fi";
import { merge } from "lodash";
import { COMPILE_FUNCTIONS } from "../Constants";
import "./rotate.css";
import { baseTypeData } from "./baseType";

const basicActionData = {
  type: TYPES.OBJECT,
  instanceBlock: {
    hideNewPrefix: true,
    onCanvas: false,
    color: "#629e6c",
    icon: PrimitiveIconStyled,
    extras: [
      // EXTRA_TYPES.LOCKED_INDICATOR,
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
          EXTRA_TYPES.DELETE_BUTTON,
          // EXTRA_TYPES.NAME_EDIT_TOGGLE,
          EXTRA_TYPES.SELECTION_TOGGLE
        ],
      },
    ],
  },
  referenceBlock: null,
  ...baseTypeData
};

const grabFeatures = {
  name: "Grab Object",
  description: "",
  properties: {
    description: { default: "Grab an object using the gripper" },
    thing: {
      name: "Object",
      accepts: ["thingType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: ["thing"],
    },
  },
};

const putAsideFeatures = {
  name: "Put Aside Object",
  description: "",
  properties: {
    description: { default: "Place Aside an Object that is in the Robot's Way (adjacent coordinate)" },
    thing: {
      name: "Object",
      accepts: ["thingType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: ["thing"],
    },
  },
};

const handObjToFeatures = {
  name: "Hand Object to Person",
  description: "",
  properties: {
    description: { default: "Stretch hands an object to a person" },
    thing: {
      name: "Object",
      accepts: ["thingType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    person: {
      name: "Person",
      accepts: ["personType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: ["thing", "person"],
    },
  },
};

const stopFeatures = {
  name: "Stop Stretch Action",
  description: "",
  properties: {
    description: { default: "Stop whatever action Stretch was doing" },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: [],
    },
  },
};

const resetCameraFeatures = {
  name: "Reset Camera",
  description: "",
  properties: {
    description: { default: "Reset Stretch camera when sensor errors occur" },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: [],
    },
  },
};

const saveLogFeatures = {
  name: "Save Stretch Log",
  description: "",
  properties: {
    description: { default: "Save Stretch log of whatever happened so far" },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: [],
    },
  },
};

const sayFeatures = {
  name: "Say",
  description: "",
  properties: {
    description: { default: "Stretch says the utterance fed into as the argument" },
    speech: {
      name: "Speech Utterance",
      accepts: ["speechType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: ["speech"],
    },
  },
};

const moveForwardFeatures = {
  name: "Move Forward",
  description: "",
  properties: {
    description: { default: "Stretch moves forward by the amount of grid numbers provided as a parameter" },
    direction: {
      name: "Grid Increments",
      accepts: ["movementType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: ["direction"],
    },
  },
};

const rotateFeatures = {
  name: "Rotate Stretch",
  description: "",
  properties: {
    description: { default: "Stretch rotates x direction y many times where x and y are provided as parameters" },
    angleDirection: {
      name: "Rotation Direction",
      accepts: ["movementType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    rotationTimes: {
      name: "Rotation Times",
      accepts: ["movementType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: ["angleDirection", "rotationTimes"],
    },
  },
};

const slowerStretchFeatures = {
  name: "Move Slower",
  description: "",
  properties: {
    description: { default: "Stretch moves 20% slower than default" },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: [],
    },
  },
};

const adjustGripLighterFeatures = {
  name: "Adjust Grip for Lighter Items",
  description: "",
  properties: {
    description: { default: "Stretch adjusts its gripper grip for picking up lighter objects" },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: [],
    },
  },
};

const adjustGripHeavierFeatures = {
  name: "Adjust Grip for Heavier Items",
  description: "",
  properties: {
    description: { default: "Stretch adjusts its gripper grip for picking up heavier objects" },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: [],
    },
  },
};

const fasterStretchFeatures = {
  name: "Move Faster",
  description: "",
  properties: {
    description: { default: "Stretch moves 20% faster than default" },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: [],
    },
  },
};

const lookForFeatures = {
  name: "Look For Object",
  description: "",
  properties: {
    description: { default: "Use Stretch camera to specifically look for an object" },
    thing: {
      name: "Object",
      accepts: ["thingType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: ["thing"],
    },
  },
};

const actionTypes = {
  putAsideType: merge(putAsideFeatures, basicActionData),
  grabType: merge(grabFeatures, basicActionData),
  stopStretchType: merge(stopFeatures, basicActionData),
  resetCameraType: merge(resetCameraFeatures, basicActionData),
  saveLogStretchType: merge(saveLogFeatures, basicActionData),
  sayType: merge(sayFeatures, basicActionData),
  moveForwardType: merge(moveForwardFeatures, basicActionData),
  rotateType: merge(rotateFeatures, basicActionData),
  slowerStretchType: merge(slowerStretchFeatures, basicActionData),
  fasterStretchType: merge(fasterStretchFeatures, basicActionData),
  adjustGripLighterType: merge(adjustGripLighterFeatures, basicActionData),
  adjustGripHeavierType: merge(adjustGripHeavierFeatures, basicActionData),
  lookForType: merge(lookForFeatures, basicActionData),
  handObjToType: merge(handObjToFeatures, basicActionData),
};

console.log(actionTypes);

export default actionTypes;
