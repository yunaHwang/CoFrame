import { programType } from './program';
import { locationType, toLocationType, waypointType, placeType } from './pose';
import { thingType } from './thing';
import { speechType } from './speech';
import { personType } from './person';
import { directionalityType } from './directionality';
import { trajectoryType } from './trajectory';
import { hierarchicalType } from './hierarchical';
import { skillType, concurrentType } from './skill';
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
    personType,
    directionalityType,
    trajectoryType,
    hierarchicalType,
    skillType,
    concurrentType,
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
