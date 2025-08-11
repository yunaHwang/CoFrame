import React, { useCallback, useEffect, useState, useRef} from "react";
// import { FiSettings } from "react-icons/fi";
//import { ReviewTile } from "./components/Body/ReviewTile";
import { ProgramTile } from "./components/Body/ProgramTile";
import SimTile from "./components/Body/SimTile";
import { subscribeFlush, unsubscribeFlush } from "./stores/to_flask";
import { TIMELINE_TYPES, STATUS } from "./stores/Constants";
import { Detail } from "./components/Detail";
import { SettingsModal } from "./components/Settings";

import {
  ThemeProvider,
  createTheme as muiCreateTheme,
  THEME_ID,
} from "@mui/material/styles";

import { Tabs, Tab } from "@mui/material";

import { Drawer, Snackbar, Alert, AlertTitle, Stack, Box, Divider, Typography, IconButton } from "@mui/material";
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

import arrowPng from "./components/FallbackIcons/arrow.png"

export default function App() {
  const primaryColor = useStore((state) => state.primaryColor, shallow);
  const viewMode = useStore((state) => state.viewMode, shallow);
  // const visibleSteps = useStore(
  //   (state) =>
  //     state.focus.some((focusItem) =>
  //       TIMELINE_TYPES.includes(state.programData[focusItem]?.type)
  //     ),
  //   shallow
  // );
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

  // const [focusSteps, errorType] = useCompiledStore(
  //   useCallback(
  //     (state) => {
  //       let steps = [];
  //       let errorType = null;
  //       if (!visibleSteps) {
  //         return [steps, errorType];
  //       }
  //       focusData.some((f) => {
  //         if (
  //           [STATUS.VALID, STATUS.PENDING, STATUS.WARN].includes(
  //             f?.properties?.status
  //           ) &&
  //           TIMELINE_TYPES.includes(f.type)
  //         ) {
  //           if (state[f.id] && Object.keys(state[f.id]).length === 1) {
  //             steps = state[f.id][Object.keys(state[f.id])[0]]?.steps;
  //             return true;
  //           } else {
  //             errorType = "traces";
  //             return false;
  //           }
  //         } else {
  //           errorType = "invalid";
  //           return false;
  //         }
  //       });
  //       return [steps, errorType];
  //     },
  //     [focusData, visibleSteps]
  //   ),
  //   shallow
  // );

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

  const [violationList, setViolationList] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);

  const [fallbackSetList, setFallbackSetList] = useState([]);


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

  useEffect(() => {
    function handleFlush(json) {
      console.log("what is json.status, ", json.status);
      console.log("what is json, ", json);


      const violations = json?.violations ??
        json?.ltl_results?.violations ??
        [];
      
      setViolationList(violations);
      setShowDrawer(violations.length > 0);
      console.log("violations, ", violations)

      console.log("what is json.clean, ", json.clean);
      console.log("what is json.charge_pending, ", json.charge_pending);

      if (typeof json.charge_pending === "boolean") {
        useStore.getState().setChargePending(json.charge_pending);
      }
      if (typeof json.clean === "boolean") {
        useStore.getState().setClean(json.clean);
      }

      if (typeof json.currentFallbackTypeId === "string") {
        useStore.getState().setCurrentFallbackTypeId(json.currentFallbackTypeId);
      }

      const trigger_charge = json.trigger_charge === true;
      if (trigger_charge) {
        const hadWarning = useStore.getState().battery20Warning || useStore.getState().battery5Warning;

        console.log("hadWarning at this point, ", hadWarning);

        // charge only when warning resolved
        const trackingLen = useStore.getState().actionTracking.length;

        // battery set to charge state (battery = 100)
        //useStore.getState().setJustResetBattery(true);
        useStore.getState().setGlobalBatteryLevel(100);
        useStore.getState().setbatteryLevel(100);

        const batteryLevel = useStore.getState().batteryLevel;

        console.log("this made it charged and so the batteryLevel is, ", batteryLevel);
        useStore.getState().setBatteryResetActionCount(trackingLen);

        // ux + warning resets
        useStore.getState().setShowBatteryCharged(true);
        useStore.getState().setBattery20Warning(false);
        useStore.getState().setBattery5Warning(false);
        
      }

      console.log("what is json.fallbackSetSignals, ", json.fallbackSetSignals);

      if (Array.isArray(json.fallbackSetSignals)) {
        for (const signalBlock of json.fallbackSetSignals) {
          const {
            fallbackSetId,
            fallbackSetName,
            fallbacks,
            fallbackNames,
            actionSignals,
            errorType
          } = signalBlock;

          console.log("debugging - signalBlock, ", signalBlock);

          setFallbackSetList(prevList => {
            const existingIndex = prevList.findIndex(
              set => set.fallbackSetId === fallbackSetId && set.errorType === errorType
            );

            const updatedSet = {
              fallbackSetId,
              fallbackSetName,
              errorType,
              fallbacks,
              fallbackNames,
              actionSignals,
            };
            console.log("debugging - this is what it's kept - updatedSet/fallbackSetList, ", updatedSet);

            if (existingIndex !== -1) {
              const newList = [...prevList];
              newList[existingIndex] = updatedSet;
              return newList;
            } else {
              return [...prevList, updatedSet];
            }
          });
        }
      }
      
    }
    subscribeFlush(handleFlush);
    return () => unsubscribeFlush(handleFlush);   // cleanup on unmount
  }, []);

  console.log("what is fallbackSetList, ", fallbackSetList); // this somehow shows actionSignals as null

  const showSim = viewMode === "default" || viewMode === "sim";
  const showEditor = viewMode === "default" || viewMode === "program";


  // Hallway color cell highlighting
  const hallways = [[0,0],[0,1],[0,2],[0,3],[4,0],[4,1],[4,2],[4,3],[1,3],[2,3],[3,3],
                    [3,4],[3,5],[3,6],[3,7],[4,4],[4,5],[4,6],[4,7],
                    [5,4],[5,5],[5,6],[5,7],[6,4],[6,5],[6,6],[6,7],[7,4],[7,5],[7,6],[7,7],
                    [8,4],[8,5],[8,6],[8,7],[9,4],[9,5],[9,6],[9,7]];

  // Scenario setting
  const [scenario, setScenario] = useState("Scenario 1");
  const [dynamicIcons, setDynamicIcons] = useState(() => {
    const iconSets = {
      "Scenario 1": {'5,6': robotPng, '0,7': employeePng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                  '0,6': wrongObjPng, '1,6': correctObjPng},
      "Scenario 2": {'8,1': robotPng, '0,7': employeePng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                  '0,6': wrongObjPng, '1,6': correctObjPng},
      "Scenario 3": {'8,1': robotPng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                  '0,6': employeePng, '1,7': employeePng, '1,5': employeePng, '2,6': employeePng, '1,6': correctObjPng},
      "Scenario 4": {'8,1': robotPng, '0,7': employeePng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                  '0,6': wrongObjPng, '1,6': correctObjPng},
      "Scenario 5": {'8,1': robotPng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                  '0,7': employeePng, '1,7': wrongObjPng, '1,5': wrongObjPng, '2,6': wrongObjPng, '0,6': wrongObjPng, '1,6': correctObjPng,
                  '4,0': barrierPng, '4,1': barrierPng, '4,2': barrierPng, '4,3': barrierPng,
                  '5,4': cartPng, '6,4': cartPng, '7,4': cartPng, '8,4': cartPng, '9,4': cartPng},
      };
    return iconSets;
  });
  useEffect(() => {
    const deafult = {
        "Scenario 1": {'5,6': robotPng, '0,7': employeePng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                    '0,6': wrongObjPng, '1,6': correctObjPng},
        "Scenario 2": {'8,1': robotPng, '0,7': employeePng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                    '0,6': wrongObjPng, '1,6': correctObjPng},
        "Scenario 3": {'8,1': robotPng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                    '0,6': employeePng, '1,7': employeePng, '1,5': employeePng, '2,6': employeePng, '1,6': correctObjPng},
        "Scenario 4": {'8,1': robotPng, '0,7': employeePng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                    '0,6': wrongObjPng, '1,6': correctObjPng},
        "Scenario 5": {'8,1': robotPng, '7,6': employeePng, '9,7': chargingPng, '9,1': elderlyPng,
                    '0,7': employeePng, '1,7': wrongObjPng, '1,5': wrongObjPng, '2,6': wrongObjPng, '0,6': wrongObjPng, '1,6': correctObjPng,
                    '4,0': barrierPng, '4,1': barrierPng, '4,2': barrierPng, '4,3': barrierPng,
                    '5,4': cartPng, '6,4': cartPng, '7,4': cartPng, '8,4': cartPng, '9,4': cartPng}
      };
      setDynamicIcons(deafult);
    }, [scenario]);
  const updateIcons = (newIcons) => {
    setDynamicIcons((prev) => {
      const activeScenario = scenario;
      return {
        ...prev,
        [activeScenario]: { ...newIcons } 
      };
    });
  };
  const icons = dynamicIcons[scenario] ?? {};


  // Label setting
  const labelsOverGrid = [{ text: 'Activity area', from: [1, 2], to: [3, 2] },
                      { text: 'Package room', from: [0, 7], to: [2, 7] },
                      { text: 'Elderly room', from: [6, 3], to: [8, 3]}];

  // Current FallbackType setting for explanation generation                    
  const currentFallbackTypeId = useStore((s) => s.currentFallbackTypeId);
  console.log("what is currentFallbackTypeId," ,currentFallbackTypeId);


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
                    <SimTile
                      cellSize = {cellSize}
                      sx={{ height: "35vh", flexShrink: 0 }}
                      highlight={hallways}
                      color="#fffefa"
                      icons={dynamicIcons[scenario] ?? {}}
                      onIconsUpdate={updateIcons} 
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

          
          {showDrawer ? 
          (<Drawer
            variant="permanent"
            anchor="right"
            open={true}
            sx={{
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: "22vw",
                position: "relative",
                boxSizing: "border-box",
                p: 0,
              },
            }}>
              <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 4 }}>

                {/* Detected Issues Stack */}
                <Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>Detected Issues</Typography>
                    <IconButton onClick={() => setShowDrawer(false)}>&gt;</IconButton>
                  </Box>

                  {violationList.length === 0 ? (
                    <Typography sx={{ mt: 2 }}>No violations</Typography>
                  ) : (
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      {violationList.map((text, idx) => (
                        <Alert key={idx} severity="error" variant="outlined">
                          {text}
                        </Alert>
                      ))}
                    </Stack>
                  )}
                </Box>

                <Divider sx={{ borderColor: "grey.700" }} />

                {/* Fallback sets Stack */}
                <Box>
                  <Typography variant="h6" gutterBottom>Fallback Sets</Typography>
                  {fallbackSetList.length > 0 ? (
                    <Stack spacing={2}>
                      {fallbackSetList.map((set, idx) => (
                        <Box key={`${set.fallbackSetId}-${set.errorType}`} 
                                sx={{ p: 2, bgcolor: "grey.900", borderRadius: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {idx + 1}. {set.fallbackSetName || set.fallbackSetId}
                            </Typography>

                            <Stack spacing={1} sx={{ pl: 1 }} alignItems="center">
                              {set.fallbacks.map((fbId, i) => (
                                //console.log("Rendering fallback:", fbId, "with signals:", set.actionSignals?.[fbId]);

                                <React.Fragment key={fbId}>
                                    <Box
                                      key={fbId}
                                      sx={{
                                        px: 2,
                                        py: 1,
                                        bgcolor: "grey.800",
                                        borderRadius: 1,
                                        border: "1px solid grey",
                                        minWidth: "80%",
                                        textAlign: "center",
                                        position: "relative",
                                      }}>

                                      <Typography variant="body2">
                                        {set.fallbackNames[i] || fbId}
                                      </Typography>

                                      <Box
                                        sx={{
                                          position: "absolute",
                                          bottom: 6,
                                          left: 6,
                                          width: 12,
                                          height: 12,
                                          borderRadius: "50%",
                                          bgcolor:
                                            set.actionSignals?.[fbId] === "red"
                                              ? "red"
                                              : set.actionSignals?.[fbId] === "green"
                                              ? "green"
                                              : "gold",
                                        }}
                                      />
                                    </Box>

                                    {i < set.fallbacks.length - 1 && (
                                    <Box component="img" src={arrowPng} alt="↓" sx={{ height: 24, width: 24, mt: 0.5, mb: 0.5 }} />
                                    )}
                                    </React.Fragment>
                                    ))}

                              {(() => {
                                    const hasFallbacks = set.fallbacks.length > 0;
                                    const isInThisSet = set.fallbacks.includes(currentFallbackTypeId);
                                    const fallbackSignal = isInThisSet ? set.actionSignals?.[currentFallbackTypeId] : null;

                                    let explanation = null;
                                    let bgcolor = "";
                                    let border = "";

                                    if (isInThisSet) {
                                      if (fallbackSignal === "green") {
                                        explanation = "Issue resolved. You successfully programmed the fallback.";
                                        bgcolor = "#e0f2f1"; // light green-ish
                                        border = "#4caf50";
                                      } else if (fallbackSignal === "red") {
                                        explanation = "This fallback behavior does not satisfy the required condition for solving the robot failure. Check the 'Detected Issues' tab to see what went wrong and how to fix it.";
                                        bgcolor = "#fcebea"; // red
                                        border = "#f5c6cb";
                                      } else {
                                        explanation = "No effective fallback actions yet. The actions you’ve added didn’t resolve the issue. Check above in the 'Detected Issues' section for hints on how to fix it.";
                                        bgcolor = "#fff9c4"; // yellow
                                        border = "#fdd835";
                                      }
                                    } 

                                    return explanation ? (
                                      <Box
                                        sx={{
                                          mt: 2,
                                          p: 2,
                                          bgcolor,
                                          border: `1px solid ${border}`,
                                          borderRadius: 2,
                                          minWidth: "80%",
                                          textAlign: "left"
                                        }}
                                      >
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          color:
                                            bgcolor === "#fcebea"
                                              ? "#b71c1c"
                                              : bgcolor === "#e0f2f1"
                                              ? "#1b5e20"
                                              : "#9e8600",
                                          fontWeight: 600
                                        }}
                                      >
                                        {explanation}
                                      </Typography>
                                    </Box>): null;})()}
                            </Stack>

                          </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{ mt: 1 }}> No fallback behaviors are currently active.</Typography>
                  )}
                </Box>

              </Box>


          </Drawer>) : 
          (
            <Box
              onClick={() => setShowDrawer(true)}
              sx={{
                width: 30,
                cursor: "pointer",
                userSelect: "none",
                bgcolor: "grey.800",
                color: "grey.100",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              &gt;
            </Box>
          )}
            
        </Stack>
        <Detail />
        <SettingsModal />
      </ThemeProvider>
  );
}

