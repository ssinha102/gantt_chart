import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../state/store';
import { addDays, diffDays, getTodayStr } from '../../utils/dateUtils';

const CELL_WIDTH = 40; // Pixels per day
const HEADER_HEIGHT = 40;
const ROW_HEIGHT = 56; // Matches the Grid visual height

export const Timeline: React.FC = () => {
  const { doc, updateTask } = useStore();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  // Drag State
  const dragInfo = useRef<{
    startX: number;
    originalStart: string;
    originalEnd: string;
  } | null>(null);

  // Viewport calculation
  const startDate = getTodayStr(); // Ideally from store.doc.view.startDate
  const renderDays = 60; // Render 2 months
  const width = renderDays * CELL_WIDTH;
  const height = (doc.rows.length * ROW_HEIGHT) + HEADER_HEIGHT;

  const handlePointerDown = (e: React.PointerEvent, task: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingId(task.id);
    dragInfo.current = {
      startX: e.clientX,
      originalStart: task.start,
      originalEnd: task.end
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !dragInfo.current) return;
    
    const deltaX = e.clientX - dragInfo.current.startX;
    const deltaDays = Math.round(deltaX / CELL_WIDTH);
    
    if (deltaDays !== 0) {
      const newStart = addDays(dragInfo.current.originalStart, deltaDays);
      const newEnd = addDays(dragInfo.current.originalEnd, deltaDays);
      updateTask(draggingId, { start: newStart, end: newEnd });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggingId(null);
    dragInfo.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div style={{ overflow: 'auto', flex: 1, position: 'relative' }}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        
        {/* 1. Background Grid & Headers */}
        {Array.from({ length: renderDays }).map((_, i) => {
          const x = i * CELL_WIDTH;
          const date = addDays(startDate, i);
          const isWeekStart = new Date(date).getDay() === 1; // Monday
          
          return (
            <g key={i}>
              {/* Vertical Line */}
              <line 
                x1={x} y1={0} x2={x} y2={height} 
                stroke={isWeekStart ? "#ccc" : "#f0f0f0"} 
                strokeWidth={isWeekStart ? 2 : 1} 
              />
              {/* Date Header */}
              <text x={x + 5} y={25} fontSize="10" fill="#666">
                {date.slice(5)} {/* MM-DD */}
              </text>
            </g>
          );
        })}

        {/* 2. Rows (Alternating Backgrounds) */}
        {doc.rows.map((row, i) => (
          <rect
            key={row.id}
            x={0}
            y={HEADER_HEIGHT + (i * ROW_HEIGHT)}
            width={width}
            height={ROW_HEIGHT}
            fill={i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)"}
          />
        ))}

        {/* 3. Tasks (Draggable Bars) */}
        {doc.tasks.map(task => {
          const rowIdx = doc.rows.findIndex(r => r.id === task.rowId);
          if (rowIdx === -1) return null;

          const startOffset = diffDays(task.start, startDate);
          const duration = diffDays(task.end, task.start) + 1;
          
          if (startOffset + duration < 0) return null; // Out of view

          const x = startOffset * CELL_WIDTH;
          const w = Math.max(duration * CELL_WIDTH, 10);
          const y = HEADER_HEIGHT + (rowIdx * ROW_HEIGHT) + 12; // Centered in row

          return (
            <g 
              key={task.id} 
              style={{ cursor: 'grab' }}
              onPointerDown={(e) => handlePointerDown(e, task)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <rect
                x={x}
                y={y}
                width={w}
                height={32}
                rx={4}
                fill={draggingId === task.id ? "#0052cc" : "#3b82f6"}
                opacity={draggingId === task.id ? 0.8 : 1}
              />
              <text x={x + 4} y={y + 20} fontSize="12" fill="white" pointerEvents="none">
                {task.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
