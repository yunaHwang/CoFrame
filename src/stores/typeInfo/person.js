import { EXTRA_TYPES, TYPES, SIMPLE_PROPERTY_TYPES } from "open-vp";
import { WaypointIconStyled, ContainerIconStyled } from "./icons";
import { FiMoreHorizontal } from "react-icons/fi";
import { COMPILE_FUNCTIONS } from "../Constants";
import { baseTypeData } from "./baseType";
import { merge } from "lodash";

const personDoc = `Person(s) is/are people in the environment
`

const personFeatures = {
    name: 'Person',
    type: TYPES.OBJECT,
    instanceBlock: null,
    description: personDoc,
    referenceBlock: {
      onCanvas: false,
      color: "#AD1FDE",
      icon: ContainerIconStyled,
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

export const personType = merge(personFeatures, baseTypeData);