import { programType } from './program';
import { locationType, toLocationType, waypointType, placeType } from './pose';
import { thingType } from './thing';
import { speechType } from './speech';
import { personType } from './person';
import { movementType } from './movement';
import { trajectoryType } from './trajectory';
import { hierarchicalType } from './hierarchical';
import { skillType, concurrentType } from './skill';
import { fallbackType } from './fallback';
import { batteryType } from './battery';
import { meshType } from './mesh';
import { processType } from './process';
import {inputOutputType} from './inputOutput';
import {graspPointType} from './graspPoint';
import actionTypes from './action';
import agentTypes from './agents';
import sceneObjects from './sceneObjects';
import collisionTypes from './collision';
import { goalType } from './goal';
import { goalProgramType } from './goalProgram';

const mod = { 
    inputOutputType,
    programType,
    locationType,
    toLocationType,
    waypointType,
    placeType,
    thingType,
    speechType,
    batteryType,
    personType,
    movementType,
    trajectoryType,
    hierarchicalType,
    skillType,
    concurrentType,
    fallbackType,
    meshType,
    processType,
    graspPointType,
    goalType,
    ...actionTypes,
    ...agentTypes,
    ...sceneObjects,
    ...collisionTypes,
    goalProgramType
}

export default mod;
