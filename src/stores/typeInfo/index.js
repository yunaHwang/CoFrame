import { programType } from './program';
import { locationType, toLocationType, waypointType, placeType } from './pose';
import { thingType } from './thing';
// one new import coming here -> "speechType" + define 'say' under action.js (so it should be covered under actionTypes)
import { speechType } from './speech';
import { trajectoryType } from './trajectory';
import { hierarchicalType } from './hierarchical';
import { skillType } from './skill';
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
    trajectoryType,
    hierarchicalType,
    skillType,
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
