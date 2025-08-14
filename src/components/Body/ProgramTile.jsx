import React, { forwardRef, useState } from 'react';
import { Environment } from 'open-vp';
import Tile from '../Elements/Tile';
import useStore from '../../stores/Store';
import { useRef, useEffect } from 'react'; 
import { Stack, CircularProgress, IconButton, Typography, Box, Paper, Button, Snackbar, Alert, Menu, MenuItem } from '@mui/material';
//import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { shallow } from 'zustand/shallow';

import { stageBatteryWarning } from "../../stores/to_flask";

import { FixtureIcon } from '../CustomIcons/Fixture';
import Spotlight from './Spotlight';

export const ProgramTile = forwardRef(({onScenarioChange,}, ref) => {

    const highlightColor = useStore(state => state.primaryColor,shallow);
    const setViewMode = useStore(state => state.setViewMode,shallow);
    const viewMode = useStore(state => state.viewMode,shallow);
    const setActiveModal = useStore(state => state.setActiveModal,shallow);
    const isProcessing = useStore(state => state.processes.planProcess !== null && state.processes.planProcess !== undefined,shallow);

    const batteryWarning = useStore(state => state.batteryWarning, shallow);
    const setBatteryWarning = useStore(state => state.setBatteryWarning, shallow);
    const fallbackMode = useStore(state => state.fallbackMode, shallow);
    const batteryLevel = useStore(state => state.batteryLevel, shallow);
    const globalBatteryLevel = useStore(state => state.globalBatteryLevel, shallow); //added
    const globalDistanceTravel = useStore(state => state.globalDistanceTravel, shallow);

    // battery warnings for popping errors
    const battery20Warning = useStore(state => state.battery20Warning,shallow);
    const setBattery20Warning = useStore(state => state.setBattery20Warning,shallow);
    const battery5Warning     = useStore(state => state.battery5Warning, shallow);
    const setBattery5Warning  = useStore(state => state.setBattery5Warning,shallow);

    // sensor warning for popping error
    const sensorWarning = useStore(state => state.sensorWarning, shallow);
    const setSensorWarning = useStore(state => state.setSensorWarning, shallow);

    // person block warning for popping error
    const personBlockWarning = useStore(state => state.personBlockWarning, shallow);
    const setPersonBlockWarning = useStore(state => state.setPersonBlockWarning, shallow);

    // heavy warning for popping error
    const heavyWarning = useStore(state => state.heavyWarning, shallow);
    const setHeavyWarning = useStore(state => state.setHeavyWarning, shallow);


    // [5-1] cart/fence block warning for popping error
    const cartBlockWarning = useStore(state => state.cartBlockWarning, shallow);
    const setCartBlockWarning = useStore(state => state.setCartBlockWarning, shallow);

    // [5-2] package block warning for popping error
    const packageBlockWarning = useStore(state => state.packageBlockWarning, shallow);
    const setPackageBlockWarning = useStore(state => state.setPackageBlockWarning, shallow);
    
    
    const prevLevelRef = useRef(batteryLevel);

    const actionMessage = useStore(state => state.actionMessage, shallow);

    const errorMessage = useStore(state => state.errorMessage, shallow);
    const showError = useStore(state => state.showError, shallow);
    const distanceTravel = useStore(state => state.distanceTravel, shallow);
    // const [ref, bounds] = useMeasure();
    const [errorHistory, setErrorHistory] = useState([]);

    const [scenario,  setScenario]  = useState('Scenario 1');
    const [menuAnchor, setMenuAnchor] = useState(null);
    const openMenu   = e => setMenuAnchor(e.currentTarget);
    const closeMenu  = () => setMenuAnchor(null);
    const pick       = label => { setScenario(label); onScenarioChange?.(label); closeMenu(); };

    const robotOrientation = useStore(state => state.robotOrientation || "E", shallow);

    //const displayDistance = Math.floor(distanceTravel / 8) * 8; // every 5 cells display, 1 cell move 1 battery drop
    const displayBattery = Math.ceil(batteryLevel / 5) * 5; // every 5 percent drop display
    //const displayDistance = Math.floor(distanceTravel / 1) * 1; 
    const displayDistance = distanceTravel.toFixed(1);
    // const displayBattery = Math.ceil(batteryLevel / 1) * 1; // Mason Test
    const tableIconRef = useRef(null);
    const [showSpotlight, setShowSpotlight] = useState(false);

    const getRobotFacingDisplay = () => {
        const facingMap = {
            "N": "↑ North",
            "E": "→ East", 
            "S": "↓ South",
            "W": "← West"
        };
    return facingMap[robotOrientation] || "→ East";
};
    // useEffect for flipping the warnings 
    // useEffect(() => {
    // //console.log("why is not below 20? ", batteryLevel);
    // if (prevLevelRef.current > 20 && batteryLevel <= 20 && batteryLevel > 5) {
    //     setErrorHistory(prev => ['Battery Low', ...prev]);
    // }

    // if (prevLevelRef.current > 5 && batteryLevel <= 5) {
    //     setErrorHistory(prev => ['Battery Critical', ...prev]);

    // }

    // prevLevelRef.current = batteryLevel;
    // }, [batteryLevel]);

    // useEffect for sending the flipped warning signs 
    useEffect(() => {
    if (battery20Warning)  stageBatteryWarning(20, true);
    if (battery5Warning)   stageBatteryWarning(5,  true);
    }, [battery20Warning, battery5Warning]);

    useEffect(() => {
    // Show the spotlight 1 second after render (or whenever you want)
    const timer = setTimeout(() => setShowSpotlight(true), 1000);
    return () => clearTimeout(timer);
  }, []);
//   useEffect(() => {
//   // Simulate multiple errors for testing
//   setTimeout(() => {
//     setErrorHistory(['Battery Critical', 'Battery Low', 'Battery Low', 'Battery Critical', 'Battery Low']);
//   }, 500);
// }, []);
    

    return (
        <Stack ref={ref} direction='column' style={{width:'100%',height:'100%'}} >

            {battery20Warning && (
                <Spotlight message="This is where you can get more fallback containers.." />
            )}
            {/* {showSpotlight && (
                <Spotlight targetRef={tableIconRef} message="This is where you can get more fallback containers." />
            )} */}

            <Tile
                style={{ height: '100%'}}
                borderWidth={3}
                borderRadius={0}
                internalPaddingWidth={0}
                innerStyle={{height:'calc(100% - 55px)'}}
                header={
                    <Stack direction='row' alignItems="center" justifyContent='space-between' sx={{ pr: '4px', width: '100%' }}>
                        <Stack direction='row' gap={1} alignItems='center'>
                            <Box
                            sx = {{
                                backgroundColor: '#932848', 
                                padding: '6px 12px',
                                borderRadius: '2px'
                            }}
                            >
                                <Typography style={{ color: 'white' }}>Distance Traveled: {displayDistance} feet</Typography>
                            </Box>

                            <Box
                            sx = {{
                                backgroundColor: '#531629', 
                                padding: '6px 12px',
                                borderRadius: '2px'
                            }}>
                                <Typography style={{ color: 'white' }}>Current Battery Level {displayBattery}%</Typography>
                            </Box>
                            <Box 
                            sx={{ 
                                backgroundColor: '#2d5a87', 
                                padding: '6px 12px', 
                                borderRadius: '2px' 
                                }}>
                                <Typography style={{ color: 'white' }}>Robot Facing: {getRobotFacingDisplay()}</Typography>
                            </Box>
                            {actionMessage && (
                            <Box 
                                sx={{ 
                                backgroundColor: '#d3a352ff', 
                                padding: '6px 12px',
                                borderRadius: '2px',
                                animation: 'fadeInOut 3s linear',
                                color: 'white'
                                }}
                            >
                                <Typography>{actionMessage}</Typography>
                            </Box>
                            )}
                            </Stack>
                            {/* {showError && errorMessage && (
                            <Box
                            sx = {{
                                backgroundColor: '#531629', 
                                padding: '6px 12px',
                                borderRadius: '2px'
                            }}>
                                <Typography style={{ color: 'white', fontSize: '15px' }}>
                                ⚠️ {errorMessage}
                                </Typography>
                            </Box>
                            )} */}
                            {/* {errorHistory.length > 0 && (
                            <Box sx={{ 
                                display: 'flex',
                                gap: 1,
                                overflowX: 'auto',
                                maxWidth: '800px',
                                '&::-webkit-scrollbar': { height: 7 },
                                '&::-webkit-scrollbar-thumb': { backgroundColor: 'white', borderRadius: 5 }
                            }}>
                            {errorHistory.map((error, index) => (
                                <Box key={index} sx={{
                                    backgroundColor: '#ffb74d',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '2px',
                                    minWidth: 'fit-content',
                                    fontSize: '19px'                               
                                    }}>
                                {error}
                                </Box>
                            ))}
                            </Box>
                        )} */}
                
                            
            
                            <Box
                                sx={{
                                    backgroundColor: '#E37383',
                                    p: '6px 12px',
                                    borderRadius: '2px',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                                onClick={openMenu}
                                >
                                <Typography sx={{ color: 'white' }}>{scenario}</Typography>
                                <Typography sx={{ color: 'white' }}>▾</Typography> 
                            </Box>
                            <Menu
                                anchorEl={menuAnchor}
                                open={Boolean(menuAnchor)}
                                onClose={closeMenu} 
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                transformOrigin={{ vertical: 'top',   horizontal: 'left' }}
                            >
                            {['Scenario 1', 'Scenario 2', 'Scenario 3', 'Scenario 4', 'Scenario 5']
                            .map(label => (
                                <MenuItem
                                key={label}
                                selected={label === scenario}
                                onClick={() => pick(label)}
                                >
                                {label}
                                </MenuItem>
                            ))}
                            </Menu>
                        </Stack>

                }
            >   
            <Box position="relative" style={{height: '100%'}} key={fallbackMode ? 'fallback' : 'normal'}>
                <Environment store={useStore} highlightColor={highlightColor} snapToGrid={false} animateDrawer={true} drawerWidth={325} />
                {fallbackMode && batteryWarning && (
                        <Paper
                            sx={{   
                                position: 'absolute',
                                top: '10%',
                                left: '25%',
                                backgroundColor: '#ffa726',
                                color: 'black',
                                padding: '10px 16px', 
                                maxWidth: '400px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4}}>
                                ⚠️ Warning <br />
                                Keep in mind that the robot's battery is not permanent. 
                            </Typography>
                            <Button 
                                variant="contained"
                                onClick={() => setBatteryWarning(false)}
                                sx={{ 
                                    backgroundColor: 'rgba(231, 110, 18, 0.2)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(146, 45, 45, 0.3)'
                                    }
                                }}
                            >
                                Noted
                            </Button>
                        </Paper>
                    )}
                    

                {/* battery error popping messages */}
                 {battery20Warning && (
                                <Paper
                                    sx={{ 
                                        position: 'absolute',
                                        top: '10%',
                                        left: '25%',
                                        backgroundColor: '#ffb74d',  
                                        color: 'black',
                                        p: '10px 16px',
                                        maxWidth: 400,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                                ⚠️ Battery Low<br/>
                            Stretch is below 20% battery. You don't want Stretch to turn off and stop in the middle of the hallway. What should Stretch do? Think ahead and define a few alternatives in case earlier ones fail.
                                </Typography>
                                <Button 
                                variant="contained"
                                onClick={() => setBattery20Warning(false)}
                                sx={{ 
                                    backgroundColor: '#ffb74d',
                                    '&:hover': {
                                        backgroundColor: 'rgba(146, 45, 45, 0.3)'
                                    }
                                }}
                            >
                                Okay
                            </Button>
                            </Paper>
                
                    )} 
                
                 {battery5Warning && (
                    <Paper
                        sx={{ 
                        position: 'absolute',
                        top: '10%',
                        left: '25%',
                        backgroundColor: '#e53935',  
                        color: 'white',
                        p: '10px 16px',
                        maxWidth: 400,
                        display: 'flex',
                        alignItems: 'center'
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                        🚨 Critical Battery<br/>
                        Below 5 %! Take action so that the robot doesn't stop in the middle of the hallway. What should Stretch do? Think ahead and define a few alternatives in case earlier ones fail.
                        </Typography>
                        <Button
                        variant="contained"
                        onClick={() => setBattery5Warning(false)}
                        sx={{
                            ml: 2,
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.3)' }
                        }}
                        >
                        Okay
                        </Button>
                    </Paper>
                    )} 

                {/* sensor error popping message */}
                 {sensorWarning && (
                                <Paper
                                    sx={{ 
                                        position: 'absolute',
                                        top: '10%',
                                        left: '25%',
                                        backgroundColor: '#ff9966',  
                                        color: 'black',
                                        p: '10px 16px',
                                        maxWidth: 400,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                                ⚠️ Sensor broken<br/>
                            Uh-oh, Stretch's camera sensor just broke down. What should Stretch do in the midst of its package delivery mission? Think ahead and define a few alternatives in case earlier ones fail.
                                </Typography>
                                <Button 
                                variant="contained"
                                onClick={() => setSensorWarning(false)}
                                sx={{ 
                                    backgroundColor: '#ff9966',
                                    '&:hover': {
                                        backgroundColor: 'rgba(146, 45, 45, 0.3)'
                                    }
                                }}
                            >
                                Okay
                            </Button>
                            </Paper>
                
                    )} 

                {/* person block error popping message */}
                 {personBlockWarning && (
                                <Paper
                                    sx={{ 
                                        position: 'absolute',
                                        top: '10%',
                                        left: '25%',
                                        backgroundColor: '#ff9966',  
                                        color: 'black',
                                        p: '10px 16px',
                                        maxWidth: 400,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                                ⚠️ Person Blocking<br/>
                            The package room is full of people looking for their delivery items. What should Stretch do in this case? Think ahead and define a few alternatives in case earlier ones fail.
                                </Typography>
                                <Button 
                                variant="contained"
                                onClick={() => setPersonBlockWarning(false)}
                                sx={{ 
                                    backgroundColor: '#ff9966',
                                    '&:hover': {
                                        backgroundColor: 'rgba(146, 45, 45, 0.3)'
                                    }
                                }}
                            >
                                Okay
                            </Button>
                            </Paper>
                
                    )} 

                {/* heavy error popping message */}
                 {heavyWarning && (
                                <Paper
                                    sx={{ 
                                        position: 'absolute',
                                        top: '10%',
                                        left: '25%',
                                        backgroundColor: '#ff9966',  
                                        color: 'black',
                                        p: '10px 16px',
                                        maxWidth: 400,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                                ⚠️ Heavy Package<br/>
                            The package that Stretch has to deliver is way above its payload. What should Stretch do in this case? Think ahead and define a few alternatives in case earlier ones fail.
                                </Typography>
                                <Button 
                                variant="contained"
                                onClick={() => setHeavyWarning(false)}
                                sx={{ 
                                    backgroundColor: '#ff9966',
                                    '&:hover': {
                                        backgroundColor: 'rgba(146, 45, 45, 0.3)'
                                    }
                                }}
                            >
                                Okay
                            </Button>
                            </Paper>
                
                    )} 

                {/* cart block error popping message */}
                 {cartBlockWarning && (
                                <Paper
                                    sx={{ 
                                        position: 'absolute',
                                        top: '10%',
                                        left: '25%',
                                        backgroundColor: '#ff9966',  
                                        color: 'black',
                                        p: '10px 16px',
                                        maxWidth: 400,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                                ⚠️ Blocked by Carts and Fences<br/>
                            The facility is going through major renovation and Stretch can't seem to get through the carts and fences. What should Stretch do in this case? Think ahead and define a few alternatives in case earlier ones fail.
                                </Typography>
                                <Button 
                                variant="contained"
                                onClick={() => setCartBlockWarning(false)}
                                sx={{ 
                                    backgroundColor: '#ff9966',
                                    '&:hover': {
                                        backgroundColor: 'rgba(146, 45, 45, 0.3)'
                                    }
                                }}
                            >
                                Okay
                            </Button>
                            </Paper>
                
                    )} 

                {/* package block error popping message */}
                 {packageBlockWarning && (
                                <Paper
                                    sx={{ 
                                        position: 'absolute',
                                        top: '10%',
                                        left: '25%',
                                        backgroundColor: '#ff9966',  
                                        color: 'black',
                                        p: '10px 16px',
                                        maxWidth: 400,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                                ⚠️ Delivery Item Blocked<br/>
                            The package that Stretch has to deliver is blocked by other residents' packages. What should Stretch do in this case? Think ahead and define a few alternatives in case earlier ones fail.
                                </Typography>
                                <Button 
                                variant="contained"
                                onClick={() => setPackageBlockWarning(false)}
                                sx={{ 
                                    backgroundColor: '#ff9966',
                                    '&:hover': {
                                        backgroundColor: 'rgba(146, 45, 45, 0.3)'
                                    }
                                }}
                            >
                                Okay
                            </Button>
                            </Paper>
                
                    )} 
                </Box>

            </Tile>
        </Stack>
    )
});