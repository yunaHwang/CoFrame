import { EXTRA_TYPES, TYPES } from "open-vp";
import { WaypointIconStyled } from "./icons";
import { FiMoreHorizontal } from "react-icons/fi";
import { COMPILE_FUNCTIONS } from "../Constants";
import { baseTypeData } from "./baseType";
import { merge } from "lodash";

const movementDoc = `
`

const movementFeatures = {
    name: 'movement',
    type: TYPES.OBJECT,
    instanceBlock: null,
    description: movementDoc,
    referenceBlock: {
      onCanvas: false,
      color: "#a83832",
      icon: WaypointIconStyled,
      extras: [
        // EXTRA_TYPES.LOCKED_INDICATOR,
        EXTRA_TYPES.NAME_EDIT_TOGGLE,
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

export const movementType = merge(movementFeatures, baseTypeData);