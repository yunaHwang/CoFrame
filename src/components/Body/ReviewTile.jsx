import React from "react";
import { FiTrash2 } from "react-icons/fi";
import { Environment, DATA_TYPES } from 'open-vp';
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
import { memo, useState, useCallback, useRef} from "react";
import { ExpandCarrot } from "../Elements/ExpandCarrot";
import frameStyles from "../../frameStyles";

import { DndProvider } from 'react-dnd';
import { MultiBackend } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { useDrop } from 'react-dnd';
import { TIMELINE_TYPES } from "../../stores/Constants";
import { motion } from "framer-motion";
import { ExternalBlock } from "open-vp";

import { sendFallbackActionsToFlask } from "../../stores/to_flask";

const dropZoneVariants = {
  default: {
    scale: 1,
    opacity: 1,
  },
  hover: {
    scale: 1.02,
    opacity: 0.95,
    transition: { duration: 0.15 },
  },
};

const indicatorVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" }
  },
};

const FallbackDropArea = ({ onDrop, children, highlightColor }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: TIMELINE_TYPES,
    drop: (item, monitor) => {
      if (!monitor.didDrop() && onDrop) {
        onDrop(item); 
      }
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

const FallbackBlock = ({ item, onDelete, highlightColor }) => {
  return (
    <div style={{ position: 'relative' }}>
      <ExternalBlock
        store={useStore}
        data={item.data}
        highlightColor={highlightColor || "#333333"}
      />
      
      {/* The innear delet button not working using a outside block deletion */}
      {onDelete && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            zIndex: 10,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.9)',
            }
          }}
        >
          <FiTrash2 size={14} />
        </IconButton>
      )}
    </div>
  );
};

const UnifiedDropZone = ({ item, itemIndex, onDrop, highlightColor, handleActionRemove, totalItems }) => {
  const theme = useTheme();
  const [dropZone, setDropZone] = useState(null);
  const dropRef = useRef(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: TIMELINE_TYPES,
    drop: (draggedItem, monitor) => {
      //Mouse Calculation grab from open vp
      const rect = dropRef.current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      
      if (rect && clientOffset) {

        const relativeY = clientOffset.y - rect.top;
        const relativeX = clientOffset.x - rect.left;
        
        //Top 30%, middle 40%, bottom 30%, could be changed for more accurate
        const THRESHOLD = 0.3;
        const isTopThird = relativeY < rect.height * THRESHOLD;
        const isBottomThird = relativeY > rect.height * (1 - THRESHOLD);
        
        let dropInfo;
        if (isTopThird) {

          dropInfo = { insertIndex: itemIndex, position: 'above' };
          //console.log('Current index:', itemIndex);
        } else if (isBottomThird) {

          const insertIndex = itemIndex === totalItems - 1 ? totalItems : itemIndex + 1;
          dropInfo = { insertIndex, position: 'below' };
          //console.log('Current index', itemIndex, 'Insertion at', insertIndex);
        } else {

          if (Array.isArray(item)) {

            const itemWidth = rect.width / item.length;
            const actionIndex = Math.floor(relativeX / itemWidth);
            const actionOffset = relativeX % itemWidth;
            const isLeftSide = actionOffset < itemWidth / 2;
            
            dropInfo = { 
              rowIndex: itemIndex,  
              actionIndex: Math.max(0, Math.min(actionIndex, item.length - 1)), 
              position: isLeftSide ? 'left' : 'right' 
            };

          } else {


            const isLeftSide = relativeX < rect.width / 2;
            dropInfo = { 
              rowIndex: itemIndex, 
              actionIndex: 0, 
              position: isLeftSide ? 'left' : 'right' 
            };
          }
        }
        //console.log('----Debug DropInfo', dropInfo, 'itemIndex:', itemIndex);
        onDrop(draggedItem, dropInfo);
      }
      return { dropped: true };
    },

    //Visual Feedback Side From Open-Vp
    hover: (draggedItem, monitor) => { 
      if (!dropRef.current) return;
      const rect = dropRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      
      if (clientOffset) {
        const relativeY = clientOffset.y - rect.top;
        const relativeX = clientOffset.x - rect.left;
        
        // Use same threshold as drop
        const THRESHOLD = 0.3;
        const isTopThird = relativeY < rect.height * THRESHOLD;
        const isBottomThird = relativeY > rect.height * (1 - THRESHOLD);
        
        if (isTopThird) {
          setDropZone('top');
        } else if (isBottomThird) {
          setDropZone('bottom');
        } else {
          const isLeftSide = relativeX < rect.width / 2;
          setDropZone(isLeftSide ? 'left' : 'right');
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [itemIndex, totalItems, item]);

//Added for Clear Indicator
  React.useEffect(() => {
    if (!isOver) setDropZone(null);
  }, [isOver]);

  drop(dropRef);

  return (
    <motion.div
      ref={dropRef}
      variants={dropZoneVariants}
      animate={isOver ? "hover" : "default"}
      style={{ padding: '8px 0' }}
    >
      <Box sx={{ position: 'relative'}}>     
    {[
        { zone: 'top', style: { top: -3, left: 0, right: 0, height: '3px' } },
        { zone: 'bottom', style: { bottom: -3, left: 0, right: 0, height: '3px' } },
        { zone: 'left', style: { left: -3, top: 0, bottom: 0, width: '3px' } },
        { zone: 'right', style: { right: -3, top: 0, bottom: 0, width: '3px' } }
      ].map(({ zone, style }) => (
          <motion.div
            key={zone}
            variants={indicatorVariants}
            animate={dropZone === zone ? 'visible' : 'hidden'}
            style={{
              position: 'absolute',
              backgroundColor: highlightColor,
              borderRadius: '2px',
              zIndex: 10,
              ...style
            }}
          />
        ))}

        {!Array.isArray(item) ? (
          <FallbackBlock
            item={item}
            onDelete={() => handleActionRemove(item.id)}
            highlightColor={highlightColor}
          />
        ) : (
          <Stack direction="row" spacing={0.5} sx={{ minHeight: 40 }}>
            {item.map((action, actionIndex) => (
              <div key={action.id} style={{ flex: 1 }}>
                <FallbackBlock
                  item={action}
                  highlightColor={highlightColor}
                  onDelete={() => handleActionRemove(item.id)}
                />
              </div>
            ))}
          </Stack>
        )}
      </Box>
    </motion.div>
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
    if (fallbackActions.length === 0) return;

    setsubmit(true);
    sendFallbackActionsToFlask(fallbackActions)
    .then(() => console.log("sent to Flask fallbacks"))
    .catch(err => console.error("Flask send error fallbacks", err));

    setTimeout(() => {
      setsubmit(false);
      setShowSuccess(true);
      console.log("Fallback Action Submit", fallbackActions);
    }, 2000);
  };

  //Handle Action Add
const handleActionDrop = useCallback((item, dropInfo = null) => {
    if (item && item.data) {
      console.log("Dropped item:", item);
      console.log("show types, ", item.data.type, item.data.dataType);

      const instanceData = {
          ...item.data,
          isSpawner: false,       // it’s now a real instance
          onCanvas: true,         // let ExternalBlock render sockets
        };

      const defaultUpdateFields =
        item.data.updateFields ??                                      // use instance's updateFields
        item.typeSpec?.properties?.updateFields?.default ?? [];        // or fall back to schema default

      const newAction = {
        id: `action-${Date.now()}`,
        type: instanceData.type,
        name: instanceData.name || instanceData.type,

        data: instanceData,     // <- use the modified copy
        typeSpec: item.typeSpec, // you still need the schema
        updateFields: defaultUpdateFields,
        dataType: instanceData.dataType,   // keep REFERENCE vs INSTANCE
      };

      // const defaultUpdateFields =
      //   item.data.updateFields ??
      //   item.typeSpec?.properties?.updateFields?.default ??
      //   [];

      // const newAction = { 
      //   //Using id as Date just for now, don't sure how to implement the big block inside the fallback
      //   id: `action-${Date.now()}`, 
      //   type: item.data.type,
      //   data: item.data,
      //   typeSpec: item.typeSpec,  
      //   name: item.data.name || item.data.type,
      //   dataType: item.dataType === DATA_TYPES.REFERENCE,
      //   updateFields: defaultUpdateFields
      // };
      console.log("what does this have in terms of attributes, ", newAction.data)

      setFallbackActions(prev => {
        if (!dropInfo) {
          return [...prev, newAction];
        }
        const { insertIndex, position, rowIndex, actionIndex } = dropInfo;

        if (position === 'above' || position === 'below') {
          const newArray = [...prev];
          newArray.splice(insertIndex, 0, newAction);
          return newArray;
        }


        
        if (position === 'left' || position === 'right') {
          const newArray = [...prev];
          const targetItem = newArray[rowIndex];

          // ItemChecks
          if (!Array.isArray(targetItem)) {
            const parallelGroup = [targetItem];
            
            if (position === 'left') {
              parallelGroup.unshift(newAction);
            } else {
              parallelGroup.push(newAction);
            }
            
            newArray[rowIndex] = parallelGroup;
            return newArray;
          }
          

          if (targetItem.length >= 3) {
            //console.log("System Realize FUll ");
            return [...prev, newAction];
          }

          //Left or right Action
          const updatedGroup = [...targetItem];
          if (position === 'left') {
            updatedGroup.splice(actionIndex, 0, newAction);
          } else {
            updatedGroup.splice(actionIndex + 1, 0, newAction);
          }
          
          newArray[rowIndex] = updatedGroup;
          return newArray;
        }
        return [...prev, newAction];
      });

      //console.log("Fallback actions:", fallbackActions);
    }
  }, []);


  // Handle removing an action
  const handleActionRemove = useCallback((id) => {
    setFallbackActions(prev => {
      return prev.map(item => {
        if (!Array.isArray(item)) {
          return item.id === id ? null : item;
        }
        
        const filteredGroup = item.filter(action => action.id !== id);
        
        if (filteredGroup.length === 1) {
          return filteredGroup[0];
        }
        
        if (filteredGroup.length === 0) {
          return null;
        }
        
        return filteredGroup;
      }).filter(item => item !== null); 
    });
  }, []);
  
  return (
    <Paper
      ref={ref}
      sx={{
        width: reviewExpanded ? 500 : 50,
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
                      <Stack spacing={0}>
                        {fallbackActions.map((item, itemIndex) => (
                          <UnifiedDropZone
                            key={Array.isArray(item) ? `group-${itemIndex}` : item.id}
                            item={item}
                            itemIndex={itemIndex}
                            onDrop={handleActionDrop}
                            highlightColor={highlightColor}
                            handleActionRemove={handleActionRemove}
                          />
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
          backgroundColor: '#604652'
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '2.5 rem',color: 'white' }}>
          Your fallback program is safe. You are good to go.
        </Typography>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            // setShowSuccess(false);
            // setFallbackActions([]);

            const skillName = `Skill ${new Date().toLocaleTimeString()}`;
            console.log("do fallbackActions exist, ", fallbackActions);
            useStore.getState().addSkillWithActions(skillName, fallbackActions);
            useStore.getState().performCompileProcess();

            console.log("Newly Created skillName, ", skillName);
            // console.log("So, did this get added to ProgramData, ", programData); <- no this is an error
            const state = useStore.getState();          // grab a snapshot
            //console.log("ProgramData now has keys:", Object.keys(state.programData));
            console.log("Root children:", state.programData[Object.keys(state.programData).find(k => state.programData[k].type === "programType")]?.properties.children);

            setShowSuccess(false);
            setFallbackActions([]);
          }}
          sx={{ minWidth: 100, backgroundColor: "#d29f80", '&:hover': {backgroundColor: "#97866a"}, }}
        >
          Great
        </Button>
      </Paper>
    </Backdrop>
    </Paper>
  );
});