import React, { useState, useEffect } from "react";


const RobotWorld = ({ highlight = [], color = '#e0f0ff', icons = {}, labelsOverGrid = [], sourceInfo_to_pass = null, }) => {
  const [robotCoord, setRobotCoord] = useState(() => {
    const robotEntry = Object.entries(icons).find(([k, v]) => typeof v === 'string' && v.includes('robot'));
    console.log("what is robotEntry, ",robotEntry);
    if (robotEntry) {
      const [x, y] = robotEntry[0].split(',').map(Number);
      return { x, y };
    }
    return null;
  });

  useEffect(() => {
    console.log("is sourceInfo being passed, ",sourceInfo_to_pass);
    if (sourceInfo_to_pass?.data?.name === 'Move Forward' && robotCoord) {
      console.log("does this hit Move Forward ");
      const newX = Math.min(robotCoord.x + 1, 9);
      setRobotCoord({ x: newX, y: robotCoord.y });
    }
  }, [sourceInfo_to_pass]);

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

  const coordStyle = {
    fontSize: 10,
    color: '#666',
  };

  const labelStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 14,
    color: '#999',
    opacity: 0.6,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 1,
  };

  const overlayLabelStyle = (from, to) => {
    const [x1, y1] = from;
    const [x2, y2] = to;
    const left = `${(Math.min(x1, x2) * 10)}%`;
    const width = `${(Math.abs(x2 - x1) + 1) * 10}%`;
    const top = `${(7 - Math.max(y1, y2)) * CELL_SIZE}px`;
    const height = `${(Math.abs(y2 - y1) + 1) * CELL_SIZE}px`;
    return {
      position: 'absolute',
      left,
      top,
      width,
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#999',
      opacity: 0.5,
      fontSize: 16,
      pointerEvents: 'none',
      zIndex: 5,
    };
  };

  const iconStyle = {
    width: '80%',
    height: '80%',
    objectFit: 'contain',
    pointerEvents: 'none',
  };

  return (
    <div style={pageStyle}>
      {labelsOverGrid.map(({ text, from, to }, i) => (
        <div key={i} style={overlayLabelStyle(from, to)}>
          {text}
        </div>
      ))}

      <div style={gridStyle}>
        {Array.from({ length: 80 }).map((_, idx) => {

          const x = idx % 10;                  
          const y = 7 - Math.floor(idx / 10);
          const key = `${x},${y}`;
          const isHighlighted = highlightSet.has(key);
          const iconSrcOrNode =
            robotCoord && robotCoord.x === x && robotCoord.y === y
              ? Object.values(icons).find((v) => typeof v === 'string' && v.includes('robot'))
              : icons[key];
          const labelText = labelsOverGrid[key];
          
          return (
          <div key={idx} 
          style={{ ...cellStyle, height: CELL_SIZE, 
                  backgroundColor: isHighlighted ? color : '#ffffff',}} 
                  data-x={x} data-y={y} >
          <span style={coordStyle}>({x},{y})</span>
          {labelText && <span style={labelStyle}>{labelText}</span>}
          {iconSrcOrNode && (
                typeof iconSrcOrNode === 'string' ? (
                  <img src={iconSrcOrNode} alt="icon" style={iconStyle} />
                ) : (
                  <span style={iconStyle}>{iconSrcOrNode}</span>
                )
              )}
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default RobotWorld;
