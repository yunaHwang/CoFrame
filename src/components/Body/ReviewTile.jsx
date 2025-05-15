import React from "react";
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
  CircularProgress
} from "@mui/material";
import { memo, useState } from "react";
import { ExpandCarrot } from "../Elements/ExpandCarrot";
import frameStyles from "../../frameStyles";


export const ReviewTile = memo(({ drawerOpen, fallbackMode }) => {

  const [ref, bounds] = useMeasure();
  const [submit, setsubmit] = useState(false);

  const [reviewExpanded, setReviewExpanded] = useStore(
    (state) => [state.reviewExpanded, state.setReviewExpanded],
    shallow
  );

  //PlaceHolder fot Submit Button
  const handleSubmit = () => {
    setsubmit(true);
    setTimeout(() => {
      setsubmit(false);
      console.log("Fallback Action Submit");
    }, 2000);
  };


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
            <Box component="section" sx={{ p: 2, border: '1px dashed grey' }}>
              This box is a placeholder for Add and Drop
            </Box>
          </ScrollRegion>

          <Button
            variant="contained"
            sx={{
              mt: 1,
              backgroundColor: '#629e6c',
              '&:hover': {
                backgroundColor: '#3a5e40',
              }
            }}
            fullWidth
            onClick={handleSubmit}
          >
            Submit
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

    </Paper>
  );
});
