import React, { useState } from "react";


/**
 * Simple 3×3 grid component.
 * Cells are white with a 1 px gray border.
 */
const RobotWorld = ({ highlight = [], color = '#e0f0ff' }) => {
  // You can tweak these numbers to change cell size.
  const CELL_SIZE = 30;

  const highlightSet = React.useMemo(() => {
    const pairs = highlight.map((p) => Array.isArray(p) ? p : [p.x, p.y]);
    return new Set(pairs.map(([x, y]) => `${x},${y}`));
  }, [highlight]);

  const pageStyle = {
    minHeight: '40vh',
    width: '100%',
    backgroundColor: '#333333',
  };

  const gridStyle = {
    display: 'grid',
    width: '100%',
    maxWidth: '100%',
    gridTemplateColumns: 'repeat(10, 10%)',
    gridTemplateRows: `repeat(8, ${CELL_SIZE}px)`,
  };

  const cellStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #bbbbbb',
    boxSizing: 'border-box',
  };

  return (
    <div style={pageStyle}>
      <div style={gridStyle}>
        {Array.from({ length: 80 }).map((_, idx) => {

          const x = idx % 10;                  
          const y = 7 - Math.floor(idx / 10);
          const key = `${x},${y}`;
          const isHighlighted = highlightSet.has(key);
          
          return (
          <div key={idx} style={{ ...cellStyle, height: CELL_SIZE, backgroundColor: isHighlighted ? color : '#ffffff',}} data-x={x} data-y={y} >
          ({x},{y})
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default RobotWorld;
