import React, { useState } from "react";


/**
 * Simple 3×3 grid component.
 * Cells are white with a 1 px gray border.
 */
const RobotWorld = () => {
  // You can tweak these numbers to change cell size.
  const CELL_SIZE = 30;

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
        {Array.from({ length: 80 }).map((_, idx) => (
          <div key={idx} style={{ ...cellStyle, height: CELL_SIZE }} />
        ))}
      </div>
    </div>
  );
};

export default RobotWorld;
