import React, { useState, useEffect, useMemo, useRef } from "react";
import { Typography, Paper, Button } from "@mui/material";
import useStore from "../../stores/Store";
import { stageBatteryWarning } from "../../stores/to_flask";

const FEET_PER_STEP         = 1.6;
const BATTERY_DROP_PER_STEP = 80;          
// const BATTERY_DROP_PER_STEP = 8;//Mason Test         

const CHARGER_LABEL = "battery charging station";

const RobotWorld = ({
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
  const [actionTracking, setActionTracking] = useState([]);
  const lastTransfer = useStore((s) => s.lastTransfer);
  const programData = useStore((s) => s.programData);
  const deletedData = useStore((s) => s.deletedData);

  const { chargePending }= useStore();                    

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
    
    setActionTracking(prev => [...prev, newAction]);
    console.log(`Added action ${actionId} to tracking:`, moves);
  };
  
  const removeActionFromTracking = (actionId) => {
    setActionTracking(prev => {
      const actionToRemove = prev.find(action => action.id === actionId);
      if (actionToRemove) {
        console.log(`Removed action ${actionId} from tracking.`)
      }
      return prev.filter(action => action.id !== actionId);
    });
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
    setActionTracking(prev => prev.map(action => {
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
    }));
  };
  const prevStartRef = useRef(startCoord);
  useEffect(() => {
    if (
      !prevStartRef.current ||
      prevStartRef.current.x !== startCoord?.x ||
      prevStartRef.current.y !== startCoord?.y
    ) {
      prevStartRef.current = startCoord;
      setOrientation("E");
      useStore.getState().setRobotOrientation?.("E");
      setPendingMove(false);
      setPendingRotate(false);
      setPendingToConnector(false);
      setShowBatteryCharged(false);
      setShowError(false);
      setErrorMessage(null);
      setActionTracking([]);
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
    }
  };
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
    if (data.type === "moveForwardType" || data.type === "toLocationType" || data.type === "rotateType") {
      // Get the actual spawned block ID
      const parentData = programData[destInfo.parentId];
      const actualBlockId = parentData?.properties?.children?.[destInfo.idx];
      
      if (actualBlockId) {
        addActionToTracking(actualBlockId, data.type);
      }
    }
    
    else if (data.type === "movementType" && destInfo.parentId) {
      const parentAction = programData[destInfo.parentId];
      
      if (parentAction?.type === "moveForwardType") {
        const parameterValue = data.name; 
        const parameterId = data.ref;
        addParameterToAction(destInfo.parentId, parameterId, parameterValue);
      } else if (parentAction?.type === "rotateType") {
        const parameterValue = data.name;
        const parameterId = data.ref;
        addParameterToAction(destInfo.parentId, parameterId, parameterValue);
      }
    }
    
    else if (data.type === "placeType" && destInfo.parentId) {
      const parameterValue = data.name;
      const parameterId = data.ref;
      addParameterToAction(destInfo.parentId, parameterId, parameterValue);
    }
    
  }, [lastTransfer, programData]);

  // ──────────────────────────────
  // Handle deletions
  // ──────────────────────────────
  useEffect(() => {
    if (actionDeleted && deletedFieldInfo && deletedParentInfo) {
      console.log("Deletion - Field:", deletedFieldInfo);
      console.log("Deletion - Parent:", deletedParentInfo);
      
      // Case 1: Deleting an action where field name is "Children" which is a action 
      if (deletedFieldInfo.name === "Children" && deletedFieldInfo.isList) {
        // Use the deletedData to get the exact action ID that was deleted
        if (deletedData && deletedData.id) {
          const deletedActionId = deletedData.id;
          console.log("Action deletion detected. Deleted :", deletedActionId);
          console.log("Current tracking:", actionTracking.map(a => a.id));
        if (deletedData.type === "rotateType") {
            setOrientation("E");
            useStore.getState().setRobotOrientation?.("E");
          }
          removeActionFromTracking(deletedActionId);
        }
      }
      
      // Case 2: Deleting a parameter from Move Forward action
      else if (deletedFieldInfo.name === "Grid Increments" && deletedFieldInfo.value === "direction") {
        const actionId = deletedParentInfo.id;
        //console.log("Looking for Move Forward parameter to delete from action:", actionId);
        
        // Find the action in our tracking and remove ALL its children since parameter is being deleted
        setActionTracking(prev => prev.map(action => {
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
        }));
      }
      
      // Case 3: Deleting a parameter from To Connector action
      else if (deletedFieldInfo.name === "Location" && deletedFieldInfo.value === "place") {
        const actionId = deletedParentInfo.id;
        
        setActionTracking(prev => prev.map(action => {
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
        }));
      }
      else if (deletedFieldInfo.name === "Rotation Direction" && deletedFieldInfo.value === "angleDirection") {
        const actionId = deletedParentInfo.id;
          setOrientation("E");
          useStore.getState().setRobotOrientation?.("E");
        
        setActionTracking(prev => prev.map(action => {
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
        }));
      }
      //Case 2 and 3 could be merge but keeping for clearity
      
      // Reset deletion flags
      setDeletedFieldInfo(null);
      setDeletedParentInfo(null);
      setActionDeleted(false);
    }
  }, [actionDeleted, deletedFieldInfo, deletedParentInfo, deletedData, setActionDeleted, setDeletedFieldInfo, setDeletedParentInfo, programData, actionTracking]);  
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

    const hasChargedAction = actionTracking.some(action => {
      const actionData = programData[action.id];
      return actionData?.type === "toLocationType" && 
            action.children.length > 0 && 
            programData[action.children[0]]?.name === "Battery charging station";
    });

    let newBatteryLevel;
    if (hasChargedAction) {
      newBatteryLevel = 100;  
    } else {
      newBatteryLevel = Math.max(0, 100 - totalBatteryUsed);  
    }
    
    useStore.getState().setbatteryLevel(newBatteryLevel);
    useStore.getState().setdistanceTravel(totalDistance);
    
  }, [calculatedMovement, actionTracking, programData]);
  //Quick Debug
  // useEffect(() => {
  //   console.log("Action Tracking Array:", actionTracking);
  //   console.log("Start Position:", startCoord);
  //   console.log("Calculated Movement:", calculatedMovement);
  //   console.log("Robot Location:", robotCoord);
  // }, [actionTracking, startCoord, calculatedMovement, robotCoord]);

  // ──────────────────────────────
  // Rendering 
  // ──────────────────────────────
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
    backgroundColor:"#fff", border:"1px solid #bbb", boxSizing:"border-box"
  };
  const labelStyle = {
    position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
    fontSize:14, color:"#999", opacity:0.6, pointerEvents:"none", zIndex:1
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
      color:"#999", opacity:0.5, fontSize:16, pointerEvents:"none", zIndex:5
    };
  };
  const iconStyle = (isRobot)=>({
    width:"80%", height:"80%", objectFit:"contain", pointerEvents:"none",
    position:"absolute", top:"50%", left:"50%",
    transform:`translate(-50%,-50%) ${isRobot?getRotationTransform():""}`
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
            🔋 Battery is fully charged!
          </Typography>
          <Button variant="contained" onClick={()=>setShowBatteryCharged(false)}
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

          const robotImg = Object.values(icons).find(v=>typeof v==="string" && v.includes("robot"));
          const robotKey = robotCoord ? `${robotCoord.x},${robotCoord.y}` : null;
          const iconSrc = key===robotKey ? robotImg : icons[key]===robotImg ? null : icons[key];
          const label   = labelsOverGrid[key];

          return (
            <div key={idx} style={{...cellStyle,height:cellSize,
              backgroundColor:isHL?color:"#fff", position:"relative"}} >
              {label && <Typography sx={labelStyle}>{label}</Typography>}
              {iconSrc && (
                typeof iconSrc==="string"
                  ? <img src={iconSrc} alt="icon" style={iconStyle(key===robotKey)} />
                  : <span style={iconStyle(key===robotKey)}>{iconSrc}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RobotWorld;