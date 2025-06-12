import { EXTRA_TYPES, TYPES, SIMPLE_PROPERTY_TYPES } from "open-vp";
import { SkillIconStyled } from "./icons";
import { FiMoreHorizontal } from "react-icons/fi";
import { COMPILE_FUNCTIONS } from "../Constants";
import { baseTypeData } from "./baseType";
import { merge } from "lodash";

//TODO - fix
const speechDoc = `Things are the parts that are created, consumed, or modified through the course of the [Program](programType) through the use of [Machines](machineType), and moved around by the robot with [Move Trajectory Primitives](moveTrajectoryType).
`

const speechFeatures = {
    name: 'Speech',
    type: TYPES.OBJECT,
    instanceBlock: null,
    description: speechDoc,
    referenceBlock: {
      onCanvas: false,
      color: "#62869e",
      icon: SkillIconStyled,
      extras: [
        EXTRA_TYPES.LOCKED_INDICATOR,
        EXTRA_TYPES.NAME_EDIT_TOGGLE,
        {
          icon: FiMoreHorizontal,
          type: EXTRA_TYPES.DROPDOWN,
          contents: [
            EXTRA_TYPES.DELETE_BUTTON,
            EXTRA_TYPES.DEBUG_TOGGLE,
            EXTRA_TYPES.DOC_TOGGLE,
            EXTRA_TYPES.SELECTION_TOGGLE
          ]
        }
      ]
    },
    properties: {
      compileFn: {
        default: COMPILE_FUNCTIONS.PROPERTY
      },
      updateFields: {
        default: []
      },
      singleton: {
        default: true
      }
    }
  }

export const speechType = merge(speechFeatures, baseTypeData);