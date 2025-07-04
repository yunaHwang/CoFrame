import React, { useCallback, useEffect, useState, useRef} from "react";
// import { FiSettings } from "react-icons/fi";
import { ReviewTile } from "./components/Body/ReviewTile";
import { SimulatorTile } from "./components/Body/SimulatorTile";
import { ProgramTile } from "./components/Body/ProgramTile";
import RobotWorld from "./components/Body/RobotWorld";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import { TIMELINE_TYPES, STATUS } from "./stores/Constants";
// import { Modals } from "./components/Modals";
import { Detail } from "./components/Detail";
import { SettingsModal } from "./components/Settings";
import TimelineGraph from "./components/TimelineGraph";

import {
  ThemeProvider,
  createTheme as muiCreateTheme,
  THEME_ID,
} from "@mui/material/styles";

import { Drawer, Snackbar, Alert, AlertTitle, Stack, Box, Divider } from "@mui/material";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import useMeasure from "react-use-measure";
import useStore from "./stores/Store";
import useCompiledStore from "./stores/CompiledStore";
import "reactflow/dist/style.css";
import "react-reflex/styles.css";
import "./App.css";
import { shallow } from "zustand/shallow";

import robotPng from "./components/SimMapFlaticons/robot.png"
import employeePng from "./components/SimMapFlaticons/employee.png"
import chargingPng from "./components/SimMapFlaticons/charging_dock.png"
import elderlyPng from "./components/SimMapFlaticons/elderly.png"
import wrongObjPng from "./components/SimMapFlaticons/others_delivery.png"
import correctObjPng from "./components/SimMapFlaticons/delivery_object.png"
import barrierPng from "./components/SimMapFlaticons/barrier.png"
import cartPng from "./components/SimMapFlaticons/money.png"

export default function App() {
  const primaryColor = useStore((state) => state.primaryColor, shallow);
  const viewMode = useStore((state) => state.viewMode, shallow);
  const visibleSteps = useStore(
    (state) =>
      state.focus.some((focusItem) =>
        TIMELINE_TYPES.includes(state.programData[focusItem]?.type)
      ),
    shallow
  );
  const focusData = useStore(
    (state) => state.focus.map((f) => state.programData[f]),
    shallow
  );

  const issueData = useStore((state) => {
    let issue = null;
    state.focus
      .slice()
      .reverse()
      .some((x) => {
        if (state.issues[x]) {
          issue = state.issues[x];
          return true;
        }
        return false;
      });
    return issue;
  }, shallow);
  //Added Fall back mode
  const fallbackMode = useStore((state) => state.fallbackMode, shallow);
  const setFallbackMode = useStore((state) => state.setFallbackMode, shallow);

  useEffect(() => {
    //Place holder, define what cause Fallback mode here
    const timer = setTimeout(() => {
      setFallbackMode(true);
    }, 5000); 

    return () => clearTimeout(timer);
  }, []);

  const [focusSteps, errorType] = useCompiledStore(
    useCallback(
      (state) => {
        let steps = [];
        let errorType = null;
        if (!visibleSteps) {
          return [steps, errorType];
        }
        focusData.some((f) => {
          if (
            [STATUS.VALID, STATUS.PENDING, STATUS.WARN].includes(
              f?.properties?.status
            ) &&
            TIMELINE_TYPES.includes(f.type)
          ) {
            if (state[f.id] && Object.keys(state[f.id]).length === 1) {
              steps = state[f.id][Object.keys(state[f.id])[0]]?.steps;
              return true;
            } else {
              errorType = "traces";
              return false;
            }
          } else {
            errorType = "invalid";
            return false;
          }
        });
        return [steps, errorType];
      },
      [focusData, visibleSteps]
    ),
    shallow
  );

  const setViewMode = useStore((state) => state.setViewMode, shallow);
  const clearFocus = useStore((state) => state.clearFocus, shallow);

  //added to keep track of sourceInfo
  const sourceInfo_to_pass = useStore((s) => s.lastSourceInfo);

  const [editorRef, editorBounds] = useMeasure();
  const [simRef, simBounds] = useMeasure();

  // const theme = getTheme(primaryColor);
  const muiTheme = muiCreateTheme({
    palette: {
      mode: "dark",
      highlightColor: {
        main: primaryColor,
        darker: primaryColor,
      },
      primaryColor: {
        main: primaryColor,
        darker: primaryColor,
      },
      primary: {
        main: primaryColor,
      },
      quiet: {
        main: "#444",
        darker: "#333",
      },
      vibrant: {
        main: "#fff",
        darker: "#ddd",
      },
      safety: {
        main: "#CC79A7",
      },
      quality: {
        main: "#56B4E9",
      },
      performance: {
        main: "#E69F00",
      },
      business: {
        main: "#009E73",
      },
      error: {
        main: "#f44336",
      }
    },
    typography: {
      color: "white",
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(","),
    },
  });

  const containerRef = useRef(null);
  const [topHeight, setTopHeight] = useState(20);       // 20 vh start
  const [dragging, setDragging] = useState(false);
  const [containerTop, setContainerTop] = useState(0);
  
  const cellSize = Math.floor((topHeight / 100) * window.innerHeight / 8);

  const startDrag = (e) => {
    setDragging(true);
    // snapshot the container's Y-position once
    setContainerTop(containerRef.current.getBoundingClientRect().top);
    e.preventDefault(); // stop text-selection cursor flashes
  };

  const doDrag = useCallback(
    (e) => {
      if (!dragging) return;
      const newVh =
        ((e.clientY - containerTop) / window.innerHeight) * 100;
      setTopHeight(Math.max(10, Math.min(80, newVh)));
    },
    [dragging, containerTop]
  );

  const stopDrag = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", doDrag);
      window.addEventListener("mouseup", stopDrag);
      return () => {
        window.removeEventListener("mousemove", doDrag);
        window.removeEventListener("mouseup", stopDrag);
      };
    }
  }, [dragging, doDrag]);

  const showSim = viewMode === "default" || viewMode === "sim";
  const showEditor = viewMode === "default" || viewMode === "program";

  // Hallway color cell highlighting
  const hallways = [[0,0],[0,1],[0,2],[0,3],[4,0],[4,1],[4,2],[4,3],[1,3],[2,3],[3,3],
                    [3,4],[3,5],[3,6],[3,7],[4,4],[4,5],[4,6],[4,7],
                    [5,4],[5,5],[5,6],[5,7],[6,4],[6,5],[6,6],[6,7],[7,4],[7,5],[7,6],[7,7],
                    [8,4],[8,5],[8,6],[8,7],[9,4],[9,5],[9,6],[9,7]];

  // Scenario setting
  const [scenario, setScenario] = useState("Scenario 1");
  const iconSets = {
    "Scenario 1": {'5,6': robotPng, '0,7': employeePng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                '0,6': wrongObjPng, '1,6': correctObjPng},
    "Scenario 2": {'8,2': robotPng, '0,7': employeePng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                '0,6': wrongObjPng, '1,6': correctObjPng},
    "Scenario 3": {'8,2': robotPng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                '0,6': employeePng, '1,7': employeePng, '1,5': employeePng, '2,6': employeePng, '1,6': correctObjPng},
    "Scenario 4": {'8,2': robotPng, '0,7': employeePng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                '0,6': wrongObjPng, '1,6': correctObjPng},
    "Scenario 5": {'8,2': robotPng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                '0,7': employeePng, '1,7': wrongObjPng, '1,5': wrongObjPng, '2,6': wrongObjPng, '0,6': wrongObjPng, '1,6': correctObjPng,
                '4,0': barrierPng, '4,1': barrierPng, '4,2': barrierPng, '4,3': barrierPng,
                '5,4': cartPng, '6,4': cartPng, '7,4': cartPng, '8,4': cartPng, '9,4': cartPng},
  };
  const icons = iconSets[scenario] ?? {}; 
  //console.log("is it the right scenario, ",scenario);
  //console.log("does it print the right icons, ", icons);


  // // Icon setting
  // const icons = {'5,6': robotPng, '0,7': employeePng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
  //               '0,6': wrongObj, '1,6': correctObj
  // };

  // Label setting
  const labelsOverGrid = [{ text: 'Activity area', from: [1, 2], to: [3, 2] },
                      { text: 'Package room', from: [0, 7], to: [2, 7] },
                      { text: 'Elderly room', from: [6, 3], to: [8, 3]}];

  return (
    
      <ThemeProvider theme={muiTheme}>
        <Stack
          direction="row"
          style={{
            backgroundColor: "red",
            height: "100vh",
            width: "100vw",
            position: "fixed",
          }}
        >
          {/* {fallbackMode && (
           <ReviewTile drawerOpen={visibleSteps && errorType === null} fallbackMode={fallbackMode} /> 
           )} */}
          <ReflexContainer
            orientation="vertical"
            style={{ backgroundColor: "blue" }}
          >
            {showEditor && (
              <ReflexElement
                id="reflex-program"
                style={{ overflow: "hidden" }}
                // minSize={200}
                onStopResize={(e) => {
                  if (editorBounds.width / simBounds.width < 0.2) {
                    console.log("setting to sim", e);
                    setViewMode("sim");
                  }
                }}
              >
                <Box
                  ref={containerRef}
                  sx={{
                    display: "flex",
                    flexDirection: "column", // stack vertically
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Box sx={{ height: `${topHeight}vh`, flexShrink: 0 }}>
                    <RobotWorld
                      cellSize = {cellSize}
                      sx={{ height: "35vh", flexShrink: 0 }}
                      highlight={hallways}
                      color="#faeef2"
                      icons={icons}
                      labelsOverGrid={labelsOverGrid}
                      sourceInfo_to_pass = {sourceInfo_to_pass}
                      scenario={scenario} 
                    />
                  </Box>

                  <Divider
                    orientation="horizontal"
                    sx={{ cursor: "row-resize", userSelect: "none" }}
                    onMouseDown={startDrag}
                  />

                  {/* editor fills the remaining space */}
                  <ProgramTile
                    ref={editorRef}
                    style={{ flex: 1, minHeight: 0 }}
                    onScenarioChange={setScenario} 
                  />
                </Box>

              </ReflexElement>
            )}
          </ReflexContainer>
        </Stack>
        <Detail />
        <SettingsModal />
      </ThemeProvider>
  );
}

