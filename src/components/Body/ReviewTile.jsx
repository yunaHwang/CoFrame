import React from "react";
import { FiTrash2 } from "react-icons/fi";
import { Environment } from 'open-vp';
import { FiAlertCircle, FiCheckCircle, FiRefreshCcw, FiRefreshCw } from "react-icons/fi";
import useStore from "../../stores/Store";
import { shallow } from "zustand/shallow";
import { ReviewSection } from "../Review/ReviewSection";
import useMeasure from "react-use-measure";
import { FrameTabBar } from "../FrameTabBar";
import { ScrollRegion } from "../Elements/ScrollRegion";
import { stringEquality } from "../../helpers/performance";
import {
  Button,
  Stack,
  Paper,
  Badge,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Dialog,
  DialogContent,
  CircularProgress,
  Alert,
  AlertTitle,
  Snackbar,
  Backdrop
} from "@mui/material";
import { createTheme, useTheme } from '@mui/material/styles';
import { memo, useState, useCallback } from "react";
import { ExpandCarrot } from "../Elements/ExpandCarrot";
import frameStyles from "../../frameStyles";

import { DndProvider } from 'react-dnd';
import { MultiBackend } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { useDrop } from 'react-dnd';
import { TIMELINE_TYPES } from "../../stores/Constants";

const FallbackDropArea = ({ onDrop, children, highlightColor }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: TIMELINE_TYPES,
    drop: (item) => {
      if (onDrop) onDrop(item);
      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const isActive = isOver && canDrop;

  return (
    <div
      ref={drop}
      style={{
        backgroundColor: isActive ? '#333' : '#1a1a1a',
        border: `1px dashed ${isActive ? highlightColor : '#666'}`,
        borderRadius: '4px',
        padding: '12px',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: children ? 'flex-start' : 'center',
      }}
    >
      {children || (
        <Typography variant="body2" sx={{ color: '#999', textAlign: 'center' }}>
          Drag Actions Here
        </Typography>
      )}
    </div>
  );
};

export const ReviewTile = memo(({ drawerOpen, fallbackMode }) => {

  const highlightColor = useStore(state => state.primaryColor,shallow);
  const [ref, bounds] = useMeasure();
  const [submit, setsubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [reviewExpanded, setReviewExpanded] = useStore(
    (state) => [state.reviewExpanded, state.setReviewExpanded],
    shallow
  );

  //Where action are suppose to be holding at
  const [fallbackActions, setFallbackActions] = useState([]);

  //PlaceHolder fot Submit Button
  const handleSubmit = () => {
    setsubmit(true);
    setTimeout(() => {
      setsubmit(false);
      setShowSuccess(true);
      setFallbackActions([]);
      console.log("Fallback Action Submit", fallbackActions);
    }, 2000);
  };

  //Handle Action Add
  const handleActionDrop = useCallback((item) => {
    if (item && item.data) {

      console.log("Dropped item received:", item);

      setFallbackActions(prev => [...prev, { 
        id: `action-${Date.now()}`, 
        type: item.data.type,
        data: item.data,
        name: item.data.name || item.data.type 
      }]);

      console.log("Dropped item received:", fallbackActions);
    }
  }, []);

  // Handle removing an action
  const handleActionRemove = useCallback((id) => {
    setFallbackActions(prev => prev.filter(action => action.id !== id));
  }, []);
  


  return (
    <Paper
      ref={ref}
      sx={{
        width: reviewExpanded ? 300 : 50,
        borderRadius: 0,
        padding: "5px",
        backgroundColor: "black",
      }}
      elevation={0}
    >
      <Stack
        direction={reviewExpanded ? "row" : "column"}
        alignItems={reviewExpanded ? 'flex-start' : "center"}
        justifyContent="center"
        style={{ marginBottom: reviewExpanded ? 5 : 0 }}
      >
        <span>
          <IconButton
            onClick={() => {
              setReviewExpanded(!reviewExpanded);
            }}
          >
            <ExpandCarrot expanded={reviewExpanded} flip fontSize={20} />
          </IconButton>
        </span>
      </Stack>

      {reviewExpanded && fallbackMode && (
        <>
          <Typography variant="subtitle1" sx={{ color: "white", textAlign: "center", mb: 1 }}>
            Fallback Program
          </Typography>

          <ScrollRegion
            vertical
            height={`calc(${bounds.height - 130}px - ${drawerOpen ? "20vh" : "0vh"
              })`}
          >
            <DndProvider backend={MultiBackend} options={HTML5toTouch}>
              <Stack>
                <Box>
                  <FallbackDropArea 
                    onDrop={handleActionDrop} 
                    highlightColor={highlightColor}
                  >
                    {fallbackActions.length > 0 && (
                      <Stack>
                        {/* Setting a Place holder for the object Still trying to figure out how to appear like the action*/}
                        {fallbackActions.map((action) => (
                          <Box
                            key={action.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1,
                              borderRadius: 1,
                              border: `1px solid ${highlightColor}`,
                              position: 'relative'
                            }}
                          >
                            <Box/>
                            <Typography sx={{ color: 'white'}}>{action.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleActionRemove(action.id)}
                              sx={{ color: 'white' }}
                            >
                              <FiTrash2 size={16} />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </FallbackDropArea>
                </Box>
              </Stack>
            </DndProvider>
          </ScrollRegion>

          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={fallbackActions.length === 0 || submitting}
          >
            Submit Your Action
          </Button>
        </>
      )}

      
      <Dialog open={submit} onClose={() => {}}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <CircularProgress/>
            <Typography>
              Reviewing your fallback actions
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.modal + 1
      }}
      open={showSuccess}
    >
      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          borderRadius: 2,
          minWidth: 300,
          textAlign: 'center',
          backgroundColor: '#E0FFFF'
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '2.5 rem',color: 'black' }}>
          Your fallback program is safe. You are good to go.
        </Typography>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            setShowSuccess(false);
            setFallbackActions([]);
          }}
          sx={{ minWidth: 100 }}
        >
          Great
        </Button>
      </Paper>
    </Backdrop>
    </Paper>
  );
});