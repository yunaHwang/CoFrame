import React, { forwardRef, useState, useEffect, useRef } from "react";
import { Box, Typography, Divider, Button } from "@mui/material";

import { stageMapYaml } from "../../stores/to_flask";
import robotImg from "../SimMapFlaticons/ai-technology-robot-cute-design.png";

export const SlamTile = forwardRef((props, ref) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imgNaturalSize, setImgNaturalSize] = useState(null);
  const [containerSize, setContainerSize] = useState(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // robotPos is a fraction [0,1] of the rendered map image
  const [robotPos, setRobotPos] = useState({ x: 0.5, y: 0.5 });

  // Poll Flask /robot_position every second and convert to image fraction
  useEffect(() => {
    const FLASK_URL = import.meta.env.VITE_FLASK_URL || "http://10.136.116.29:5000";

    const poll = async () => {
      try {
        const res = await fetch(`${FLASK_URL}/robot_position`);
        if (!res.ok) return;
        const { x, y, origin_x, origin_y, resolution } = await res.json();

        // Only convert if we have map image dimensions
        if (!imgNaturalSize || resolution <= 0) return;

        const { width: imgW, height: imgH } = imgNaturalSize;

        // Map coordinates → pixel → fraction
        // x increases right, y increases up in ROS map frame
        // image row 0 is the TOP, so y-axis is flipped
        const px = (x - origin_x) / resolution;
        const py = (y - origin_y) / resolution;

        const fx = px / imgW;
        const fy = 1 - (py / imgH);   // flip Y

        // Clamp to [0,1] so icon stays on the image
        setRobotPos({
          x: Math.max(0, Math.min(1, fx)),
          y: Math.max(0, Math.min(1, fy)),
        });
      } catch (_) {
        // backend not reachable — keep last position
      }
    };

    const interval = setInterval(poll, 1000);
    return () => clearInterval(interval);
  }, [imgNaturalSize]);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const getRenderedImageBounds = () => {
    if (!imgNaturalSize || !containerSize) return null;
    const { width: nw, height: nh } = imgNaturalSize;
    const { width: cw, height: ch } = containerSize;
    const scale = Math.min(cw / nw, ch / nh);
    const rw = nw * scale;
    const rh = nh * scale;
    const offsetX = (cw - rw) / 2;
    const offsetY = (ch - rh) / 2;
    return { rw, rh, offsetX, offsetY };
  };

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

  const bounds = getRenderedImageBounds();
  const robotSize = 40;

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
      {/* Map image + robot overlay container */}
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {imageSrc ? (
          <>
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Uploaded map"
              onLoad={(e) => setImgNaturalSize({
                width: e.target.naturalWidth,
                height: e.target.naturalHeight,
              })}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
            {/* Robot overlay — position tracks robotPos fraction on the rendered image */}
            {bounds && (
              <img
                src={robotImg}
                alt="robot"
                style={{
                  position: "absolute",
                  left: bounds.offsetX + robotPos.x * bounds.rw - robotSize / 2,
                  top:  bounds.offsetY + robotPos.y * bounds.rh - robotSize / 2,
                  width:  robotSize,
                  height: robotSize,
                  transition: "left 0.45s ease, top 0.45s ease",
                  pointerEvents: "none",
                  filter: "drop-shadow(1px 2px 4px rgba(0,0,0,0.4))",
                  zIndex: 10,
                }}
              />
            )}
          </>
        ) : (
          <Typography variant="h4" color="black">
            Add your map here
          </Typography>
        )}
      </Box>

      {/* Upload button floated over the tile */}
      <Box sx={{ position: "absolute", bottom: 12, right: 12 }}>
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