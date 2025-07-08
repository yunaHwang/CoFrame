import React, { useState, useEffect, useMemo, useRef } from "react";
import { Typography, Paper, Button } from "@mui/material";
import useStore from "../../stores/Store";
import { stageBatteryWarning } from "../../stores/to_flask";

const FEET_PER_STEP         = 1.6;
const BATTERY_DROP_PER_STEP = 80;          


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
  }, [startCoord, setErrorMessage, setShowError]);


  const getRotationTransform = () => {
    switch (orientation) {
      case "N": return "rotate(-90deg)";
      case "S": return "rotate(90deg)";
      case "W": return "rotate(180deg)";
      default : return "";   // E
    }
  };

  
  const moveToConnector = (target, locationLabel) => {
    // 1) distance / increment
    const dx = Math.abs(target.x - robotCoord.x);
    const dy = Math.abs(target.y - robotCoord.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const increment = distance * FEET_PER_STEP;

    // 2) update position
    setRobotCoord(target);

    // 3) travel 
    const prevDist = useStore.getState().distanceTravel;
    useStore.getState().setdistanceTravel(prevDist + increment);

    // 4) battery drain – skip if docking
    if (locationLabel.toLowerCase() !== CHARGER_LABEL) {
      const drop = distance * BATTERY_DROP_PER_STEP;
      const prev = useStore.getState().batteryLevel;
      useStore.getState().setbatteryLevel(Math.max(0, prev - drop));
    } else {
      // docking: battery refill comes from backend
      useStore.getState().setdistanceTravel(0);
    }

    checkForErrors(target, scenario);
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

  useEffect(() => {
    const info = sourceInfo_to_pass?.data?.name;
    if (!info || !robotCoord) return;

    // ---- Move-Forward command ----
    if (info === "Move Forward") { setPendingMove(true); return; }
    if (pendingMove && info.includes("grid")) {
      const steps = parseInt(info.match(/\d+/)?.[0] ?? "1", 10);

      // compute new coord
      let dx=0, dy=0;
      if (orientation==="N") dy=1;
      if (orientation==="S") dy=-1;
      if (orientation==="E") dx=1;
      if (orientation==="W") dx=-1;
      const newX = Math.max(0, Math.min(robotCoord.x + dx*steps, 9));
      const newY = Math.max(0, Math.min(robotCoord.y + dy*steps, 7));
      setRobotCoord({x:newX,y:newY});
      checkForErrors({x:newX,y:newY}, scenario);

      // distance
      useStore.getState().setdistanceTravel(
        useStore.getState().distanceTravel + steps * FEET_PER_STEP
      );

      // battery drain – freeze if charge pending
      if (!chargePending) {
        const drop = steps * BATTERY_DROP_PER_STEP;
        const prev = useStore.getState().batteryLevel;
        useStore.getState().setbatteryLevel(Math.max(0, prev - drop));
      }
      setPendingMove(false);
      return;
    }

    // ---- Rotate command ----
    if (info === "Rotate Stretch") { setPendingRotate(true); return; }
    if (pendingRotate && info.includes("wise")) {
      const isClockwise = info.toLowerCase().includes("clockwise");
      const dirs = ["N","E","S","W"];
      const idx  = dirs.indexOf(orientation);
      setOrientation(dirs[(idx + (isClockwise?3:1)) % 4]);
      setPendingRotate(false);
      return;
    }

    // ---- To Connector command ----
    if (info === "To Connector") { setPendingToConnector(true); return; }
    if (pendingToConnector) {
      const rooms = {
        "Package room": {x:2,y:4},
        "Activity Area":{x:3,y:2},
        "Elderly room": {x:5,y:3},
        "Battery charging station":{x:9,y:7}
      };
      const target = rooms[info];
      if (target) {
        moveToConnector(target, info);
        setPendingToConnector(false);
      }
    }
  }, [
    sourceInfo_to_pass,
    pendingMove,
    pendingRotate,
    pendingToConnector,
    orientation,
    robotCoord,
    scenario,
    chargePending
  ]);

  // ──────────────────────────────
  // Reset after delete
  // ──────────────────────────────
  useEffect(() => {
    if (actionDeleted && startCoord) {
      setRobotCoord(startCoord);
      setPendingMove(false);
      setPendingRotate(false);
      setPendingToConnector(false);
      setActionDeleted(false);
    }
  }, [actionDeleted, startCoord, setActionDeleted]);

  // ──────────────────────────────
  // Warning-flip + backend notify
  // ──────────────────────────────
  const batteryLevel          = useStore((s) => s.batteryLevel);
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
    const warn20 = useStore.getState().battery20Warning;
    const warn5  = useStore.getState().battery5Warning;
    if (warn20) stageBatteryWarning(20, true);
    if (warn5 ) stageBatteryWarning(5, true);
  }, [useStore((s)=>s.battery20Warning), useStore((s)=>s.battery5Warning)]);

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

