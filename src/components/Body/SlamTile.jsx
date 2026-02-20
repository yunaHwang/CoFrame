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
      }}
    >
      {/* Top: Map / image area */}
      <Box
        sx={{
          flex: 1,
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
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        ) : (
          <Typography variant="h4" color="black">
            SLAM map goes here
          </Typography>
        )}
      </Box>

      {/* Divider */}
      <Divider sx={{ borderColor: "grey.700" }} />

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