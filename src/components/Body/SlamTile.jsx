import React, { forwardRef, useState } from "react";
import { Box, Typography, Divider, Button } from "@mui/material";

export const SlamTile = forwardRef((props, ref) => {
  const [imageSrc, setImageSrc] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box
      ref={ref}
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {/* Top: Map / image area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Uploaded"
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <Typography variant="h4" color="black">
            SLAM map goes here
          </Typography>
        )}
      </Box>

      {/* Logic for reading yaml and sending yaml values to the backend goes here*/}

      {/* Divider */}
      {/* <Divider sx={{ borderColor: "grey.700" }} /> */}

      {/* Bottom: Upload button */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button variant="contained" component="label">
          Upload Map
          <input type="file" hidden onChange={handleUpload} />
        </Button>
      </Box>
    </Box>
  );
});