import React, { useState, useRef } from 'react';
import { useStore } from '../../state/store';
import { addDays, diffDays, getTodayStr } from '../../utils/dateUtils';

const CELL_WIDTH = 40; 
const HEADER_HEIGHT = 40;
const ROW_HEIGHT = 56;
const RESIZE_HANDLE_WIDTH = 10; // Pixel width for resize zones

export const Timeline: React.FC = () => {
  const { doc, updateTask } = useStore();
  
  // Track what we are dragging and how
  const [dragState, setDragState] = useState<{
    id: string;
    mode: 'move' | 'resize-left' | 'resize-right';
  } | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const dragInfo = useRef<{
    startX: number;
    originalStart: string;
    originalEnd: string;
    originalRowId: string;
  } | null>(null);

  const startDate = getTodayStr(); 
  const renderDays = 60; 
  const width = renderDays * CELL_WIDTH;
  const height = (doc.rows.length * ROW_HEIGHT) + HEADER_HEIGHT;

  const handlePointerDown = (e: React.PointerEvent, task: any, widthPx: number) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();

    // Determine Mode: Left edge? Right edge? or Middle (Move)?
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left; // X relative to the bar
    
    let mode: 'move' | 'resize-left' | 'resize-right' = 'move';
    if (clickX < RESIZE_HANDLE_WIDTH) mode = 'resize-left';
    else if (clickX > widthPx - RESIZE_HANDLE_WIDTH) mode = 'resize-right';

    setDragState({ id: task.id, mode });
    
    dragInfo.current = {
      startX: e.clientX,
      originalStart: task.start,
      originalEnd: task.end,
      originalRowId: task.rowId
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState || !dragInfo.current || !svgRef.current) return;
    
    const deltaX = e.clientX - dragInfo.current.startX;
    const deltaDays = Math.round(deltaX / CELL_WIDTH);
    
    // 1. Handle Resizing
    if (dragState.mode === 'resize-left') {
      const newStart = addDays(dragInfo.current.originalStart, deltaDays);
      // Prevent start > end
      if (diffDays(dragInfo.current.originalEnd, newStart) >= 0) {
        updateTask(dragState.id, { start: newStart });
      }
    } 
    else if (dragState.mode === 'resize-right') {
      const newEnd = addDays(dragInfo.current.originalEnd, deltaDays);
      // Prevent end < start
      if (diffDays(newEnd, dragInfo.current.originalStart) >= 0) {
        updateTask(dragState.id, { end: newEnd });
      }
    }
    // 2. Handle Moving (Both Dates and Row)
    else if (dragState.mode === 'move') {
      // Date Move
      if (deltaDays !== 0) {
        const newStart = addDays(dragInfo.current.originalStart, deltaDays);
        const newEnd = addDays(dragInfo.current.originalEnd, deltaDays);
        updateTask(dragState.id, { start: newStart, end: newEnd });
      }

      // Row Move calculation
      const svgRect = svgRef.current.getBoundingClientRect();
      const relativeY = e.clientY - svgRect.top - HEADER_HEIGHT;
      const rowIdx = Math.floor(relativeY / ROW_HEIGHT);
      
      // Ensure row is valid
      if (rowIdx >= 0 && rowIdx < doc.rows.length) {
        const targetRowId = doc.rows[rowIdx].id;
        if (targetRowId !== taskForId(dragState.id)?.rowId) {
           updateTask(dragState.id, { rowId: targetRowId });
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragState(null);
    dragInfo.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Helper to get task for Row Move check
  const taskForId = (id: string) => doc.tasks.find(t => t.id === id);

  return (
    <div style={{ overflow: 'auto', flex: 1, position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }}>
        
        {/* Background Grid */}
        {Array.from({ length: renderDays }).map((_, i) => {
          const x = i * CELL_WIDTH;
          const date = addDays(startDate, i);
          const isWeekStart = new Date(date).getDay() === 1;
          return (
            <g key={i}>
              <line x1={x} y1={0} x2={x} y2={height} stroke={isWeekStart ? "#ccc" : "#f0f0f0"} strokeWidth={isWeekStart ? 2 : 1} />
              <text x={x + 5} y={25} fontSize="10" fill="#666">{date.slice(5)}</text>
            </g>
          );
        })}

        {/* Rows */}
        {doc.rows.map((row, i) => (
          <rect key={row.id} x={0} y={HEADER_HEIGHT + (i * ROW_HEIGHT)} width={width} height={ROW_HEIGHT} fill={i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)"} />
        ))}

        {/* Tasks */}
        {doc.tasks.map(task => {
          const rowIdx = doc.rows.findIndex(r => r.id === task.rowId);
          if (rowIdx === -1) return null;

          const startOffset = diffDays(task.start, startDate);
          const duration = diffDays(task.end, task.start) + 1;
          if (startOffset + duration < 0) return null;

          const x = startOffset * CELL_WIDTH;
          const w = Math.max(duration * CELL_WIDTH, 10);
          const y = HEADER_HEIGHT + (rowIdx * ROW_HEIGHT) + 12;

          const isDragging = dragState?.id === task.id;
          const cursor = isDragging ? 'grabbing' : 'grab';

          return (
            <g 
              key={task.id} 
              transform={`translate(${x}, ${y})`}
              style={{ cursor }}
              onPointerDown={(e) => handlePointerDown(e, task, w)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Main Bar */}
              <rect
                width={w} height={32} rx={4}
                fill={isDragging ? "#0052cc" : "#3b82f6"}
                opacity={isDragging ? 0.9 : 1}
              />
              {/* Label */}
              <text x={4} y={20} fontSize="12" fill="white" pointerEvents="none" style={{ userSelect: 'none' }}>
                {task.name}
              </text>
              
              {/* Resize Handles (Invisible hit zones) */}
              <rect x={0} y={0} width={RESIZE_HANDLE_WIDTH} height={32} fill="transparent" style={{ cursor: 'ew-resize' }} />
              <rect x={w - RESIZE_HANDLE_WIDTH} y={0} width={RESIZE_HANDLE_WIDTH} height={32} fill="transparent" style={{ cursor: 'ew-resize' }} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
