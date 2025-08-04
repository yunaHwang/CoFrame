import React, { useState, useEffect, useMemo, useRef } from "react";
import { Typography, Paper, Button } from "@mui/material";
import useStore from "../../stores/Store";
import { stageScenario2SensorError, stageScenario3PersonBlockError, stageScenario4HeavyError, stageScenario5CartBlock, stageScenario5PackageBlock } from "../../stores/to_flask";

const FEET_PER_STEP         = 1.6;
const BATTERY_DROP_PER_STEP = 80;          
// const BATTERY_DROP_PER_STEP = 8;//Mason Test         

const CHARGER_LABEL = "battery charging station";

const SimTile = ({
  cellSize        = 30,
  highlight       = [],
  color           = "#faeef2",
  icons           = {},
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
  // Responsibile For Action Tracking
  // ────────────────────────────────────
  //const [actionTracking, setActionTracking] = useState([]);

  const actionTracking = useStore((s) => s.actionTracking);

  const lastTransfer = useStore((s) => s.lastTransfer);
  const programData = useStore((s) => s.programData);
  const deletedData = useStore((s) => s.deletedData);

  const [putAsideAtCoord, setPutAsideAtCoord] = useState(null);
  const [isObjectGrabbed, setIsObjectGrabbed] = useState(false);  
  //yuna added
  const [grabbedParcel, setGrabbedParcel] = useState(null); // null or "Target Parcel" or "Other Parcel"

  const [isObjectFading, setIsObjectFading] = useState(false);
  const [isObjectBeingHanded, setIsObjectBeingHanded] = useState(false);
  const [objectWithElderly, setObjectWithElderly] = useState(false);
  const [hasThingParam, setHasThingParam] = useState(false);
  const [hasPersonParam, setHasPersonParam] = useState(false);
  const [parcelLeftAtCoord, setParcelLeftAtCoord] = useState(null);
  const [parcelDroppedByDeletion, setParcelDroppedByDeletion] = useState(false);

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
    
    const newX = Math.max(0, Math.min(startCoord.x + calculatedMovement.xMovement, 9));
    const newY = Math.max(0, Math.min(startCoord.y + calculatedMovement.yMovement, 7));
    
    return { x: newX, y: newY };
  }, [startCoord, calculatedMovement]);

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
        "Elderly room": {x:5,y:3},
        "Battery charging station":{x:9,y:7}
      };
        // //Mason test instant grab
        //   const rooms = {
        //   "Package room": {x:1,y:6},
        //   "Activity Area":{x:3,y:2},
        //   "Elderly room": {x:9,y:2},
        //   "Battery charging station":{x:9,y:7}
        // };

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
        //Todo Animation
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
    
    // setActionTracking(prev => [...prev, newAction]);
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

  const updateRobotOrientation = (rotationDirection) => {
    const directions = ["N", "E", "S", "W"]; 
    const currentIndex = directions.indexOf(orientation);
    
    let newIndex;
    if (rotationDirection === "Clockwise") {
      newIndex = (currentIndex + 1) % 4;
    } else if (rotationDirection === "Counter-clockwise") {
      newIndex = (currentIndex + 3) % 4; 
    } else if (rotationDirection === "90 degrees") {
      newIndex = (currentIndex + 1) % 4; 
    } else {
      return; 
    }
    
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
          if (actionData.type === "rotateType") {
            updateRobotOrientation(parameterValue);
          }
          const newMovement = calculateActionMovement(actionData.type, parameterValue, orientation);
          console.log(`Added parameter ${parameterId} to action ${actionId}:`, newMovement);
          return {
            ...action,
            children: updatedChildren,
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

      const globalBattery = useStore.getState().globalBatteryLevel;
      console.log("what is globalBattery here and does it have to do with the jump, ", globalBattery);
      //useStore.getState().setbatteryLevel(globalBattery);


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
      "Scenario 3": { redAsterisks: [[0,5],[0,4],[1,4],[2,4],[2,5],[2,7]] },
      "Scenario 4": { redAsterisks: [[1,6]] },
      "Scenario 5": {
        redAsterisks: [[5,0],[5,1],[5,2],[5,3],[6,3],[7,3],[8,3],[9,3]],
        blueAsterisks:[[0,5],[1,4],[2,4],[2,5],[2,7]]
      }
    };
    return coordinates[currentScenario] || { redAsterisks: [], blueAsterisks: [] };
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
      if (onRed && lastScenario4Signal.current !== true) {
        console.log("Scenario 4 error has occurred.");
        stageScenario4HeavyError(true);
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
        useStore.getState().setScenario5CartErrorBlockMade(true);
        lastCartBlockSignal.current = true;
      } else if (!onRed && lastCartBlockSignal.current !== false) {
        stageScenario5CartBlock(false);
        useStore.getState().setScenario5CartErrorBlockMade(false);
        lastCartBlockSignal.current = false;
      } else if (onBlue && lastPackageBlockSignal.current !== true) {
        console.log("Scenario 5 package block error has occurred.");
        stageScenario5PackageBlock(true);
        useStore.getState().setScenario5PackageErrorBlockMade(true);
        lastPackageBlockSignal.current = true;
      } else if (!onBlue && lastPackageBlockSignal.current !== false) {
        stageScenario5PackageBlock(false);
        useStore.getState().setScenario5PackageErrorBlockMade(false);
        lastPackageBlockSignal.current = false;
      }
    }


  } 
  // else {
  //   // If previously in red and now moved out → clear error
  //   if (currentScenario === "Scenario 2") {
  //     stageScenario2SensorError(false);  // Send resolution to backend
  //   }
  // }
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
}, [scenario]);


  const lastProcessedTransfer = useRef(null);
    
  // ──────────────────────────────
  // Handle Addition
  // ──────────────────────────────

  useEffect(() => {
    if (!lastTransfer || lastTransfer.timestamp === lastProcessedTransfer.current) return;
    
    lastProcessedTransfer.current = lastTransfer.timestamp;
    
    console.log('Console Received:', lastTransfer);
    
    const { data, sourceInfo, destInfo } = lastTransfer;
    
    // Check if this is an action being added
    if (data.type === "moveForwardType" || data.type === "toLocationType" || data.type === "rotateType" || data.type === "sayType" || data.type === "grabType" || data.type === "putAsideType" || data.type === "handObjToType" ) {
      // Get the actual spawned block ID
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
        console.log("parameterValue for rotate, ", parameterValue);
        const parameterId = data.ref;
        addParameterToAction(destInfo.parentId, parameterId, parameterValue);
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
      const parameterId = data.ref;
      addParameterToAction(destInfo.parentId, parameterId, parameterValue);
    }

    //Thingtype for grab
    else if (data.type === "thingType" && destInfo.parentId) {
    const parentAction = programData[destInfo.parentId];

    if (parentAction?.type === "grabType") {
      const parameterValue = data.name; 
      const parameterId = data.ref;
      addParameterToAction(destInfo.parentId, parameterId, parameterValue);

      if (parameterValue === "Target Parcel") {
        const objectAtOriginal = !grabbedParcel && !isObjectFading && !objectWithElderly;
        let canGrab = false;
    
        if (parcelDroppedByDeletion && parcelLeftAtCoord) {
          canGrab = robotCoord?.x === parcelLeftAtCoord.x && 
                    robotCoord?.y === parcelLeftAtCoord.y;
        } else {
          canGrab = robotCoord?.x === 1 && robotCoord?.y === 6;
        }
        
        if (objectAtOriginal && canGrab) {
          handleObjectAction(parentAction.type, parameterValue);
        }
      }
      // yuna added 
      if (parameterValue === "Other Parcel") {
        const objectAtOriginal = !grabbedParcel && !isObjectFading && !objectWithElderly;
        let canGrab = false;
    
        if (parcelDroppedByDeletion && parcelLeftAtCoord) {
          canGrab = robotCoord?.x === parcelLeftAtCoord.x && 
                    robotCoord?.y === parcelLeftAtCoord.y;
        } else {
          canGrab = robotCoord?.x === 0 && robotCoord?.y === 6;
        }
        
        if (objectAtOriginal && canGrab) {
          handleObjectAction(parentAction.type, parameterValue);
        }
      }
    }

    else if (parentAction?.type === "putAsideType") {
      const parameterValue = data.name; 
      const parameterId = data.ref;
      addParameterToAction(destInfo.parentId, parameterId, parameterValue);

      if (parameterValue === "Target Parcel" && isObjectGrabbed) {
        handleObjectAction(parentAction.type);
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
    if (parentAction?.type === "handObjToType") {
      const parameterValue = data.name; 
      const parameterId = data.ref;      
      addParameterToAction(destInfo.parentId, parameterId, parameterValue);
      setHasPersonParam(true);
      if (hasThingParam && isObjectGrabbed) {
        handleObjectAction(parentAction.type);
      }
    }
  }
  }, [lastTransfer, programData]);

  // ──────────────────────────────
  // Handle Grab
  // ──────────────────────────────
  const handleObjectAction = (actionType, parameterValue) => {
    // console.log("handleObjectAction called with:" actionType);

    switch(actionType) {
      case "grabType":
        //setIsObjectGrabbed(true);
        setGrabbedParcel(parameterValue); //added
        setIsObjectFading(false);
        setIsObjectBeingHanded(false);
        setObjectWithElderly(false);
        setActionMessage(`Stretch grabbed ${parameterValue}!`);
        setParcelLeftAtCoord(null); 
        setParcelDroppedByDeletion(false); 
        // console.log(`Object grabbed at ${objectPosition}`);
        break;
        
      case "putAsideType":
        setIsObjectFading(true);
        setPutAsideAtCoord(robotCoord);
        // console.log(`Object put at ${objectPosition}`);
        setTimeout(() => {
          setIsObjectGrabbed(false);
          setIsObjectBeingHanded(false);
          setObjectWithElderly(false);
        }, 500);
        setActionMessage("Target Parcel put aside for now!");
        break;
        
      case "handObjToType":
        if (robotCoord) {
          const elderlyPos = {x: 9, y: 1};
          const dx = Math.abs(robotCoord.x - elderlyPos.x);
          const dy = Math.abs(robotCoord.y - elderlyPos.y);
          const isAdjacent = (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
          if (isAdjacent) {
            setIsObjectBeingHanded(true);
            setTimeout(() => {
              setIsObjectGrabbed(false);
              setIsObjectBeingHanded(false);
              setObjectWithElderly(true);
            }, 800);
            setActionMessage("Elderly received target parcel! ");
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
          //console.log("Action deletion detected. Deleted :", deletedActionId);
          //console.log("Current tracking:", actionTracking.map(a => a.id));
        if (deletedData.type === "rotateType") {
            setOrientation("E");
            useStore.getState().setRobotOrientation?.("E");
          }
        if (deletedData.type === "grabType") {
          //console.log("Grab action deleted");
          setParcelLeftAtCoord(robotCoord);
          setIsObjectGrabbed(false);
          setHasThingParam(false);
          setParcelDroppedByDeletion(true); 
        }
        else if (deletedData.type === "putAsideType") {
          //console.log("Put aside action deleted");
          setIsObjectFading(false);
          setHasThingParam(false);
          setPutAsideAtCoord(null);
          setIsObjectGrabbed(true)
        }
        else if (deletedData.type === "handObjToType") {
          //console.log("Hand-to-person action deleted");
          setHasThingParam(false);
          setHasPersonParam(false);
          
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
        //console.log("Looking for Move Forward parameter to delete from action:", actionId);
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
        setOrientation("E");
        useStore.getState().setRobotOrientation?.("E");
          
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
      else if (deletedFieldInfo.name === "Object" && deletedFieldInfo.value === "thing" && deletedParentInfo.type === "grabType") {
        //console.log("Grab object parameter deleted");
        setParcelLeftAtCoord(robotCoord);
        setIsObjectGrabbed(false);
        setHasThingParam(false);
        setParcelDroppedByDeletion(true); 
      }
      //deletion for putaside
      else if (deletedFieldInfo.name === "Object" && deletedFieldInfo.value === "thing" && deletedParentInfo.type === "putAsideType") {
        console.log("Put aside object parameter deleted");
        setIsObjectFading(false);
        setHasThingParam(false);
        setPutAsideAtCoord(null);
        const hasActiveGrab = actionTracking.some(action => {
          const actionData = programData[action.id];
          return actionData?.type === "grabType" && action.children.length > 0;
        });
        setIsObjectGrabbed(hasActiveGrab);
      }
      
      //Deletion for handle
      else if ((deletedFieldInfo.name === "Object" || deletedFieldInfo.name === "Person") && deletedParentInfo.type === "handObjToType") {        
        if (deletedFieldInfo.name === "Object") {
          setHasThingParam(false);
        } 

        else if (deletedFieldInfo.name === "Person") {
          setHasPersonParam(false);
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
      checkForErrors(robotCoord, scenario);
    }
  }, [robotCoord, scenario]);


  // useEffect(() => {
  //   const info = sourceInfo_to_pass?.data?.name;
  //   if (!info || !robotCoord) return;
  //   if (actionDeleted) {return; }

  //   // ---- Move-Forward command ----
  //   if (info === "Move Forward") { setPendingMove(true); return; }
  //   if (pendingMove && info.includes("grid")) {
  //     const steps = parseInt(info.match(/\d+/)?.[0] ?? "1", 10);

  //     // compute new coord
  //     let dx=0, dy=0;
  //     if (orientation==="N") dy=1;
  //     if (orientation==="S") dy=-1;
  //     if (orientation==="E") dx=1;
  //     if (orientation==="W") dx=-1;
  //     const newX = Math.max(0, Math.min(robotCoord.x + dx*steps, 9));
  //     const newY = Math.max(0, Math.min(robotCoord.y + dy*steps, 7));
  //     setRobotCoord({x:newX,y:newY});
  //     checkForErrors({x:newX,y:newY}, scenario);

  //     // distance
  //     useStore.getState().setdistanceTravel(
  //       useStore.getState().distanceTravel + steps * FEET_PER_STEP
  //     );

  //     // battery drain – freeze if charge pending
  //     if (!chargePending) {
  //       const drop = steps * BATTERY_DROP_PER_STEP;
  //       const prev = useStore.getState().batteryLevel;
  //       useStore.getState().setbatteryLevel(Math.max(0, prev - drop));
  //     }
  //     setPendingMove(false);
  //     return;
  //   }

  //   // ---- Rotate command ----
  //   if (info === "Rotate Stretch") { setPendingRotate(true); return; }
  //   if (pendingRotate && info.includes("wise")) {
  //     const isClockwise = info.toLowerCase().includes("clockwise");
  //     const dirs = ["N","E","S","W"];
  //     const idx  = dirs.indexOf(orientation);
  //     setOrientation(dirs[(idx + (isClockwise?3:1)) % 4]);
  //     setPendingRotate(false);
  //     return;
  //   }

  //   // ---- To Connector command ----
  //   if (info === "To Connector") { setPendingToConnector(true); return; }
  //   if (pendingToConnector) {
  //     const rooms = {
  //       "Package room": {x:2,y:4},
  //       "Activity Area":{x:3,y:2},
  //       "Elderly room": {x:5,y:3},
  //       "Battery charging station":{x:9,y:7}
  //     };
  //     const target = rooms[info];
  //     if (target) {
  //       moveToConnector(target, info);
  //       setPendingToConnector(false);
  //     }
  //   }
  // }, [
  //   sourceInfo_to_pass,
  //   pendingMove,
  //   pendingRotate,
  //   pendingToConnector,
  //   orientation,
  //   robotCoord,
  //   scenario,
  //   chargePending,
  //   actionDeleted
  // ]);

  // // ──────────────────────────────
  // // Reset after delete
  // // ──────────────────────────────
  // useEffect(() => {
  //     if (actionDeleted && startCoord) {
  //       console.log("Deletion - Field:", deletedFieldInfo);
  //       console.log("Deletion - Parent:", deletedParentInfo);
        
  //       let keepMoveForward = false;
  //       let keepToConnector = false;
        
  //       if (deletedParentInfo && deletedFieldInfo) {
  //         if (deletedParentInfo.type === "moveForwardType" && 
  //             deletedFieldInfo.value === "direction") {
  //           keepMoveForward = true;
  //         }
          
  //         if (deletedParentInfo.type === "toLocationType" && 
  //             deletedFieldInfo.value === "place") { 
  //           keepToConnector = true;
  //         }
  //       }
        
  //       setRobotCoord(startCoord);
  //       setPendingMove(keepMoveForward);
  //       setPendingRotate(false);
  //       setPendingToConnector(keepToConnector);
  //       if (keepMoveForward) {
  //       useStore.getState().setLastSourceInfo({
  //         data: { name: "Move Forward" }
  //       });
  //     }
  //       if (keepToConnector) {
  //       useStore.getState().setLastSourceInfo({
  //         data: { name: "To Connector" }
  //       });
  //     }
  //       setDeletedFieldInfo(null);
  //       setDeletedParentInfo(null);
  //       setActionDeleted(false);
  //     }
  //   }, [actionDeleted, startCoord, setActionDeleted, deletedFieldInfo, deletedParentInfo, setDeletedFieldInfo, setDeletedParentInfo]);
  
  // ──────────────────────────────
  // Warning-flip + backend notify
  // ──────────────────────────────
  const batteryLevel          = useStore((s) => s.batteryLevel);
  //console.log("is batteryLevel just not working, ", batteryLevel);
  const setBattery20Warning   = useStore((s) => s.setBattery20Warning);
  const setBattery5Warning    = useStore((s) => s.setBattery5Warning);
  const prevLevelRef          = useRef(batteryLevel);

  useEffect(() => {
    console.log("this is batteryLevel", batteryLevel); // added to check if batteryLevel goes down successfully - because the same type of battery warning is just not popping up. 

    // so the above DOES GO TO 0 but then it bounces back... ha let the recharge logic be removed?!
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

    const justResetBattery = useStore.getState().justResetBattery;
    if (justResetBattery) {
    // Reset flag so it only skips once
    useStore.getState().setJustResetBattery(false);
    return;
  }

    const totalBatteryUsed = calculatedMovement.batteryMovement;
    const totalDistance = calculatedMovement.distanceMovement;

    // const hasChargedAction = actionTracking.some(action => {
    //   const actionData = programData[action.id];
    //   return actionData?.type === "toLocationType" && 
    //         action.children.length > 0 && 
    //         programData[action.children[0]]?.name === "Battery charging station";
    // });

    const chargePending = useStore.getState().chargePending;
    const clean = useStore.getState().clean;

    const batteryResetActionCount = useStore.getState().batteryResetActionCount ?? 0;
    const postChargeActions = actionTracking.slice(batteryResetActionCount);
    const postChargeBatteryUsed = postChargeActions.reduce((sum, a) => sum + a.batteryMovement, 0);
    console.log("batteryResetActionCount, postChargeActions, postChargeBatteryUsed, ", batteryResetActionCount, postChargeActions, postChargeBatteryUsed);

    const globalBattery = useStore.getState().globalBatteryLevel ?? 100;
    const newBatteryLevel = Math.max(0, globalBattery - postChargeBatteryUsed);
    console.log("what is globalBattery, postChargeBatteryUsed, ", globalBattery, postChargeBatteryUsed);
    console.log("what is newBattery here and does it have to do with the jump, ", newBatteryLevel);

    useStore.getState().setbatteryLevel(newBatteryLevel); //TODO: yo this is buggy
    //useStore.getState().setGlobalBatteryLevel(newBatteryLevel); //added
    useStore.getState().setdistanceTravel(totalDistance);

    // let newBatteryLevel;

    // const chargePending = useStore.getState().chargePending;
    // console.log("chargePending, ", chargePending);
    // const clean = useStore.getState().clean;
    // console.log("clean, ", clean);

    // if (hasChargedAction && !chargePending && clean) {
    //   newBatteryLevel = 100;  
    // } else {
    //   newBatteryLevel = Math.max(0, 100 - totalBatteryUsed);  
    // }
    
    // useStore.getState().setbatteryLevel(newBatteryLevel);
    // useStore.getState().setdistanceTravel(totalDistance);
    
  }, [calculatedMovement, actionTracking, programData]);
  
  useEffect(() => {
    console.log("Action Tracking Array:", actionTracking);
    console.log("Start Position:", startCoord);
    console.log("Calculated Movement:", calculatedMovement);
    console.log("Robot Location:", robotCoord);
    console.log("programData", programData)
    console.log("lastTransfer", lastTransfer)

  }, [actionTracking, startCoord, calculatedMovement, robotCoord]);


//   useEffect(() => {
//   console.log("actionTracking changed:", actionTracking);
// }, [actionTracking]);
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

      {/* {showBatteryCharged && (
        <Paper sx={{position:"absolute", top:"50%", left:"50%",
          backgroundColor:"#4caf50", color:"#fff", p:"10px 16px",
          maxWidth:400, display:"flex", alignItems:"center", zIndex:10}}>
          <Typography variant="body2" sx={{fontWeight:500, lineHeight:1.4}}>
            🔋 Battery is fully charged!
          </Typography>
          <Button variant="contained" onClick={()=>setShowBatteryCharged(false)}
            sx={{ml:2, backgroundColor:"#4caf50", "&:hover":{backgroundColor:"#4caf50"}}}>
            OK
          </Button>
        </Paper>
      )} */}

      <div style={gridStyle}>
        {Array.from({length:80}).map((_,idx)=>{
          const x = idx % 10;
          const y = 7 - Math.floor(idx/10);
          const key = `${x},${y}`;
          const isHL = highlightSet.has(key);

          // added
          const parcelCoords = {
            "Target Parcel": "1,6",
            "Other Parcel": "0,6",
          };
          const parcelKeys = Object.values(parcelCoords); 
          
          const robotImg = Object.values(icons).find(v=>typeof v==="string" && v.includes("robot"));
          const robotKey = robotCoord ? `${robotCoord.x},${robotCoord.y}` : null;
          let iconSrc;
          if (key === robotKey) {
            iconSrc = robotImg;
          } 
          else if (
            parcelDroppedByDeletion &&
            parcelLeftAtCoord &&
            key === `${parcelLeftAtCoord.x},${parcelLeftAtCoord.y}`
          ) {
            iconSrc = icons["1,6"];
          }
          else if (key === "1,6" && (isObjectGrabbed || isObjectFading || objectWithElderly || parcelDroppedByDeletion)) {
            iconSrc = null;
          }
          else if (
            putAsideAtCoord &&
            key === `${putAsideAtCoord.x},${putAsideAtCoord.y}` &&
            !isObjectGrabbed && !isObjectFading && !objectWithElderly && !parcelDroppedByDeletion
          ) {
            iconSrc = icons["1,6"];
          }
          else if (icons[key] === robotImg) {
            iconSrc = null;
          }
          else {
            iconSrc = icons[key];
          }
          
          const label   = labelsOverGrid[key];


          return (
            // <div key={idx} style={{...cellStyle,height:cellSize,
            //   backgroundColor:isHL?color:"#fff", position:"relative"}} >
            <div
              key={idx}
              style={{
                ...cellStyle,
                height: cellSize,
                backgroundColor: isHL ? color : getRoomColor(x, y) || "#fff",
                position: "relative",
                ...getCellBorders(x, y),  // adds the thick borders
              }}
            >

              {label && <Typography sx={labelStyle}>{label}</Typography>}
              {iconSrc && (
                typeof iconSrc==="string"
                  ? <img src={iconSrc} alt="icon" style={iconStyle(key===robotKey)} />
                  : <span style={iconStyle(key===robotKey)}>{iconSrc}</span>
              )}

              {key === robotKey && (isObjectGrabbed || isObjectFading || isObjectBeingHanded) && (
                <img 
                  //src={icons["1,6"]} 
                  src = {
                    grabbedParcel == "Other Parcel" ? icons["0,6"] : icons["1,6"]
                  }
                  alt="grabbed object" 
                  style={{
                    ...iconStyle(false),
                    zIndex: 10,
                    transform: isObjectBeingHanded 
                      ? `translate(-50%, -70%) translate(${(9 - robotCoord.x) * cellSize * 0.8}px, ${(robotCoord.y - 1) * cellSize * 0.8}px)`
                      : "translate(-50%, -70%)",
                    width: "60%",
                    height: "60%",
                    opacity: isObjectFading ? 0 : 1,
                    transition: isObjectBeingHanded 
                      ? "transform 0.8s ease-in-out" 
                      : "opacity 0.5s ease-out"
                  }} 
                />
              )}
              {key === "9,1" && objectWithElderly && (
                <img 
                  src={icons["1,6"]} 
                  alt="object with elderly" 
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