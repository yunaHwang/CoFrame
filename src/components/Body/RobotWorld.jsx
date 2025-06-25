import React, { useState, useEffect, useMemo, useRef } from "react";
import { Typography } from "@mui/material";
import useStore from "../../stores/Store";

const RobotWorld = ({ highlight = [], color = '#faeef2', icons = {}, labelsOverGrid = [], sourceInfo_to_pass = null, }) => {
  
  const [orientation, setOrientation] = useState('E');
  const directions = ['N', 'E', 'S', 'W'];

  const [pendingMove, setPendingMove] = useState(false);
  const [pendingRotate, setPendingRotate] = useState (false);

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

    // logic for travel distance
    const increment = steps * 1.6;
    const prevDist = useStore.getState().distanceTravel;
    useStore.getState().setdistanceTravel(prevDist + increment);

    // logic for battery level
    const batteryDrop = steps * 1; // temp change to check 20% warning message
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
    // TODO - tweak code so that regardless of either 'Direction' comes first or 'Angle' comes first
    // it should defer any movement
    if (pendingRotate && info?.includes('degrees') && robotCoord) {
      return; //still pending because it's waiting for either clockwise or counterclockwise
    }
    if (pendingRotate && info?.includes('wise') && robotCoord) {
      const isClockwise = info.toLowerCase().includes('clockwise');
      console.log("isClockwise? ", isClockwise);
      const idx = directions.indexOf(orientation);
      const newIdx = isClockwise ? (idx + 1) % 4 : (idx + 3) % 4; //clockwise first, if not, counter-clockwise
      setOrientation(directions[newIdx]);
      setPendingRotate(false);
    }
  }, [sourceInfo_to_pass, pendingMove, pendingRotate, orientation, robotCoord]);

  // You can tweak these numbers to change cell size.
  const CELL_SIZE = 30;

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
    gridTemplateRows: `repeat(8, ${CELL_SIZE}px)`,
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
    const top = `${(7 - Math.max(y1, y2)) * CELL_SIZE}px`;
    const height = `${(Math.abs(y2 - y1) + 1) * CELL_SIZE}px`;
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
          style={{ ...cellStyle, height: CELL_SIZE, 
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
