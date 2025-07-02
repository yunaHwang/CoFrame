import React, { useState, useEffect, useMemo, useRef } from "react";
import { Typography, Paper, Button } from "@mui/material";
import useStore from "../../stores/Store";

const RobotWorld = ({ cellSize = 30, highlight = [], color = '#faeef2', icons = {}, labelsOverGrid = [], sourceInfo_to_pass = null, scenario = "Scenario 1" }) => {
  
  const [orientation, setOrientation] = useState('E');
  const directions = ['N', 'E', 'S', 'W'];

  const [pendingMove, setPendingMove] = useState(false);
  const [pendingRotate, setPendingRotate] = useState (false);
  const [pendingToConnector, setPendingToConnector] = useState(false);

  const [showBatteryCharged, setShowBatteryCharged] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showError, setShowError] = useState(false);  

  const startCoord = useMemo(() => {
    const entry = Object.entries(icons).find(
      ([, v]) => typeof v === "string" && v.includes("robot")
    );
    if (!entry) return null;
    const [x, y] = entry[0].split(",").map(Number);
    return { x, y };
  }, [icons]);

  const [robotCoord, setRobotCoord] = useState(startCoord);

  const prevStartRef = useRef(startCoord); 
  useEffect(() => {
    if (
        !prevStartRef.current ||
        prevStartRef.current.x !== startCoord?.x ||
        prevStartRef.current.y !== startCoord?.y
        ) {
        prevStartRef.current = startCoord;
        setRobotCoord(startCoord);
        setOrientation("E");
        setPendingMove(false);
        setPendingRotate(false);
        setPendingToConnector(false);
        setShowBatteryCharged(false);
        setShowError(false);
        setErrorMessage(null);
        }
        }, [startCoord]);  

  const getRotationTransform = () => {
  switch (orientation) {
    case 'N': return 'rotate(-90deg)';
    case 'S': return 'rotate(90deg)';
    case 'W': return 'rotate(180deg)';
    default:  return ''; // E
  }
};
  const moveToConnector = (targetCoords, location) => {
      // Calculate distance traveled 
      const dx = Math.abs(targetCoords.x - robotCoord.x);
      const dy = Math.abs(targetCoords.y - robotCoord.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const increment = distance * 1.6;
      
      // Update robot position
      setRobotCoord(targetCoords);
      console.log("moveToConnector called with", targetCoords);

      // Update travel distance
      const prevDist = useStore.getState().distanceTravel;
      useStore.getState().setdistanceTravel(prevDist + increment);
    
      // Update battery level
      const batteryDrop = distance * 40; // 40 percent battery drop per step

      console.log("increment and battery drop, ", increment, batteryDrop);

      const prevBattery = useStore.getState().batteryLevel;
      const newBattery = Math.max(0, prevBattery - batteryDrop);
      console.log("what is newBattery, ", newBattery);
      useStore.getState().setbatteryLevel(newBattery);
      
      // BatteryCharging Special instruction
      if (location === 'battery charging station') {
        useStore.getState().setbatteryLevel(100);
        useStore.getState().setdistanceTravel(0);
        setShowBatteryCharged(true);
      }
      
      checkForErrors(targetCoords, scenario);
    };
  
  const getErrorCoordinates = (currentScenario) => {
    //HardCode Each location
    const coordinates = {
      "Scenario 2": {
        redAsterisks: [
          [0,4], [0,5], [0,6],
          [1,4], [1,5], [1,6], [1,7],
          [2,4], [2,5], [2,6], [2,7]
        ]
      },
      "Scenario 3": {
        redAsterisks: [
          [0,5], [0,4],
          [1,4],
          [2,4], [2,5], [2,7]
        ]
      },
      "Scenario 4": {
        redAsterisks: [
          [1,6]
        ]
      },
      "Scenario 5": {
        redAsterisks: [
          [5,0], [5,1], [5,2], [5,3],
          [6,3],
          [7,3],
          [8,3],
          [9,3]
        ],
        blueAsterisks: [
          [0,5],
          [1,4],
          [2,4], [2,5], [2,7]
        ]
      }
    };
    
    return coordinates[currentScenario] || { redAsterisks: [], blueAsterisks: [] };
  };

  const checkForErrors = (coords, currentScenario) => {
    //console.log("Current Cord:", coords, "Current Scenario:", currentScenario);
    
    //Scenario1 don't have possible error
    if (currentScenario === "Scenario 1") return;
    
    const { redAsterisks, blueAsterisks } = getErrorCoordinates(currentScenario);
    
    const isOnRedAsterisk = redAsterisks.some(([x, y]) => x === coords.x && y === coords.y);
    
    //Only Check for Scenario 5
    const isOnBlueAsterisk = currentScenario === "Scenario 5" && 
      blueAsterisks && blueAsterisks.some(([x, y]) => x === coords.x && y === coords.y);
    
    console.log("On red asterisk:", isOnRedAsterisk);
    console.log("On blue asterisk:", isOnBlueAsterisk);
    
    if (isOnRedAsterisk) {
      let message = "";
      switch (currentScenario) {
        case "Scenario 2":
          message = "Robot sensor is broken and it can't find the package. Please program robot fallback actions.";
          break;
        case "Scenario 3":
          message = "The package is blocked by other residents looking for their packages. Please program robot fallback actions.";
          break;
        case "Scenario 4":
          message = "The package is too heavy and exceeds the robot payload. Please program robot fallback actions.";
          break;
        case "Scenario 5":
          message = "The hallway is blocked by big carts and fences. The facility is ongoing some renovation. Please program robot fallback actions.";
          break;
        default:
          return;
      }
      setErrorMessage(message);
      setShowError(true);
    }
    
    if (isOnBlueAsterisk) {
      const message = "Other packages are blocking the package that the robot is looking for. Please program robot fallback actions."
      setErrorMessage(message);
      setShowError(true);
    }
  };

  useEffect(() => {
    //console.log("is sourceInfo being passed, ",sourceInfo_to_pass?.data);

    const info = sourceInfo_to_pass?.data?.name;
    console.log("what is info ",info);
    
    // 'Move Forward'
    if (info === 'Move Forward') {
    setPendingMove(true);
    return;
    }
    if (pendingMove && info?.includes('grid') && robotCoord) {
    const match = info.match(/(\d+)/);
    const steps = match ? parseInt(match[1]) : 1;
    //console.log("how many steps, ",steps);


    let dx = 0, dy = 0;
    if (orientation === 'N') dy = 1;
    if (orientation === 'S') dy = -1;
    if (orientation === 'E') dx = 1;
    if (orientation === 'W') dx = -1;

    const newX = Math.max(0, Math.min(robotCoord.x + dx * steps, 9));
    const newY = Math.max(0, Math.min(robotCoord.y + dy * steps, 7));
    setRobotCoord({ x: newX, y: newY });
    checkForErrors({ x: newX, y: newY }, scenario);

    // logic for travel distance
    //const increment = steps * 1.6;
    const FEET_PER_STEP = 1.6;  
    const increment      = steps * FEET_PER_STEP;
    const prevDist = useStore.getState().distanceTravel;
    useStore.getState().setdistanceTravel(prevDist + increment);

    // logic for battery level
    //const batteryDrop = steps * 1; // temp change to check 20% warning message
    const BATTERY_DROP_PER_STEP = 40; 
    const batteryDrop           = steps * BATTERY_DROP_PER_STEP;
    
    const prevBattery = useStore.getState().batteryLevel;
    const newBattery = Math.max(0, prevBattery - batteryDrop);
    useStore.getState().setbatteryLevel(newBattery);

    setPendingMove(false);
    }

    // 'Rotate'
    if (info === 'Rotate Stretch') {
      setPendingRotate(true);
      return;
    }
    if (pendingRotate && info?.includes('degrees') && robotCoord) {
      return; //still pending because it's waiting for either clockwise or counterclockwise
    }
    if (pendingRotate && info?.includes('wise') && robotCoord) {
      const isClockwise = info.toLowerCase().includes('clockwise');
      console.log("isClockwise? ", isClockwise);
      const idx = directions.indexOf(orientation);
      const newIdx = isClockwise ? (idx + 3) % 4 : (idx + 1) % 4; //clockwise first, if not, counter-clockwise
      setOrientation(directions[newIdx]);
      setPendingRotate(false);
    }

    if(info === "To Connector"){
      setPendingToConnector(true);
      return;
    }
    if (pendingToConnector && robotCoord) {
      if (info === "Package room") {
        const targetCoords = { x: 2, y: 4 };
        moveToConnector(targetCoords, 'package room');
        setPendingToConnector(false);
      }
      else if (info === "Activity Area") {
        const targetCoords = { x: 3, y: 2 };
        moveToConnector(targetCoords, 'activity area');
        setPendingToConnector(false);
      }
      else if (info === "Elderly room") {
        const targetCoords = { x: 5, y: 3 };
        moveToConnector(targetCoords, 'elderly room');
        setPendingToConnector(false);
      }
      else if (info === "Battery charging station") {
        const targetCoords = { x: 9, y: 7 };
        moveToConnector(targetCoords, 'battery charging station');
        setPendingToConnector(false);
      }
    }
  }, [sourceInfo_to_pass, pendingMove, pendingRotate, orientation, robotCoord, scenario]);

  // You can tweak these numbers to change cell size.
  //const CELL_SIZE = 30;

  const highlightSet = React.useMemo(() => {
    const pairs = highlight.map((p) => Array.isArray(p) ? p : [p.x, p.y]);
    return new Set(pairs.map(([x, y]) => `${x},${y}`));
  }, [highlight]);

  const pageStyle = {
    minHeight: '40vh',
    width: '100%',
    backgroundColor: '#333333',
  };

  const gridStyle = {
    display: 'grid',
    width: '100%',
    maxWidth: '100%',
    gridTemplateColumns: 'repeat(10, 10%)',
    gridTemplateRows: `repeat(8, ${cellSize}px)`,
  };

  const cellStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #bbbbbb',
    boxSizing: 'border-box',
  };

  const coordStyle = {
    fontSize: 10,
    color: '#666',
  };

  const labelStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 14,
    color: '#999',
    opacity: 0.6,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 1,
  };

  const overlayLabelStyle = (from, to) => {
    const [x1, y1] = from;
    const [x2, y2] = to;
    const left = `${(Math.min(x1, x2) * 10)}%`;
    const width = `${(Math.abs(x2 - x1) + 1) * 10}%`;
    const top = `${(7 - Math.max(y1, y2)) * cellSize}px`;
    const height = `${(Math.abs(y2 - y1) + 1) * cellSize}px`;
    return {
      position: 'absolute',
      left,
      top,
      width,
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#999',
      opacity: 0.5,
      fontSize: 16,
      pointerEvents: 'none',
      zIndex: 5,
    };
  };

  const iconStyle = (isRobot) => ({
  width: '80%',
  height: '80%',
  objectFit: 'contain',
  pointerEvents: 'none',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: `translate(-50%, -50%) ${isRobot ? getRotationTransform() : ''}`,
});


  return (
    <div style={pageStyle}>
      {labelsOverGrid.map(({ text, from, to }, i) => (
        <Typography key={i} style={overlayLabelStyle(from, to)}>
          {text}
        </Typography>
      ))}
      
      {showBatteryCharged && (
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '10px 16px',
            maxWidth: 400,
            display: 'flex',
            alignItems: 'center',
            zIndex: 10
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
            🔋 Battery is fully charged!
          </Typography>
          <Button
            variant="contained"
            onClick={() => setShowBatteryCharged(false)}
            sx={{
              ml: 2,
              backgroundColor: '#4caf50',
              '&:hover': { backgroundColor: '#4caf50' }
            }}
          >
            OK
          </Button>
        </Paper>
      )}
      
      {showError && errorMessage && (
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            backgroundColor: '#f44336',
            color: 'white',
            padding: '10px 16px',
            maxWidth: 400,
            display: 'flex',
            alignItems: 'center',
            zIndex: 10
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
            ⚠️ {errorMessage}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setShowError(false);
              setErrorMessage(null);
            }}
            sx={{
              backgroundColor: '#f44336',
              '&:hover': { backgroundColor: '#f44336' }
            }}
          >
            OK
          </Button>
        </Paper>
      )}
      
      <div style={gridStyle}>
        {Array.from({ length: 80 }).map((_, idx) => {

          const x = idx % 10;                  
          const y = 7 - Math.floor(idx / 10);
          const key = `${x},${y}`;
          const isHighlighted = highlightSet.has(key);

          const robotImage = Object.values(icons).find((v) => typeof v === 'string' && v.includes('robot'));
          const robotKey = robotCoord ? `${robotCoord.x},${robotCoord.y}` : null;
          const iconSrcOrNode = key === robotKey ? robotImage : icons[key] === robotImage ? null : icons[key];

          const labelText = labelsOverGrid[key];
          
          return (
          <div key={idx} 
          style={{ ...cellStyle, height: cellSize, 
                  backgroundColor: isHighlighted ? color : '#ffffff', position: 'relative', }} 
                  data-x={x} data-y={y} >
          {/* <Typography sx={coordStyle}>({x},{y})</Typography> */}
          {labelText && <Typography sx={labelStyle}>{labelText}</Typography>}
          {iconSrcOrNode && (
                typeof iconSrcOrNode === 'string' ? (
                  <img src={iconSrcOrNode} alt="icon" style={iconStyle(key === robotKey)} />
                ) : (
                  <span style={iconStyle(key === robotKey)}>{iconSrcOrNode}</span>
                )
              )}
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default RobotWorld;
