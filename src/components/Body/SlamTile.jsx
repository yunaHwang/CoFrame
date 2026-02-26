import React, { forwardRef, useState, useEffect } from "react";
import { Box, Typography, Divider, Button } from "@mui/material";

import { stageMapYaml } from "../../stores/to_flask";

export const SlamTile = forwardRef((props, ref) => {
  const [imageSrc, setImageSrc] = useState(null);

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadedFiles(files);

    // ---- Pick an image file to display ----
    // Prefer map-like names if present; otherwise first image.
    const imageCandidates = files.filter((f) =>
      /\.(png|jpg|jpeg|webp)$/i.test(f.name)
    );

    const preferredImage =
      imageCandidates.find((f) => /map|occupancy|slam/i.test(f.name)) ||
      imageCandidates[0];

    if (preferredImage) {
      console.log("Selected image:", preferredImage.webkitRelativePath || preferredImage.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(preferredImage);
    } else {
      console.warn("No image found in uploaded folder.");
      setImageSrc(null);
    }

    // ---- (Optional) Find and read YAML ----
    const yamlFile =
      files.find((f) => /\.ya?ml$/i.test(f.name) && /map/i.test(f.name)) ||
      files.find((f) => /\.ya?ml$/i.test(f.name));

    if (yamlFile) {
      console.log("Selected YAML:", yamlFile.webkitRelativePath || yamlFile.name);
      const yamlText = await yamlFile.text();
      console.log("YAML contents:\n", yamlText);

      await stageMapYaml(yamlText, {
            yamlName: yamlFile.name,
            yamlRelPath: yamlFile.webkitRelativePath || null,
        });
      // send to backend
    } else {
      console.warn("No YAML file found in uploaded folder.");
    }
  };

  return (
    <Box
      ref={ref}
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Map image fills the full tile height */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Uploaded"
            style={{
              height: "100%",
              width: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        ) : (
          <Typography variant="h4" color="black">
            Add your map here
          </Typography>
        )}
      </Box>

      {/* Upload button floated over the tile — doesn't affect image height */}
      <Box
        sx={{
          position: "absolute",
          bottom: 12,
          right: 12,
        }}
      >
        <Button variant="contained" component="label" size="small">
          Upload Map
          <input
            type="file"
            hidden
            webkitdirectory="true"
            directory="true"
            multiple
            onChange={handleUpload}
          />
        </Button>
      </Box>
    </Box>
  );
});