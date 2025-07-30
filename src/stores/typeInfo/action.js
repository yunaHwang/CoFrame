import { EXTRA_TYPES, TYPES, SIMPLE_PROPERTY_TYPES } from "open-vp";
import { PrimitiveIconStyled, statusIcon } from "./icons";
import {
  FiMoreHorizontal
} from "react-icons/fi";
import { merge } from "lodash";
import { COMPILE_FUNCTIONS, STATUS, ERROR } from "../Constants";
import "./rotate.css";
import { baseTypeData, baseIndicatorLabelFn } from "./baseType";

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
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
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
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
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
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
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
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
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
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
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
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
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
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
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
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
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
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
  properties: {
    description: { default: "Stretch rotates x angles in y direction where x and y are provided as parameters" },
    // rotationMagnitude: {
    //   name: "Rotation Angle",
    //   accepts: ["movementType"],
    //   default: null,
    //   isList: false,
    //   nullValid: true,
    // },
    angleDirection: {
      name: "Rotation Direction",
      accepts: ["movementType"],
      default: null,
      isList: false,
      nullValid: true,
    },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: ["rotationMagnitude", "angleDirection"],
    },
  },
};

const slowerStretchFeatures = {
  name: "Move Slower",
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
  properties: {
    description: { default: "Stretch moves 20% slower than default" },
    compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
    updateFields: {
      default: [],
    },
  },
};

const fasterStretchFeatures = {
  name: "Move Faster",
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
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
  description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
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
  //moveGripperType: merge(gripperFeatures, basicActionData),
  //closeGripperType: merge(closeGripperFeatures, basicActionData), 
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
  lookForType: merge(lookForFeatures, basicActionData),
  handObjToType: merge(handObjToFeatures, basicActionData),
};

console.log(actionTypes);

export default actionTypes;
