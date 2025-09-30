import { programType } from './program';
import { toLocationType, placeType } from './pose';
import { thingType } from './thing';
import { speechType } from './speech';
import { personType } from './person';
import { movementType } from './movement';
import { skillType, concurrentType } from './skill';
import { fallbackType } from './fallback';
import { fallbackSetType } from "./fallbackSet";
import { meshType } from './mesh';
import actionTypes from './action';
import agentTypes from './agents';
import sceneObjects from './sceneObjects';

const mod = { 
    programType,
    toLocationType,
    placeType,
    thingType,
    speechType,
    personType,
    movementType,
    skillType,
    concurrentType,
    fallbackType,
    fallbackSetType, 
    meshType,
    ...actionTypes,
    ...agentTypes,
    ...sceneObjects,
}

export default mod;
