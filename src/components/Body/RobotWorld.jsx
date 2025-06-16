import React from "react";
import { Box, Typography } from "@mui/material";

/**
 * A simple header bar that says “Hello World”.
 * Replace its content later with whatever you need.
 */
export default function RobotWorld({ sx = {} }) {
  return (
    <Box
      sx={{
        backgroundColor: "#333",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",   // fills the height given by the parent
        ...sx,            // allow overrides from parent
      }}
    >
      <Typography variant="h6">Hello World</Typography>
    </Box>
  );
}
