import React, { useState, useRef } from 'react';
import { useStore } from '../../state/store';
import { addDays, diffDays, getTodayStr } from '../../utils/dateUtils';

const CELL_WIDTH = 40; 
const ROW_HEIGHT = 56;
const HEADER_HEIGHT = 40; 
const TIMEBOX_HEIGHT = 30; // Extra height for Sprints/PIs
const RESIZE_HANDLE_WIDTH = 10;

export const Timeline: React.FC = () => {
  const { doc, updateTask } = useStore();
  const showTimeboxes = doc.view.showTimeboxes;
  
  // Calculate vertical offset: If timeboxes are hidden, 0. If shown, 30px.
  const topOffset = showTimeboxes ? TIMEBOX_HEIGHT : 0;
  
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
  const renderDays = 90; 
  const width = renderDays * CELL_WIDTH;
  const height = (doc.rows.length * ROW_HEIGHT) + HEADER_HEIGHT + topOffset;

  const handlePointerDown = (e: React.PointerEvent, task: any, widthPx: number) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left; 
    
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
    
    if (dragState.mode === 'resize-left') {
      const newStart = addDays(dragInfo.current.originalStart, deltaDays);
      if (diffDays(dragInfo.current.originalEnd, newStart) >= 0) {
        updateTask(dragState.id, { start: newStart });
      }
    } 
    else if (dragState.mode === 'resize-right') {
      const newEnd = addDays(dragInfo.current.originalEnd, deltaDays);
      if (diffDays(newEnd, dragInfo.current.originalStart) >= 0) {
        updateTask(dragState.id, { end: newEnd });
      }
    }
    else if (dragState.mode === 'move') {
      if (deltaDays !== 0) {
        const newStart = addDays(dragInfo.current.originalStart, deltaDays);
        const newEnd = addDays(dragInfo.current.originalEnd, deltaDays);
        updateTask(dragState.id, { start: newStart, end: newEnd });
      }

      const svgRect = svgRef.current.getBoundingClientRect();
      // Adjust for the new topOffset when calculating row drop
      const relativeY = e.clientY - svgRect.top - HEADER_HEIGHT - topOffset;
      const rowIdx = Math.floor(relativeY / ROW_HEIGHT);
      
      if (rowIdx >= 0 && rowIdx < doc.rows.length) {
        const targetRowId = doc.rows[rowIdx].id;
        if (targetRowId !== doc.tasks.find(t => t.id === dragState.id)?.rowId) {
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

  return (
    <div style={{ overflow: 'auto', flex: 1, position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }}>
        
        {/* 0. Timebox Bands (Rendered at top if visible) */}
        {showTimeboxes && doc.timeboxes && doc.timeboxes.map(tb => {
           const startOffset = diffDays(tb.start, startDate);
           const duration = diffDays(tb.end, tb.start) + 1;
           if (startOffset + duration < 0) return null;
           
           const x = startOffset * CELL_WIDTH;
           const w = Math.max(duration * CELL_WIDTH, 10);
           const isPi = tb.type === 'pi';

           return (
             <g key={tb.id}>
               <rect 
                 x={x} y={0} width={w} height={TIMEBOX_HEIGHT} 
                 fill={isPi ? "#f3e5f5" : "#e3f2fd"} // Purple for PI, Blue for Sprint
                 stroke={isPi ? "#9c27b0" : "#2196f3"}
                 strokeWidth={1}
               />
               <text x={x + 5} y={20} fontSize="11" fill={isPi ? "#6a1b9a" : "#1565c0"} fontWeight="bold">
                 {tb.name}
               </text>
             </g>
           )
        })}

        {/* 1. Background Grid & Headers (Shifted down by topOffset) */}
        <g transform={`translate(0, ${topOffset})`}>
            {Array.from({ length: renderDays }).map((_, i) => {
              const x = i * CELL_WIDTH;
              const date = addDays(startDate, i);
              const isWeekStart = new Date(date).getDay() === 1;
              return (
                <g key={i}>
                  <line x1={x} y1={0} x2={x} y2={height - topOffset} stroke={isWeekStart ? "#ccc" : "#f0f0f0"} strokeWidth={isWeekStart ? 2 : 1} />
                  <text x={x + 5} y={25} fontSize="10" fill="#666">{date.slice(5)}</text>
                </g>
              );
            })}

            {/* 2. Rows */}
            {doc.rows.map((row, i) => (
              <rect key={row.id} x={0} y={HEADER_HEIGHT + (i * ROW_HEIGHT)} width={width} height={ROW_HEIGHT} fill={i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)"} />
            ))}

            {/* 3. Tasks */}
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
                  <rect width={w} height={32} rx={4} fill={isDragging ? "#0052cc" : "#3b82f6"} opacity={isDragging ? 0.9 : 1} />
                  <text x={4} y={20} fontSize="12" fill="white" pointerEvents="none" style={{ userSelect: 'none' }}>{task.name}</text>
                  <rect x={0} y={0} width={RESIZE_HANDLE_WIDTH} height={32} fill="transparent" style={{ cursor: 'ew-resize' }} />
                  <rect x={w - RESIZE_HANDLE_WIDTH} y={0} width={RESIZE_HANDLE_WIDTH} height={32} fill="transparent" style={{ cursor: 'ew-resize' }} />
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
};
