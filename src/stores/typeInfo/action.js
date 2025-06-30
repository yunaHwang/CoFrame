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

// const delayFeatures = {
//   name: "Delay",
//   description: "A pause by the [Robot](robotAgentType) by a specified amount of time.",
//   properties: {
//     description: { default: "Delay action for a specified amount of time" },
//     duration: {
//       name: "Duration",
//       type: SIMPLE_PROPERTY_TYPES.NUMBER,
//       default: 1,
//       min: 0,
//       max: 3600,
//       step: 10,
//       visualScaling: 1,
//       visualPrecision: 1,
//       units: "sec",
//     },
//     compileFn: { default: COMPILE_FUNCTIONS.DELAY },
//     updateFields: { default: ["duration"] },
//   },
// };

// const breakpointFeatures = {
//   name: "Breakpoint",
//   description: "A terminator that prematurely ends the compilation of the [Program](programType).",
//   properties: {
//     description: { default: "Stop computation and processing here" },
//     compileFn: { default: COMPILE_FUNCTIONS.BREAK },
//     updateFields: { default: [] },
//   },
// };

// const gripperFeatures = {
//   name: "Open Gripper",
//   description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
//   properties: {
//     description: { default: "Fully open the gripper" },
//     thing: {
//       name: "Object",
//       accepts: ["thingType"],
//       default: null,
//       isList: false,
//       nullValid: true,
//     },
//     compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
//     updateFields: {
//       default: ["thing"],
//     },
//   },
// };

// const closeGripperFeatures = {
//   name: "Close Gripper",
//   description: "An action by the [Robot](robotAgentType) that adjusts the distance between the two fingers of the gripper. If interacting with a [Thing](thingType) or [Tool](toolType), it should be specified in the action.",
//   properties: {
//     description: { default: "Clench the gripper" },
//     compileFn: { default: COMPILE_FUNCTIONS.GRIPPER_MOTION },
//     updateFields: {
//       default: [],
//     },
//   },
// };

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

const placeAsideFeatures = {
  name: "Place Aside Object",
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
  name: "Stretch Say",
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
      accepts: ["directionalityType"],
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
    //   accepts: ["directionalityType"],
    //   default: null,
    //   isList: false,
    //   nullValid: true,
    // },
    angleDirection: {
      name: "Rotation Direction",
      accepts: ["directionalityType"],
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
    description: { default: "Activate vision sensor to specifically look for an object" },
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

// const machineInitFeatures = {
//   name: "Machine Initialize",
//   description: "An action that initializes the [Machine](machineType) for usage. This need only be done once per execution of the [Program](programType).",
//   properties: {
//     description: { default: "Initialize a machine for use" },
//     machine: {
//       name: "Machine",
//       accepts: ["machineType"],
//       default: null,
//       isList: false,
//     },
//     compileFn: { default: COMPILE_FUNCTIONS.MACHINE },
//     updateFields: { default: ["machine"] },
//   },
// };

// const processStartFeatures = {
//   name: "Process Start",
//   description: "An action that begins a process [Process](processType). If the process needs a [Machine](machineType) or [Tool](toolType), this must also be provided in the 'gizmo' field.",
//   properties: {
//     description: { default: "Begin a machine process" },
//     process: {
//       name: "Process",
//       accepts: ["processType"],
//       default: null,
//       isList: false,
//     },
//     gizmo: {
//       name: "Gizmo",
//       accepts: ["machineType","toolType"],
//       default: null,
//       isList: false,
//       nullValid: true,
//     },
//     compileFn: { default: COMPILE_FUNCTIONS.PROCESS },
//     updateFields: { default: ["process", "gizmo"] },
//   },
// };

// const processWaitFeatures = {
//   name: "Process Wait",
//   description: "An action that has the [Robot](robotAgentType) wait until the completion of the process [Process](processType). If the process needs a [Machine](machineType) or [Tool](toolType), this must also be provided in the 'gizmo' field.",
//   properties: {
//     description: {
//       default:
//         "Fill any remaining time while process is running by making the robot wait",
//     },
//     process: {
//       name: "Process",
//       accepts: ["processType"],
//       default: null,
//       isList: false,
//     },
//     gizmo: {
//       name: "Gizmo",
//       accepts: ["machineType","toolType"],
//       default: null,
//       isList: false,
//       nullValid: true,
//     },
//     compileFn: { default: COMPILE_FUNCTIONS.PROCESS },
//     updateFields: { default: ["process", "gizmo"] },
//   },
// };

// const moveTrajectoryFeatures = {
//   name: "Move Trajectory",
//   description: "An action by the [Robot](robotAgentType) that moves its gripper along a specified [Trajectory](trajectoryType). Motion types include 'IK', which attempts to move the gripper in a straight line from one location to another, while 'Joint' interpolates the joints. Velocity adjusts the speed of the motion.",
//   properties: {
//     description: {
//       default: "Move Robot according to a trajectory and motion type",
//     },
//     trajectory: {
//       name: "Trajectory",
//       accepts: ["trajectoryType"],
//       default: null,
//       isList: false,
//     },
//     duration: {
//       // mm/ms or m/s
//       name: "Duration",
//       type: SIMPLE_PROPERTY_TYPES.NUMBER,
//       default: 1,
//       min: 0.01,
//       max: 60,
//       step: 0.01,
//       visualScaling: 1,
//       visualPrecision: 2,
//       units: "s",
//     },
//     motionType: {
//       name: "Motion Type",
//       type: SIMPLE_PROPERTY_TYPES.OPTIONS,
//       options: [{value: "IK", label: "IK"}, {value: "Joint", label:'Joint'}],
//       default: "IK",
//     },
//     compileFn: { default: COMPILE_FUNCTIONS.ROBOT_MOTION },
//     updateFields: { default: ["trajectory", "duration", "motionType"] },
//   },
// };

// this is only for OPENING gripper
const actionTypes = {
  //delayType: merge(delayFeatures, basicActionData),
  //moveGripperType: merge(gripperFeatures, basicActionData),
  //closeGripperType: merge(closeGripperFeatures, basicActionData), 
  placeAsideType: merge(placeAsideFeatures, basicActionData),
  grabType: merge(grabFeatures, basicActionData),
  stopStretchType: merge(stopFeatures, basicActionData),
  saveLogStretchType: merge(saveLogFeatures, basicActionData),
  sayType: merge(sayFeatures, basicActionData),
  moveForwardType: merge(moveForwardFeatures, basicActionData),
  rotateType: merge(rotateFeatures, basicActionData),
  slowerStretchType: merge(slowerStretchFeatures, basicActionData),
  fasterStretchType: merge(fasterStretchFeatures, basicActionData),
  lookForType: merge(lookForFeatures, basicActionData),
  handObjToType: merge(handObjToFeatures, basicActionData),
  //machineInitType: merge(machineInitFeatures, basicActionData),
  //processStartType: merge(processStartFeatures, basicActionData),
  // processStopType: merge(processStopFeatures, basicActionData),
  //processWaitType: merge(processWaitFeatures, basicActionData),
  //moveTrajectoryType: merge(moveTrajectoryFeatures, basicActionData),
  // moveUnplannedType: merge(moveUnplannedFeatures,basicActionData),
  // breakpointType: merge(breakpointFeatures, basicActionData, {
  // instanceBlock: { color: "#3a5e40" },
  // }),
};

console.log(actionTypes);

export default actionTypes;
