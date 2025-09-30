import { useState, useEffect, useMemo, useRef } from "react";
import { Typography, Paper, Button } from "@mui/material";
import useStore from "../../stores/Store";
import { subscribeFlush, unsubscribeFlush } from "../../stores/to_flask"
import { stageScenario2SensorError, stageScenario3PersonBlockError, stageScenario4HeavyError, stageScenario5CartBlock, stageScenario5PackageBlock } from "../../stores/to_flask";

const FEET_PER_STEP         = 1.6;
const BATTERY_DROP_PER_STEP = 3;             

const CHARGER_LABEL = "battery charging station";

const scenarioObjects = {
  "Scenario 1": {
    "Target Parcel": { coords: [[1, 6]] },
    "Other Parcel": { coords: [[0, 6]] }
  },
  "Scenario 2": {
    "Target Parcel": { coords: [[1, 6]] },
    "Other Parcel": { coords: [[0, 6]] }
  },
  "Scenario 3": {
    "Target Parcel": { coords: [[1, 6]] }
  },
  "Scenario 4": {
    "Target Parcel": { coords: [[1, 6]] },
    "Other Parcel": { coords: [[0, 6]] }
  },
  "Scenario 5": {
    "Target Parcel": { coords: [[1, 6]] },
    "Other Parcel": { coords: [[0, 6], [1, 5], [1, 7], [2, 6]] },
    "Fence": { coords: [[4,0], [4,1], [4,2], [4,3]] },
    "Cart": { coords: [[5,4], [6,4], [7,4], [8,4], [9,4]] }
  }
};

const SimTile = ({
  cellSize        = 30,
  highlight       = [],
  color           = "#faeef2",
  icons           = {},
  onIconsUpdate,
  labelsOverGrid  = [],
  sourceInfo_to_pass = null,
  scenario        = "Scenario 1",
}) => {

  // ──────────────────────────────
  // Local UI state
  // ──────────────────────────────
  const [orientation, setOrientation] = useState("E");     // N, E, S, W
  const [pendingMove,       setPendingMove]       = useState(false);
  const [pendingRotate,     setPendingRotate]     = useState(false);
  const [pendingToConnector,setPendingToConnector]= useState(false);

  const showBatteryCharged  = useStore((s) => s.showBatteryCharged);
  const setShowBatteryCharged = useStore((s) => s.setShowBatteryCharged);

  const showSensorCleared = useStore((s) => s.showSensorCleared);
  const setShowSensorCleared = useStore((s) => s.setShowSensorCleared);

  const showPersonblockCleared = useStore((s) => s.showPersonblockCleared);
  const setShowPersonblockCleared = useStore((s) => s.setShowPersonblockCleared);

  const showHeavyCleared = useStore((s) => s.showHeavyCleared);
  const setShowHeavyCleared = useStore((s) => s.setShowHeavyCleared);

  const showCartblockCleared = useStore((s) => s.showCartblockCleared);
  const setShowCartblockCleared = useStore((s) => s.setShowCartblockCleared);

  const showPackageblockCleared = useStore((s) => s.showPackageblockCleared);
  const setShowPackageblockCleared = useStore((s) => s.setShowPackageblockCleared);

  const setActionMessage = useStore((s) => s.setActionMessage);

  const setErrorMessage  = useStore((s) => s.setErrorMessage);
  const setShowError     = useStore((s) => s.setShowError);
  const actionDeleted    = useStore((s) => s.actionDeleted);
  const setActionDeleted = useStore((s) => s.setActionDeleted);

  const deletedFieldInfo = useStore((s) => s.deletedFieldInfo);
  const deletedParentInfo = useStore((s) => s.deletedParentInfo);
  const setDeletedFieldInfo = useStore((s) => s.setDeletedFieldInfo);
  const setDeletedParentInfo = useStore((s) => s.setDeletedParentInfo);

  // ────────────────────────────────────
  // Responsible For Action Tracking
  // ────────────────────────────────────

  const actionTracking = useStore((s) => s.actionTracking);

  const lastTransfer = useStore((s) => s.lastTransfer);
  const programData = useStore((s) => s.programData);
  const deletedData = useStore((s) => s.deletedData);

  const [putAsideAtCoord, setPutAsideAtCoord] = useState(null);
  const [isObjectGrabbed, setIsObjectGrabbed] = useState(false);  
  
  const [grabbedObject, setGrabbedObject] = useState(null); 

  const [isObjectFading, setIsObjectFading] = useState(false);
  const [isObjectBeingHanded, setIsObjectBeingHanded] = useState(false);
  const [objectWithElderly, setObjectWithElderly] = useState(false);
  const [hasThingParam, setHasThingParam] = useState(false);
  const [hasPersonParam, setHasPersonParam] = useState(false);
  const [parcelLeftAtCoord, setParcelLeftAtCoord] = useState(null);
  const [parcelDroppedByDeletion, setParcelDroppedByDeletion] = useState(false);

  const [droppedObject, setDroppedObject] = useState(null); 
  const [objectPositions, setObjectPositions] = useState({});
  const [objectWithPerson, setObjectWithPerson] = useState(null); 
  const [targetPersonForHand, setTargetPersonForHand] = useState(null);

  const { chargePending }= useStore();     
  
  const lastScenario2Signal = useRef(null);
  const lastScenario3Signal = useRef(null);
  const lastScenario4Signal = useRef(null);
  const lastCartBlockSignal     = useRef(null);
  const lastPackageBlockSignal  = useRef(null);

  // ──────────────────────────────
  // Find first robot icon 
  // ──────────────────────────────
  const startCoord = useMemo(() => {
    const entry = Object.entries(icons).find(
      ([, v]) => typeof v === "string" && v.includes("robot")
    );
    if (!entry) return null;
    const [x, y] = entry[0].split(",").map(Number);
    return { x, y };
  }, [icons]);

  // ──────────────────────────────
  // Calculate movement from action tracking
  // ──────────────────────────────
  const calculatedMovement = useMemo(() => {
    const totalX = actionTracking.reduce((sum, action) => sum + action.xMovement, 0);
    const totalY = actionTracking.reduce((sum, action) => sum + action.yMovement, 0);
    const totalBattery = actionTracking.reduce((sum, action) => sum + action.batteryMovement, 0);
    const totalDistance = actionTracking.reduce((sum, action) => sum + action.distanceMovement, 0);
    
    return { 
      xMovement: totalX, 
      yMovement: totalY, 
      batteryMovement: totalBattery, 
      distanceMovement: totalDistance 
    };
  }, [actionTracking]);

  const robotCoord = useMemo(() => {
    if (!startCoord) return null;

    const storedOffset = useStore.getState().perScenarioOffsets?.[scenario] || { x: 0, y: 0 };

    const newX = Math.max(0, Math.min(startCoord.x + storedOffset.x + calculatedMovement.xMovement, 9));
    const newY = Math.max(0, Math.min(startCoord.y + storedOffset.y + calculatedMovement.yMovement, 7));

    return { x: newX, y: newY };
  }, [startCoord, calculatedMovement, scenario]);
  
  const setScenarioOffset = useStore((s) => s.setScenarioOffset);
  
  const prevScenarioRef = useRef(scenario);
  useEffect(() => {
    const prevScenario = prevScenarioRef.current;

    if (prevScenario !== scenario && robotCoord && startCoord) {
      const storedOffset = useStore.getState().perScenarioOffsets?.[prevScenario] || { x: 0, y: 0 };
      const currentOffset = {
        x: storedOffset.x + calculatedMovement.xMovement,
        y: storedOffset.y + calculatedMovement.yMovement
      };

      setScenarioOffset(prevScenario, currentOffset);

      useStore.getState().setActionTracking([]);
    }

    prevScenarioRef.current = scenario;
  }, [scenario, robotCoord, startCoord, calculatedMovement, setScenarioOffset]);

  const calculateActionMovement = (actionType, parameterValue = null, actionOrientation = "E") => {
    const moves = { batteryMovement: 0, distanceMovement: 0, xMovement: 0, yMovement: 0 };
    
    if (actionType === "moveForwardType") {
      const steps = parameterValue ? parseInt(parameterValue.match(/\d+/)?.[0] ?? "1", 10) : 0; 
      moves.batteryMovement = steps * BATTERY_DROP_PER_STEP;
      moves.distanceMovement = steps * FEET_PER_STEP;
      
      // Calculate x/y movement based on orientation
      if (actionOrientation === "N") moves.yMovement = steps;
      else if (actionOrientation === "S") moves.yMovement = -steps;
      else if (actionOrientation === "E") moves.xMovement = steps;
      else if (actionOrientation === "W") moves.xMovement = -steps;
      
    } else if (actionType === "toLocationType") {
          const rooms = {
          "Package room": {x:2,y:4}, 
          "Activity Area":{x:3,y:2},
          "Elderly room": {x:8,y:1},
          "Battery charging station":{x:9,y:7}
        };

      if (parameterValue && rooms[parameterValue]) {
        const target = rooms[parameterValue];
        const currentPos = robotCoord || startCoord;
        
        const dx = target.x - currentPos.x;
        const dy = target.y - currentPos.y;
        //Calulate line distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        moves.batteryMovement = parameterValue.toLowerCase() !== CHARGER_LABEL
        ? distance * BATTERY_DROP_PER_STEP : 0;
        moves.distanceMovement = distance * FEET_PER_STEP;
        moves.xMovement = dx;
        moves.yMovement = dy;
      }
    } else if (actionType === "rotateType") {
      if (parameterValue) {
        moves.batteryMovement = 0; 
        moves.distanceMovement = 0; 
        moves.xMovement = 0; 
        moves.yMovement = 0; 
      }
      else if (actionType === "grabType" || actionType === "putAsideType" || actionType === "handObjToType") {
        moves.batteryMovement = 0;
        moves.distanceMovement = 0; 
        moves.xMovement = 0;
        moves.yMovement = 0;
      }
      
    }
    
    return moves;
  };
  const addActionToTracking = (actionId, actionType) => {
    const moves = calculateActionMovement(actionType, null, orientation);
    const newAction = {
      id: actionId,
      batteryMovement: moves.batteryMovement,
      distanceMovement: moves.distanceMovement,
      xMovement: moves.xMovement,
      yMovement: moves.yMovement,
      children: []
    };
    
    useStore.getState().setActionTracking([
      ...useStore.getState().actionTracking,
      newAction
    ]);

    console.log(`Added action ${actionId} to tracking:`, moves);
  };
  
  const removeActionFromTracking = (actionId) => {

      const prev = useStore.getState().actionTracking;
      const actionToRemove = prev.find(action => action.id === actionId);
      if (actionToRemove) {
        console.log(`Removed action ${actionId} from tracking.`);
      }
      useStore.getState().setActionTracking(
        prev.filter(action => action.id !== actionId)
      );
    };

  const updateRobotOrientation = (rotationDirection, rotationTimes = 1) => {
    const directions = ["N", "E", "S", "W"]; 
    const currentIndex = directions.indexOf(orientation);
    
    const times = rotationTimes;
    
    let stepDirection;
    if (rotationDirection === "Clockwise") {
      stepDirection = 1; 
    } else if (rotationDirection === "Counterclockwise") {
      stepDirection = 3;
    } else {
      return; 
    }
    
    const totalSteps = stepDirection * times;
    const newIndex = (currentIndex + totalSteps) % 4;
    
    const newOrientation = directions[newIndex];
    setOrientation(newOrientation);
    useStore.getState().setRobotOrientation?.(newOrientation);
  };

  const addParameterToAction = (actionId, parameterId, parameterValue) => {
    const prev = useStore.getState().actionTracking;
    const updated = prev.map(action => {
      if (action.id === actionId) {
        const actionData = programData[actionId];
        if (actionData) {
          const updatedChildren = [...action.children, parameterId];
          let orientationBefore = action.orientationBefore;
          if (actionData.type === "rotateType" && action.children.length === 0) {
            orientationBefore = orientation;
          }
          
          const newMovement = calculateActionMovement(actionData.type, parameterValue, orientation);
          console.log(`Added parameter ${parameterId} to action ${actionId}:`, newMovement);
          return {
            ...action,
            children: updatedChildren,
            orientationBefore: orientationBefore, 
            batteryMovement: newMovement.batteryMovement,
            distanceMovement: newMovement.distanceMovement,
            xMovement: newMovement.xMovement,
            yMovement: newMovement.yMovement
          };
        }
      }
      return action;
    });
    useStore.getState().setActionTracking(updated);
  };

  const prevStartRef = useRef(startCoord);
  useEffect(() => {
    if (
      !prevStartRef.current ||
      prevStartRef.current.x !== startCoord?.x ||
      prevStartRef.current.y !== startCoord?.y
    ) 
    {

      const currentBattery = useStore.getState().batteryLevel;
      useStore.getState().setGlobalBatteryLevel(currentBattery);

      const currentDistance = useStore.getState().distanceTravel;
      useStore.getState().setGlobalDistanceTravel(currentDistance);

      prevStartRef.current = startCoord;
      setOrientation("E");
      useStore.getState().setRobotOrientation?.("E");
      setPendingMove(false);
      setPendingRotate(false);
      setPendingToConnector(false);
      setShowBatteryCharged(false);
      setShowError(false);
      setErrorMessage(null);
      useStore.getState().setActionTracking([]);
      useStore.getState().setBatteryResetActionCount(0); 
      useStore.getState().setDistanceResetActionCount(0);

      useStore.getState().setBatteryErrorBlockMade20(false);
      useStore.getState().setBatteryErrorBlockMade5(false); 

      const globalBattery = useStore.getState().globalBatteryLevel;
      const globalDistance = useStore.getState().globalDistanceTravel
      useStore.getState().setbatteryLevel(globalBattery);
      useStore.getState().setdistanceTravel(globalDistance);


    }
  }, [startCoord, setErrorMessage, setShowError]);

  const getRotationTransform = () => {
    switch (orientation) {
      case "N": return "rotate(-90deg)";
      case "S": return "rotate(90deg)";
      case "W": return "rotate(180deg)";
      default : return "";   // E
    }
  };

 // Scenario-specific
  const getErrorCoordinates = (currentScenario) => {
    const coordinates = {
      "Scenario 2": { redAsterisks: [[0,4],[0,5],[0,6],[1,4],[1,5],[1,6],[1,7],[2,4],[2,5],[2,6],[2,7]] },
      "Scenario 3": { redAsterisks: [[0,5],[1,4],[2,5],[2,7]] },
      "Scenario 4": { redAsterisks: [[1,6]] },
      "Scenario 5": {
        redAsterisks: [[5,0],[5,1],[5,2],[5,3],[6,3],[7,3],[8,3],[9,3]],
        blueAsterisks:[[0,5],[0,6],[1,4],[1,5],[2,5],[2,6]]
      }
    };
    return coordinates[currentScenario] || { redAsterisks: [], blueAsterisks: [] };
  };

  const getCurrentScenarioObjects = () => {
    return scenarioObjects[scenario] || {};
  };

  const getObjectAtPosition = (x, y, objectType = null) => {
    const objects = getCurrentScenarioObjects();
    
    for (const [objType, objData] of Object.entries(objects)) {
      if (objectType && objType !== objectType) continue;
      
      for (const coord of objData.coords) {
        if (coord[0] === x && coord[1] === y) {
          return {
            type: objType,
            coords: coord,
            iconKey: `${coord[0]},${coord[1]}`
          };
        }
      }
    }
    return null;
  };


  const getGrabbedObjectIconKey = (grabbedObj) => {
    if (!grabbedObj) return null;
    return grabbedObj.iconKey;
  };

  const checkForErrors = (coords, currentScenario) => {
    if (currentScenario === "Scenario 1") return;
    const { redAsterisks, blueAsterisks } = getErrorCoordinates(currentScenario);
    const onRed  = redAsterisks.some(([x,y])=>x===coords.x&&y===coords.y);
    const onBlue = currentScenario==="Scenario 5" &&
                   blueAsterisks?.some(([x,y])=>x===coords.x&&y===coords.y);

    if (onRed || onBlue) {
      const messageMap = {
        "Scenario 2":"Robot sensor is broken and it can't find the package. Please program robot fallback actions.",
        "Scenario 3":"The package is blocked by other residents looking for their packages. Please program robot fallback actions.",
        "Scenario 4":"The package is too heavy and exceeds the robot payload. Please program robot fallback actions.",
        "Scenario 5": onRed
          ? "The hallway is blocked by big carts and fences. The facility is undergoing renovation. Please program robot fallback actions."
          : "Other packages are blocking the package that the robot is looking for. Please program robot fallback actions."
      };
      setErrorMessage(messageMap[currentScenario]);
      setShowError(true);


    // Scenario 2 error to backend
    if (currentScenario === "Scenario 2") {
      if (onRed && lastScenario2Signal.current !== true) {
        console.log("Scenario 2 error has occurred.");
        stageScenario2SensorError(true);
        useStore.getState().setSensorWarning(true);
        useStore.getState().setScenario2ErrorBlockMade(true);
        lastScenario2Signal.current = true;
      } else if (!onRed && lastScenario2Signal.current !== false) {
        stageScenario2SensorError(false);
        useStore.getState().setScenario2ErrorBlockMade(false);
        lastScenario2Signal.current = false;
      }
    }

    // Scenario 3 error to backend
    else if (currentScenario === "Scenario 3") {
      if (onRed && lastScenario3Signal.current !== true) {
        console.log("Scenario 3 error has occurred.");
        stageScenario3PersonBlockError(true);
        useStore.getState().setPersonBlockWarning(true);
        useStore.getState().setScenario3ErrorBlockMade(true);
        lastScenario3Signal.current = true;
      } else if (!onRed && lastScenario3Signal.current !== false) {
        stageScenario3PersonBlockError(false);
        useStore.getState().setScenario3ErrorBlockMade(false);
        lastScenario3Signal.current = false;
      }
    }

    // Scenario 4 error to backend
    else if (currentScenario === "Scenario 4") {
      const lastAction = actionTracking[actionTracking.length - 1];

      const isGrabTargetParcel = lastAction && programData[lastAction.id]?.type === "grabType" &&
                programData[programData[lastAction.id]?.properties.thing]?.name === "Target Parcel";

      if (onRed && isGrabTargetParcel && lastScenario4Signal.current !== true) {
        console.log("Scenario 4 error has occurred.");
        stageScenario4HeavyError(true);
        useStore.getState().setHeavyWarning(true);
        useStore.getState().setScenario4ErrorBlockMade(true);
        lastScenario4Signal.current = true;
      } else if (!onRed && lastScenario4Signal.current !== false) {
        stageScenario4HeavyError(false);
        useStore.getState().setScenario4ErrorBlockMade(false);
        lastScenario4Signal.current = false;
      }
    }

    // Scenario 5 error to backend
    else if (currentScenario === "Scenario 5") {
      if (onRed && lastCartBlockSignal.current !== true) {
        console.log("Scenario 5 cart block error has occurred.");
        stageScenario5CartBlock(true);
        useStore.getState().setCartBlockWarning(true);
        useStore.getState().setScenario5CartErrorBlockMade(true);
        lastCartBlockSignal.current = true;
      } 
      else if (!onRed && lastCartBlockSignal.current !== false) {
        stageScenario5CartBlock(false);
        useStore.getState().setScenario5CartErrorBlockMade(false);
        lastCartBlockSignal.current = false;
      } 

      // heavy error for cart block scenario 5
      const lastGrabAction = actionTracking[actionTracking.length - 1];
      const isGrabObs = lastGrabAction && programData[lastGrabAction.id]?.type === "grabType" &&
                (programData[programData[lastGrabAction.id]?.properties.thing]?.name === "Fence" || 
                programData[programData[lastGrabAction.id]?.properties.thing]?.name === "Cart");

      if (onRed && lastCartBlockSignal.current === true && isGrabObs) {
        stageScenario4HeavyError(true);
        useStore.getState().setHeavyWarning(true);
        useStore.getState().setScenario4ErrorBlockMade(true);
      }
      else if (!onRed && lastCartBlockSignal.current !== false) {
        stageScenario4HeavyError(false);
        useStore.getState().setHeavyWarning(false);
        useStore.getState().setScenario4ErrorBlockMade(false);
      }
      
      if (onBlue && lastPackageBlockSignal.current !== true) {
        console.log("Scenario 5 package block error has occurred.");
        stageScenario5PackageBlock(true);
        useStore.getState().setPackageBlockWarning(true);
        useStore.getState().setScenario5PackageErrorBlockMade(true);
        lastPackageBlockSignal.current = true;
      } 
      else if (!onBlue && lastPackageBlockSignal.current !== false) {
        stageScenario5PackageBlock(false);
        useStore.getState().setScenario5PackageErrorBlockMade(false);
        lastPackageBlockSignal.current = false;
      }
    }
  } 
  };

  useEffect(() => {
  // Reset all scenario signals when scenario changes
  lastScenario2Signal.current = false;
  lastScenario3Signal.current = false;
  lastScenario4Signal.current = false;
  lastCartBlockSignal.current = false;
  lastPackageBlockSignal.current = false;

  useStore.getState().setScenario2ErrorBlockMade(false);
  useStore.getState().setScenario3ErrorBlockMade(false);
  useStore.getState().setScenario4ErrorBlockMade(false);
  useStore.getState().setScenario5CartErrorBlockMade(false);
  useStore.getState().setScenario5PackageErrorBlockMade(false);

  stageScenario2SensorError(false);
  stageScenario3PersonBlockError(false);
  stageScenario4HeavyError(false);
  stageScenario5CartBlock(false);
  stageScenario5PackageBlock(false);

  setErrorMessage(null);
  setShowError(false);
  setGrabbedObject(null);
  setIsObjectGrabbed(false);
  setIsObjectFading(false);
  setIsObjectBeingHanded(false);
  setObjectWithElderly(false);
  setHasThingParam(false);
  setHasPersonParam(false);
  setPutAsideAtCoord(null);
  setParcelLeftAtCoord(null);
  setParcelDroppedByDeletion(false);
  setDroppedObject(null);
  
}, [scenario]);

  useEffect(() => {
    const initialPositions = {};
    const currentScenarioObjects = scenarioObjects[scenario] || {};
    for (const [objType, objData] of Object.entries(currentScenarioObjects)) {
      for (const coord of objData.coords) {
        const key = `${coord[0]},${coord[1]}`;
        initialPositions[key] = objType;
      }
    }
    setObjectPositions(initialPositions);
  }, [scenario]);


  const lastProcessedTransfer = useRef(null);

  const excuseMeCountRef = useRef(0);

    
  // ──────────────────────────────
  // Handle Addition
  // ──────────────────────────────

  useEffect(() => {
    if (!lastTransfer || lastTransfer.timestamp === lastProcessedTransfer.current) return;
    
    lastProcessedTransfer.current = lastTransfer.timestamp;
    
    const { data, sourceInfo, destInfo } = lastTransfer;
    
    // Check if this is an action being added
    if (data.type === "moveForwardType" || data.type === "toLocationType" || data.type === "rotateType" || data.type === "sayType" || data.type === "grabType" || data.type === "putAsideType" || data.type === "handObjToType" ) {
      if (data.type === "handObjToType") {
        setHasThingParam(false);
        setHasPersonParam(false);
        setTargetPersonForHand(null);
      }
      const parentData = programData[destInfo.parentId];
      const actualBlockId = parentData?.properties?.children?.[destInfo.idx];
      
      if (actualBlockId) {
        addActionToTracking(actualBlockId, data.type);
      }
    }
    //It is MovementType
    else if (data.type === "movementType" && destInfo.parentId) {
      const parentAction = programData[destInfo.parentId];
      //If it's move
      if (parentAction?.type === "moveForwardType") {
        const parameterValue = data.name; 
        const parameterId = data.ref;
        addParameterToAction(destInfo.parentId, parameterId, parameterValue);
      //If it's rotate
      } else if (parentAction?.type === "rotateType") {
        const parameterValue = data.name;
        const parameterId = data.ref;
        
        addParameterToAction(destInfo.parentId, parameterId, parameterValue);
        
        const currentAction = actionTracking.find(action => action.id === destInfo.parentId);
        if (currentAction) {
          let direction = null;
          let times = null;
          
          const allChildren = [...currentAction.children, parameterId];
          
          allChildren.forEach(childId => {
            const childData = programData[childId];
            if (childData?.name?.includes("wise")) {
              direction = childData.name;
            } else if (childData?.name?.includes("time")) {
              times = parseInt(childData.name.match(/\d+/)?.[0] ?? "1", 10);
            }
          });
          
          if (direction !== null && times !== null) {
            updateRobotOrientation(direction, times);
          }
        }
      }
    }
    
    //PlaceType
    else if (data.type === "placeType" && destInfo.parentId) {
      const parameterValue = data.name;
      const parameterId = data.ref;
      addParameterToAction(destInfo.parentId, parameterId, parameterValue);
    }

    //SpeechType
    else if (data.type === "speechType" && destInfo.parentId) {
      const parameterValue = data.name;

      const handleFlush = (json) => {

        if (json.param_classification) {
          console.log("Scoped speech param from LLM:", json.param_classification);
          const paramType = json.param_classification;

          const direction = useStore.getState().robotOrientation;
          const currentRobotCoord = robotCoord;

          if (!currentRobotCoord) return;

          const { x, y } = currentRobotCoord;
          let targetX = x;
          let targetY = y;

          if (direction === "N") targetY += 1;
          else if (direction === "S") targetY -= 1;
          else if (direction === "W") targetX -= 1;
          else if (direction === "E") targetX += 1;

          const targetKey = `${targetX},${targetY}`;
          const updatedIcons = { ...icons };

          if (paramType === "excuse_me" && scenario === "Scenario 3") {
            console.log(`Looking for person at ${targetKey} (robot facing ${direction})`);

            excuseMeCountRef.current = (excuseMeCountRef.current || 0) + 1;
            const currentCount = excuseMeCountRef.current;

            if ((icons[targetKey] && icons[targetKey].includes("employee")) && currentCount >=3) {
              delete updatedIcons[targetKey];
              if (onIconsUpdate) {
                onIconsUpdate(updatedIcons);
              }
              setActionMessage("Other resident stepped aside for Stretch");
            }
            else if (currentCount === 1) {
              setActionMessage("Other resident is on their headphones and didn't hear what Stretch said");
            }
            else if (currentCount === 2) {
              setActionMessage("Other resident is trying to move their own heavy package and can't clear the path for Stretch");
            }
          }
          
          else if ((paramType === "ask_heavy_help" || paramType === "ask_for_grab_help" || paramType === "ask_grab_help" || paramType === "ask_for_pick_remove_help") && scenario === "Scenario 5") {
            let removed = false;
            let removedType = "";

            const fencePositions = ['4,0', '4,1', '4,2', '4,3'];
            const cartPositions = ['5,4', '6,4', '7,4', '8,4', '9,4'];
            const otherParcelPositions = ['1,7', '1,5', '2,6', '0,6'];

            if (fencePositions.includes(targetKey) && icons[targetKey]) {
              delete updatedIcons[targetKey];
              removed = true;
              removedType = "fence";
            }
            else if (cartPositions.includes(targetKey) && icons[targetKey]) {
              delete updatedIcons[targetKey];
              removed = true;
              removedType = "cart";
            }
            else if (otherParcelPositions.includes(targetKey) && icons[targetKey]) {
              if (paramType === "ask_for_grab_help"|| paramType === "ask_grab_help" || paramType === "ask_for_pick_remove_help") {
                delete updatedIcons[targetKey];
                removed = true;
                removedType = "other parcel";
              }
            }
            if (removed) {
              if (onIconsUpdate) {
                console.log("reach here");
                onIconsUpdate(updatedIcons);
              }
              setObjectPositions(prev => {
                const newPositions = { ...prev };
                delete newPositions[targetKey];
                return newPositions;
              });

              const message = removedType === "other parcel"
                ? "Other Parcel is moved out of the way with the help of the employee"
                : `${removedType.charAt(0).toUpperCase() + removedType.slice(1)} is moved out of the way with the help of the employee`;

              setActionMessage(message);
            }
          }
          else if ((paramType === "ask_heavy_help" || paramType === "ask_for_grab_help" || paramType === "ask_grab_help") && scenario === "Scenario 4") {
            setObjectWithElderly(true);
            setObjectWithPerson("Elderly Person");
            setActionMessage("Elderly Person received Target Parcel!");
            setIsObjectGrabbed(false);
            setIsObjectBeingHanded(false);

          }
        }
        unsubscribeFlush(handleFlush);
      };

      subscribeFlush(handleFlush);

      const parameterId = data.ref;
      addParameterToAction(destInfo.parentId, parameterId, parameterValue);
    }

    //Grab
    else if (data.type === "thingType" && destInfo.parentId) {
    const parentAction = programData[destInfo.parentId];

    if (parentAction?.type === "grabType") {
      const parameterValue = data.name; 
      const parameterId = data.ref;
      addParameterToAction(destInfo.parentId, parameterId, parameterValue);

      // Handle all grabbable object types
      if (["Target Parcel", "Other Parcel", "Fence", "Cart"].includes(parameterValue)) {
        handleObjectAction(parentAction.type, parameterValue);
      }
    }

    else if (parentAction?.type === "putAsideType") {
      const parameterValue = data.name; 
      const parameterId = data.ref;
      addParameterToAction(destInfo.parentId, parameterId, parameterValue);

      if (["Target Parcel", "Other Parcel", "Fence", "Cart"].includes(parameterValue) && isObjectGrabbed) {
        handleObjectAction(parentAction.type, parameterValue);
      }
    }

    else if (parentAction?.type === "handObjToType") {
        const parameterValue = data.name; 
        const parameterId = data.ref;
        
        addParameterToAction(destInfo.parentId, parameterId, parameterValue);
        setHasThingParam(true);

        if (hasPersonParam && isObjectGrabbed) { 
          handleObjectAction(parentAction.type);
        } 
      }
    }
    else if (data.type === "personType" && destInfo.parentId) {
      const parentAction = programData[destInfo.parentId];
      console.log("wahtis parent action", parentAction)
      console.log("wahtis parent action", parentAction?.type)
      if (parentAction?.type === "handObjToType") {
        const parameterValue = data.name; 
        const parameterId = data.ref;      
        addParameterToAction(destInfo.parentId, parameterId, parameterValue);
        setHasPersonParam(true);
        setTargetPersonForHand(parameterValue); 
      }
    }
  }, [lastTransfer, programData]);

  useEffect(() => {
    if (hasThingParam && hasPersonParam && isObjectGrabbed) {
      handleObjectAction("handObjToType");
    }
  }, [hasThingParam, hasPersonParam, isObjectGrabbed]);

  // ──────────────────────────────
  // Handle Grab
  // ──────────────────────────────
  const handleObjectAction = (actionType, parameterValue) => {
    console.log("handleObjectAction:", actionType, parameterValue);
    console.log("current123123:", {
      robotCoord,
      isObjectGrabbed,
      grabbedObject,
      hasThingParam,
      hasPersonParam,
      targetPersonForHand
    });
    switch (actionType) {
      case "grabType":
        if (!robotCoord) return;

        let canGrab = false;
        let objectToGrab = null;
        const currentPosKey = `${robotCoord.x},${robotCoord.y}`;

        const objectAtCurrentPos = objectPositions[currentPosKey];

        if (objectAtCurrentPos === parameterValue) {
          canGrab = true;
          objectToGrab = {
            type: parameterValue,
            coords: [robotCoord.x, robotCoord.y],
            iconKey: currentPosKey
          };
        }
        console.log("abcabc", isObjectGrabbed, isObjectFading, objectWithElderly)
        const canCurrentlyGrab = !isObjectGrabbed && !isObjectFading && !objectWithElderly;
        console.log("asdasdad", canCurrentlyGrab, canGrab, objectToGrab)
        if (canCurrentlyGrab && canGrab && objectToGrab) {

          setGrabbedObject(objectToGrab);
          setIsObjectGrabbed(true);
          setIsObjectFading(false);
          setIsObjectBeingHanded(false);
          setObjectWithElderly(false);
          setActionMessage(`Stretch grabbed ${parameterValue}!`);

          setObjectPositions(prev => {
            const newPositions = { ...prev };
            delete newPositions[currentPosKey];
            return newPositions;
          });

          setParcelLeftAtCoord(null);
          setParcelDroppedByDeletion(false);
          setDroppedObject(null);
          setPutAsideAtCoord(null);
        }
        break;

      case "putAsideType":
        if (isObjectGrabbed && grabbedObject) {
          const currentRobotCoord = robotCoord;
          const objectToPutAside = grabbedObject;

          // Start the fade animation
          setIsObjectFading(true);
          setPutAsideAtCoord(currentRobotCoord);

          setTimeout(() => {
            setIsObjectGrabbed(false);
            setIsObjectBeingHanded(false);
            setObjectWithElderly(false);
            setPutAsideAtCoord(null);
            setHasThingParam(false);


            setTimeout(() => {
              if (!isObjectGrabbed) {
                setGrabbedObject(null);
              }
            }, 100);
          }, 500);
          setIsObjectFading(false);

          setActionMessage(`${objectToPutAside.type} put aside for now!`);
        }
        break;

      case "handObjToType":
        if (robotCoord && isObjectGrabbed && grabbedObject) {
          if (!["Target Parcel", "Other Parcel"].includes(grabbedObject.type)) {
            if (hasThingParam && hasPersonParam) {
              setActionMessage(`Cannot hand ${grabbedObject.type} to a person!`);
            }
            break;
          }
          const personPositions = {
            "Elderly Person": { x: 9, y: 1 },
            "Package room employee": { x: 0, y: 7 },
            "Receptionist": { x: 7, y: 6 }
          };

          const targetPos = personPositions[targetPersonForHand];
          if (targetPos) {
            const dx = Math.abs(robotCoord.x - targetPos.x);
            const dy = Math.abs(robotCoord.y - targetPos.y);
            const isAdjacent = (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);

            if (isAdjacent) {
              const objectToHand = grabbedObject;

              setIsObjectBeingHanded(true);

              setTimeout(() => {
                setIsObjectGrabbed(false);
                setIsObjectBeingHanded(false);
                setObjectWithElderly(true);
                setObjectWithPerson(targetPersonForHand);
              }, 800);
              setActionMessage(`${targetPersonForHand} received ${objectToHand.type}!`);
            }
          }
        }
        break;
    }
  };


  // ──────────────────────────────
  // Handle deletions
  // ──────────────────────────────
  useEffect(() => {
    if (actionDeleted && deletedFieldInfo && deletedParentInfo) {
      console.log("Deletion - Field:", deletedFieldInfo);
      console.log("Deletion - Parent:", deletedParentInfo);
      
      // Case 1: Deleting an action where field name is "Children" which is a action 
      if (deletedFieldInfo.name === "Children" && deletedFieldInfo.isList) {
        if (deletedData && deletedData.id) {
          const deletedActionId = deletedData.id;
        if (deletedData.type === "rotateType") {
          const actionBeingDeleted = actionTracking.find(action => action.id === deletedActionId);
          const targetOrientation = actionBeingDeleted?.orientationBefore || "E";
          setOrientation(targetOrientation);
          useStore.getState().setRobotOrientation?.(targetOrientation);
        }
        if (deletedData.type === "grabType") {

          if (isObjectGrabbed && grabbedObject && robotCoord) {
            setParcelLeftAtCoord(robotCoord);
            setDroppedObject(grabbedObject);
            setParcelDroppedByDeletion(true);
            
            const posKey = `${robotCoord.x},${robotCoord.y}`;
            setObjectPositions(prev => ({
              ...prev,
              [posKey]: grabbedObject.type
            }));
          }
          setIsObjectGrabbed(false);
          setIsObjectFading(false);       
          setIsObjectBeingHanded(false);   
          setObjectWithElderly(false);    
          setHasThingParam(false);
          setGrabbedObject(null);  
        }
        else if (deletedData.type === "putAsideType") {

          if (grabbedObject) {
            setIsObjectGrabbed(true);  
            setIsObjectFading(false);   
            setHasThingParam(false);
            setPutAsideAtCoord(null);
            
          }
        }
        else if (deletedData.type === "handObjToType") {

          setHasThingParam(false);
          setHasPersonParam(false);
          setTargetPersonForHand(null);
          
          if (objectWithElderly) {
            setObjectWithElderly(false);
            const hasActiveGrab = actionTracking.some(action => {
              const actionData = programData[action.id];
              return actionData?.type === "grabType" && action.children.length > 0;
            });
            setIsObjectGrabbed(hasActiveGrab);
          }
          if (isObjectBeingHanded) {
            setIsObjectBeingHanded(false);
            const hasActiveGrab = actionTracking.some(action => {
              const actionData = programData[action.id];
              return actionData?.type === "grabType" && action.children.length > 0;
            });
            setIsObjectGrabbed(hasActiveGrab);
          }
        }
        removeActionFromTracking(deletedActionId);
      }

    } 

      // Case 2: Deleting a parameter from Move Forward action
      else if (deletedFieldInfo.name === "Grid Increments" && deletedFieldInfo.value === "direction") {
        const actionId = deletedParentInfo.id;
        const prev = useStore.getState().actionTracking;
        const updated = prev.map(action => {
          if (action.id === actionId) {
            return {
              ...action,
              children: [], 
              batteryMovement: 0, 
              distanceMovement: 0,
              xMovement: 0,
              yMovement: 0
            };
          }
          return action;
        });
        useStore.getState().setActionTracking(updated);}

      
      // Case 3: Deleting a parameter from To Connector action
      else if (deletedFieldInfo.name === "Location" && deletedFieldInfo.value === "place") {
        const actionId = deletedParentInfo.id;
        const prev = useStore.getState().actionTracking;
        const updated = prev.map(action => {
          if (action.id === actionId) {
            return {
              ...action,
              children: [], 
              batteryMovement: 0, 
              distanceMovement: 0,
              xMovement: 0,
              yMovement: 0
            };
          }
          return action;
        });
        useStore.getState().setActionTracking(updated);}

      else if (deletedFieldInfo.name === "Rotation Direction" && deletedFieldInfo.value === "angleDirection") {
        const actionId = deletedParentInfo.id;
        const parameterIdToDelete = deletedData.ref;
        
        const currentAction = useStore.getState().actionTracking.find(action => action.id === actionId);
        const targetOrientation = currentAction?.orientationBefore || "E";
        
        setOrientation(targetOrientation);
        useStore.getState().setRobotOrientation?.(targetOrientation);
        
        const prev = useStore.getState().actionTracking;
        const updated = prev.map(action => {
          if (action.id === actionId) {
            return {
              ...action,
              children: action.children.filter(childId => childId !== parameterIdToDelete),
              batteryMovement: 0,
              distanceMovement: 0,
              xMovement: 0,
              yMovement: 0
            };
          }
          return action;
        });
        useStore.getState().setActionTracking(updated);
      }

      else if (deletedFieldInfo.name === "Rotation Times" && deletedFieldInfo.value === "rotationTimes") {
        const actionId = deletedParentInfo.id;
        const parameterIdToDelete = deletedData.ref;
        
        const currentAction = useStore.getState().actionTracking.find(action => action.id === actionId);
        const targetOrientation = currentAction?.orientationBefore || "E";
        
        setOrientation(targetOrientation);
        useStore.getState().setRobotOrientation?.(targetOrientation);
        
        const prev = useStore.getState().actionTracking;
        const updated = prev.map(action => {
          if (action.id === actionId) {
            return {
              ...action,
              children: action.children.filter(childId => childId !== parameterIdToDelete),
              batteryMovement: 0,
              distanceMovement: 0,
              xMovement: 0,
              yMovement: 0
            };
          }
          return action;
        });
        useStore.getState().setActionTracking(updated);
      }

      else if (deletedFieldInfo.name === "Object" && deletedFieldInfo.value === "thing" && deletedParentInfo.type === "grabType") {

        if (isObjectGrabbed && grabbedObject && robotCoord) {
          const posKey = `${robotCoord.x},${robotCoord.y}`;
          setObjectPositions(prev => ({
            ...prev,
            [posKey]: grabbedObject.type  
          }));
          
          setParcelLeftAtCoord(robotCoord);
          setDroppedObject(grabbedObject);
          setParcelDroppedByDeletion(true);
        }
        
        setIsObjectGrabbed(false);
        setIsObjectFading(false);      
        setIsObjectBeingHanded(false);  
        setObjectWithElderly(false);    
        setHasThingParam(false);
        setGrabbedObject(null);
      }
      else if (deletedFieldInfo.name === "Object" && deletedFieldInfo.value === "thing" && deletedParentInfo.type === "putAsideType") {
        
        if (grabbedObject) {
          setIsObjectGrabbed(true);  
          setIsObjectFading(false);
          setHasThingParam(false);
          setPutAsideAtCoord(null);
        }
      }
      
      //Deletion for handle
      else if ((deletedFieldInfo.name === "Object" || deletedFieldInfo.name === "Person") && deletedParentInfo.type === "handObjToType") {        
        if (deletedFieldInfo.name === "Object") {
          setHasThingParam(false);
        } 

        else if (deletedFieldInfo.name === "Person") {
          setHasPersonParam(false);
          setTargetPersonForHand(null);
        }
          
        if (objectWithElderly) {
          setObjectWithElderly(false);
          const hasActiveGrab = actionTracking.some(action => {
            const actionData = programData[action.id];
            return actionData?.type === "grabType" && action.children.length > 0;
            });
          setIsObjectGrabbed(hasActiveGrab);
        }
        if (isObjectBeingHanded) {
          setIsObjectBeingHanded(false);
          const hasActiveGrab = actionTracking.some(action => {
              const actionData = programData[action.id];
              return actionData?.type === "grabType" && action.children.length > 0;
            });
            setIsObjectGrabbed(hasActiveGrab);
          }
        }
      setDeletedFieldInfo(null);
      setDeletedParentInfo(null);
      setActionDeleted(false);
    }
  }, [actionDeleted, deletedFieldInfo, deletedParentInfo, deletedData, setActionDeleted, setDeletedFieldInfo, setDeletedParentInfo, programData, actionTracking, objectWithElderly, isObjectBeingHanded]);  
  // ──────────────────────────────
  // Check for errors when robot position changes
  // ──────────────────────────────
  useEffect(() => {
    if (robotCoord) {
      setTimeout(() => {
      checkForErrors(robotCoord, scenario);
    }, 1);
    }
  }, [robotCoord, scenario]);

  const prevOrientationRef = useRef("E");
  useEffect(() => {
    prevOrientationRef.current = orientation;
  }, [orientation]);


  // ──────────────────────────────
  // Warning-flip + backend notify
  // ──────────────────────────────
  const batteryLevel          = useStore((s) => s.batteryLevel);
  const setBattery20Warning   = useStore((s) => s.setBattery20Warning);
  const setBattery5Warning    = useStore((s) => s.setBattery5Warning);
  const prevLevelRef          = useRef(batteryLevel);

  useEffect(() => {
    console.log("this is batteryLevel", batteryLevel); 

    if (prevLevelRef.current > 20 && batteryLevel <= 20 && batteryLevel > 5) {
      setBattery20Warning(true);
    }
    if (prevLevelRef.current > 5 && batteryLevel <= 5) {
      setBattery20Warning(false);
      setBattery5Warning(true);
    }
    prevLevelRef.current = batteryLevel;
  }, [batteryLevel, setBattery20Warning, setBattery5Warning]);

  useEffect(() => {


    const totalBatteryUsed = calculatedMovement.batteryMovement;
    const totalDistance = calculatedMovement.distanceMovement;


    const batteryResetActionCount = useStore.getState().batteryResetActionCount ?? 0;
    const postChargeActions = actionTracking.slice(batteryResetActionCount);
    const postChargeBatteryUsed = postChargeActions.reduce((sum, a) => sum + a.batteryMovement, 0);
    console.log("batteryResetActionCount, postChargeActions, postChargeBatteryUsed, ", batteryResetActionCount, postChargeActions, postChargeBatteryUsed);

    const globalBattery = useStore.getState().globalBatteryLevel ?? 100;
    const newBatteryLevel = Math.max(0, globalBattery - postChargeBatteryUsed);
    console.log("what is globalBattery, postChargeBatteryUsed, ", globalBattery, postChargeBatteryUsed);
    console.log("what is newBattery here and does it have to do with the jump, ", newBatteryLevel);

    const distanceResetActionCount = useStore.getState().distanceResetActionCount ?? 0;
    const postResetActions = actionTracking.slice(distanceResetActionCount);
    const postResetDistanceUsed = postResetActions.reduce((sum, a) => sum + a.distanceMovement, 0);

    const globalDistance = useStore.getState().globalDistanceTravel ?? 0;
    const newDistanceLevel = globalDistance + postResetDistanceUsed;

    useStore.getState().setbatteryLevel(newBatteryLevel); 
    useStore.getState().setdistanceTravel(newDistanceLevel);

    
  }, [calculatedMovement, actionTracking, programData]);
  
  useEffect(() => {
    console.log("Action Tracking Array:", actionTracking);
    console.log("Start Position:", startCoord);
    console.log("Calculated Movement:", calculatedMovement);
    console.log("Robot Location:", robotCoord);
    console.log("programData", programData)
    console.log("lastTransfer", lastTransfer)

  }, [actionTracking, startCoord, calculatedMovement, robotCoord]);


  // ──────────────────────────────
  // Rendering 
  // ──────────────────────────────

  // Define rectangular regions for each room
  const roomRects = [
    {
      name: "Package room",
      from: [0, 4],  // bottom-left
      to: [2, 7],    // top-right
      borderColor: "purple",
    },
    {
      name: "Activity area",
      from: [1, 0],  // bottom-left
      to: [3, 2],    // top-right 
      borderColor: "goldenrod",
    },
    {
      name: "Elderly room",
      from: [5, 0],  // bottom-left
      to: [9, 3],    // top-right 
      borderColor: "steelblue",
    },
  ];

  const roomColorMap = {
  "Package room": "#e8e1f5",
  "Activity area": "#fdf6f0",
  "Elderly room": "#eef3f9"
};

function hexToRgba(hex, alpha = 1) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

  const getCellBorders = (x, y) => {
    const defaultBorder = "1px solid rgba(200, 200, 200, 0.4)";
    const borders = {
    borderTop: defaultBorder,
    borderBottom: defaultBorder,
    borderLeft: defaultBorder,
    borderRight: defaultBorder,
  };

    for (const { from, to, borderColor } of roomRects) {
      const [x1, y1] = from;
      const [x2, y2] = to;

      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      // Top border
      if (y === maxY && x >= minX && x <= maxX) {
        borders.borderTop = `2.5px solid ${borderColor}`;
      }

      // Bottom border
      if (y === minY && x >= minX && x <= maxX) {
        borders.borderBottom = `2.5px solid ${borderColor}`;
      }

      // Left border
      if (x === minX && y >= minY && y <= maxY) {
        borders.borderLeft = `2.5px solid ${borderColor}`;
      }

      // Right border
      if (x === maxX && y >= minY && y <= maxY) {
        borders.borderRight = `2.5px solid ${borderColor}`;
      }
    }

    return borders;
};

  const getRoomColor = (x, y) => {
  for (const { from, to, name } of roomRects) {
    const [x1, y1] = from;
    const [x2, y2] = to;

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      return roomColorMap[name] || null;
    }
  }
  return null;
};

  const highlightSet = useMemo(() => {
    const pairs = highlight.map((p) => (Array.isArray(p) ? p : [p.x, p.y]));
    return new Set(pairs.map(([x, y]) => `${x},${y}`));
  }, [highlight]);

  const pageStyle = { minHeight:"40vh", width:"100%", backgroundColor:"#333" };
  const gridStyle = {
    display:"grid", width:"100%", maxWidth:"100%",
    gridTemplateColumns:"repeat(10,10%)",
    gridTemplateRows:`repeat(8,${cellSize}px)`
  };
  const cellStyle = {
    backgroundColor:"#fff", 
    // border:"1px solid #ddd", 
    boxSizing:"border-box"
  };
  const labelStyle = {
    position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
    fontSize:14, color:"#999", opacity:0.8, pointerEvents:"none", zIndex:1
  };
  const overlayLabelStyle = (from, to) => {
    const [x1,y1] = from, [x2,y2] = to;
    return {
      position:"absolute",
      left:`${Math.min(x1,x2)*10}%`,
      width:`${(Math.abs(x2-x1)+1)*10}%`,
      top:`${(7-Math.max(y1,y2))*cellSize}px`,
      height:`${(Math.abs(y2-y1)+1)*cellSize}px`,
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"#999", opacity:0.8, fontSize:18, pointerEvents:"none", zIndex:5
    };
  };
  const iconStyle = (isRobot)=>({
    width:"80%", height:"80%", objectFit:"contain", pointerEvents:"none",
    position:"absolute", top:"50%", left:"50%",
    transform:`translate(-50%,-50%) ${isRobot?getRotationTransform():""}`,
    filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.2))"

  });

  return (
    <div style={pageStyle}>
      {labelsOverGrid.map(({text,from,to},i)=>(
        <Typography key={i} style={overlayLabelStyle(from,to)}>{text}</Typography>
      ))}

      {showBatteryCharged && (
        <Paper sx={{position:"absolute", top:"50%", left:"50%",
          backgroundColor:"#4caf50", color:"#fff", p:"10px 16px",
          maxWidth:400, display:"flex", alignItems:"center", zIndex:10}}>
          <Typography variant="body2" sx={{fontWeight:500, lineHeight:1.4}}>
            🔋 Stretch's battery is full again!
          </Typography>
          <Button variant="contained" onClick={()=>setShowBatteryCharged(false)}
            sx={{ml:2, backgroundColor:"#4caf50", "&:hover":{backgroundColor:"#4caf50"}}}>
            OK
          </Button>
        </Paper>
      )}

      {showSensorCleared && (
        <Paper sx={{position:"absolute", top:"50%", left:"50%",
          backgroundColor:"#4caf50", color:"#fff", p:"10px 16px",
          maxWidth:400, display:"flex", alignItems:"center", zIndex:10}}>
          <Typography variant="body2" sx={{fontWeight:500, lineHeight:1.4}}>
            Sensor error is resolved! Stretch may resume the package delivery task.
          </Typography>
          <Button variant="contained" onClick={()=>setShowSensorCleared(false)}
            sx={{ml:2, backgroundColor:"#4caf50", "&:hover":{backgroundColor:"#4caf50"}}}>
            OK
          </Button>
        </Paper>
      )}

      {showPersonblockCleared && (
        <Paper sx={{position:"absolute", top:"50%", left:"50%",
          backgroundColor:"#4caf50", color:"#fff", p:"10px 16px",
          maxWidth:400, display:"flex", alignItems:"center", zIndex:10}}>
          <Typography variant="body2" sx={{fontWeight:500, lineHeight:1.4}}>
            Person block error is resolved! Stretch may resume the package delivery task.
          </Typography>
          <Button variant="contained" onClick={()=>setShowPersonblockCleared(false)}
            sx={{ml:2, backgroundColor:"#4caf50", "&:hover":{backgroundColor:"#4caf50"}}}>
            OK
          </Button>
        </Paper>
      )}

      {showHeavyCleared && (
        <Paper sx={{position:"absolute", top:"50%", left:"50%",
          backgroundColor:"#4caf50", color:"#fff", p:"10px 16px",
          maxWidth:400, display:"flex", alignItems:"center", zIndex:10}}>
          <Typography variant="body2" sx={{fontWeight:500, lineHeight:1.4}}>
            Object heavy error is resolved! Stretch may resume its task.
          </Typography>
          <Button variant="contained" onClick={()=>setShowHeavyCleared(false)}
            sx={{ml:2, backgroundColor:"#4caf50", "&:hover":{backgroundColor:"#4caf50"}}}>
            OK
          </Button>
        </Paper>
      )}

      {showCartblockCleared && (
        <Paper sx={{position:"absolute", top:"50%", left:"50%",
          backgroundColor:"#4caf50", color:"#fff", p:"10px 16px",
          maxWidth:400, display:"flex", alignItems:"center", zIndex:10}}>
          <Typography variant="body2" sx={{fontWeight:500, lineHeight:1.4}}>
            Cart/fence block error is resolved! Stretch may resume movement.
          </Typography>
          <Button variant="contained" onClick={()=>setShowCartblockCleared(false)}
            sx={{ml:2, backgroundColor:"#4caf50", "&:hover":{backgroundColor:"#4caf50"}}}>
            OK
          </Button>
        </Paper>
      )}

      {showPackageblockCleared && (
        <Paper sx={{position:"absolute", top:"50%", left:"50%",
          backgroundColor:"#4caf50", color:"#fff", p:"10px 16px",
          maxWidth:400, display:"flex", alignItems:"center", zIndex:10}}>
          <Typography variant="body2" sx={{fontWeight:500, lineHeight:1.4}}>
            Package block error is resolved! Stretch may resume the package delivery task.
          </Typography>
          <Button variant="contained" onClick={()=>setShowPackageblockCleared(false)}
            sx={{ml:2, backgroundColor:"#4caf50", "&:hover":{backgroundColor:"#4caf50"}}}>
            OK
          </Button>
        </Paper>
      )}

      <div style={gridStyle}>
        {Array.from({length:80}).map((_,idx)=>{
          const x = idx % 10;
          const y = 7 - Math.floor(idx/10);
          const key = `${x},${y}`;
          const isHL = highlightSet.has(key);

          const parcelCoords = {
            "Target Parcel": "1,6",
            "Other Parcel": "0,6",
          };
          
          const robotImg = Object.values(icons).find(v=>typeof v==="string" && v.includes("robot"));
          const robotKey = robotCoord ? `${robotCoord.x},${robotCoord.y}` : null;
          let iconSrc;
          if (key === robotKey) {
            iconSrc = robotImg;
          } 
          else if (objectPositions[key]) {
            const objectType = objectPositions[key];
            if (objectType === "Target Parcel") {
              iconSrc = icons["1,6"];
            } else if (objectType === "Other Parcel") {
              iconSrc = icons["0,6"];
            } else if (objectType === "Fence") {
              iconSrc = icons[key];;
            } else if (objectType === "Cart") {
              iconSrc = icons[key];;
            }
          }
          else if (icons[key] === robotImg) {
            iconSrc = null;
          }

          else if (icons[key] && !icons[key].includes("delivery") &&  !icons[key].includes("barrier") && !icons[key].includes("money")) {      
            iconSrc = icons[key]; 
          }
          else {
            iconSrc = null;
          }
          
          const label   = labelsOverGrid[key];


          return (

            <div
              key={idx}
              style={{
                ...cellStyle,
                height: cellSize,
                backgroundColor: isHL ? color : getRoomColor(x, y) || "#fff",
                position: "relative",
                ...getCellBorders(x, y),  
              }}
            >

              {label && <Typography sx={labelStyle}>{label}</Typography>}
              {iconSrc && (
                typeof iconSrc === "string"
                  ? <img src={iconSrc} alt="icon" style={iconStyle(key === robotKey)} />
                  : <span style={iconStyle(key === robotKey)}>{iconSrc}</span>
              )}

              {key === robotKey && (isObjectGrabbed || isObjectFading || isObjectBeingHanded) && grabbedObject && (
                <img
                  src={(() => {
                    if (grabbedObject.type === "Target Parcel") return icons["1,6"];
                    else if (grabbedObject.type === "Other Parcel") return icons["0,6"];
                    else if (grabbedObject.type === "Fence") return icons["4,0"];
                    else if (grabbedObject.type === "Cart") return icons["5,4"];
                    return icons["1,6"];
                  })()}
                  alt="grabbed object"
                  style={{
                    ...iconStyle(false),
                    zIndex: 10,
                    transform: isObjectBeingHanded
                      ? (() => {
                        const personPositions = {
                          "Elderly Person": { x: 9, y: 1 },
                          "Package room employee": { x: 0, y: 7 },
                          "Receptionist": { x: 7, y: 6 }
                        };

                        for (const [personName, personPos] of Object.entries(personPositions)) {
                          const dx = Math.abs(robotCoord.x - personPos.x);
                          const dy = Math.abs(robotCoord.y - personPos.y);
                          const isAdjacent = (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);

                          if (isAdjacent) {
                            const offsetX = (personPos.x - robotCoord.x) * 15;
                            const offsetY = (robotCoord.y - personPos.y) * 15; 
                            return `translate(-50%, -70%) translate(${offsetX}px, ${offsetY}px)`;
                          }
                        }
                        return "translate(-50%, -70%)";
                      })()
                      : "translate(-50%, -70%)",
                    width: "60%",
                    height: "60%",
                    opacity: isObjectFading ? 0 : 1,
                    transition: isObjectFading
                      ? "opacity 0.5s ease-out"
                      : isObjectBeingHanded
                        ? "transform 1.6s ease-in-out"
                        : "none"
                  }}
                />
              )}

              {objectWithElderly && grabbedObject && objectWithPerson && (
                (key === "9,1" && objectWithPerson === "Elderly Person") ||
                (key === "0,7" && objectWithPerson === "Package room employee") ||
                (key === "7,6" && objectWithPerson === "Receptionist")
              ) && (
                  <img
                    src={(() => {
                      if (grabbedObject.type === "Target Parcel") return icons["1,6"];
                      else if (grabbedObject.type === "Other Parcel") return icons["0,6"];
                      else if (grabbedObject.type === "Fence") return icons["4,0"];
                      else if (grabbedObject.type === "Cart") return icons["5,4"];
                      return icons["1,6"];
                    })()}
                    alt="object with person"
                    style={{
                      ...iconStyle(false),
                      zIndex: 10,
                      transform: "translate(-50%, -70%)",
                      width: "60%",
                      height: "60%"
                    }}
                  />
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimTile;