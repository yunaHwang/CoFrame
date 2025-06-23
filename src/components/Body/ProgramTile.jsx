import React, {forwardRef} from 'react';
import { useMemo } from 'react';
import { Environment } from 'open-vp';
import Tile from '../Elements/Tile';
import useStore from '../../stores/Store';
import { FiSettings, FiMaximize, FiMinimize } from "react-icons/fi";
import { Stack, CircularProgress, IconButton, Typography, Box, Paper, Button, Snackbar, Alert} from '@mui/material';
import { shallow } from 'zustand/shallow';

export const ProgramTile = forwardRef((_,ref) => {

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

    // console.log(visible)

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
                    <Stack direction='row' style={{paddingRight:'4px', alignContent:'center', justifyContent:'space-between'}}>
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
                            {isProcessing && (
                                <CircularProgress size={18} variant='indeterminate' color='primaryColor' />
                            )}
                            <IconButton size='small' onClick={() => setViewMode(viewMode === 'default' ? 'program' : 'default')}>
                                {viewMode === 'default' ? <FiMaximize /> : <FiMinimize />}
                            </IconButton>
                            <IconButton size='small' onClick={() => setActiveModal('settings')}>
                                <FiSettings />
                            </IconButton>
                        </Stack>
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