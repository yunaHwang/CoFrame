import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import tabula from "../../assets/tabula_map_example.json";
import house from "../../assets/house_grayscale.json";

export default function RobotWorld({ map = house, cellSize = 4, sx = {} }) {
  
    const canvasRef = useRef(null);

    useEffect(() => {
    if (!map || !canvasRef.current) return;

    /* ---------- use real map size ---------- */
    const { width, height, data } = map;     // map JSON
    const canvas = canvasRef.current;
    canvas.width  = width  * cellSize;       // internal bitmap
    canvas.height = height * cellSize;

    const ctx = canvas.getContext("2d");
    const img  = ctx.createImageData(canvas.width, canvas.height);
    const pix  = img.data;

    /* helper */
    const put = (x, y, [r, g, b, a]) => {
      const i = 4 * (y * canvas.width + x);
      pix[i] = r; pix[i + 1] = g; pix[i + 2] = b; pix[i + 3] = a;
    };

    /* colours */
    const WALL  = [  0,   0,   0, 255];
    const FLOOR = [255, 255, 255, 255];
    const VOID  = [ 90,  90,  90, 255];

    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            const colFl = width - c - 1;               // keep X-flip
            const cell  = data[r * width + colFl];
            const col   = cell === 100 ? WALL : cell === -1 ? VOID : FLOOR;
            
            for (let py = 0; py < cellSize; py++) {
                for (let px = 0; px < cellSize; px++) {
                    put(c * cellSize + px, r * cellSize + py, col);
                }
            }
        }
    }
    ctx.putImageData(img, 0, 0);
  }, [map, cellSize]);

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
        <canvas
            ref={canvasRef}
            style={{
            imageRendering: "pixelated",
            display: "block",
            border: "1px solid #666",
            width: "auto",      // responsive fit
            height: "100%",
            alignSelf: "center", // keep centred in the column
            margin: "0 auto",
            }}
        />
    </Box>
  );
}
