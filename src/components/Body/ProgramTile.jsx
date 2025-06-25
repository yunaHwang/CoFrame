import React, { forwardRef, useState } from 'react';
import { Environment } from 'open-vp';
import Tile from '../Elements/Tile';
import useStore from '../../stores/Store';
import { Stack, CircularProgress, IconButton, Typography, Box, Paper, Button, Snackbar, Alert, Menu, MenuItem } from '@mui/material';
//import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { shallow } from 'zustand/shallow';

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
    const distanceTravel = useStore(state => state.distanceTravel, shallow);
    // const [ref, bounds] = useMeasure();

    const [scenario,  setScenario]  = useState('Scenario 1');
    const [menuAnchor, setMenuAnchor] = useState(null);
    const openMenu   = e => setMenuAnchor(e.currentTarget);
    const closeMenu  = () => setMenuAnchor(null);
    const pick       = label => { setScenario(label); onScenarioChange?.(label); closeMenu(); };

    const displayDistance = Math.floor(distanceTravel / 8) * 8;
    const displayBattery = Math.ceil(batteryLevel / 5) * 5;

    return (
        <Stack ref={ref} direction='column' style={{width:'100%',height:'100%'}} >

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
                        </Stack>
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
                                <Typography sx={{ color: 'white' }}>▾</Typography> {/* ▼ or ▾ */}
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
                    //</Stack>

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
                                Your robot can go under 10% battery after traveling 10km. Keep this in mind when you are programming your robot.
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
                </Box>

            </Tile>
        </Stack>
    )
});