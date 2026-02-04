import React, { useState, useRef } from 'react';
import { useStore } from '../../state/store';
import { addDays, diffDays, getTodayStr } from '../../utils/dateUtils';

const CELL_WIDTH = 40; 
const HEADER_HEIGHT = 40; 
const TIMEBOX_HEIGHT = 30; 
const RESIZE_HANDLE_WIDTH = 10;

// Grid layout constants (Must roughly match DebugList.tsx styling)
const GRID_ROW_HEADER_H = 60; // Title + padding
const GRID_TASK_H = 140;      // Height of one task card in the grid
const GRID_ROW_FOOTER_H = 50; // Add Task button area

export const Timeline: React.FC = () => {
  const { doc, updateTask, reorderTask } = useStore();
  const showTimeboxes = doc.view.showTimeboxes;
  const topOffset = showTimeboxes ? TIMEBOX_HEIGHT : 0;
  
  const [dragState, setDragState] = useState<{ id: string; mode: 'move' | 'resize-left' | 'resize-right' } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragInfo = useRef<{ startX: number; originalStart: string; originalEnd: string; originalRowId: string } | null>(null);

  const startDate = getTodayStr(); 

  // 1. Pre-calculate layout (Y positions) for every row and task
  let currentY = 0;
  const rowLayouts = doc.rows.map(row => {
    const rowY = currentY;
    const rowTasks = doc.tasks.filter(t => t.rowId === row.id);
    
    // Header space
    currentY += GRID_ROW_HEADER_H;
    
    // Task tracks
    const taskLayouts = rowTasks.map((task, index) => {
      const taskY = currentY;
      currentY += GRID_TASK_H;
      return { taskId: task.id, y: taskY, index };
    });
    
    // Footer space
    currentY += GRID_ROW_FOOTER_H;
    
    const height = currentY - rowY;
    
    // Add margin between rows
    currentY += 24; 

    return { rowId: row.id, y: rowY, height, tasks: taskLayouts };
  });

  // Dynamic Width Calculation
  let maxDays = 90; 
  if (doc.tasks.length > 0) {
    const latestDate = doc.tasks.reduce((latest, task) => task.end > latest ? task.end : latest, startDate);
    const daysNeeded = diffDays(latestDate, startDate) + 30;
    maxDays = Math.max(maxDays, daysNeeded);
  }
  
  const renderDays = maxDays;
  const width = renderDays * CELL_WIDTH;
  const height = Math.max(currentY + HEADER_HEIGHT + topOffset, 600); 

  const handlePointerDown = (e: React.PointerEvent, task: any, widthPx: number) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left; 
    let mode: 'move' | 'resize-left' | 'resize-right' = 'move';
    if (clickX < RESIZE_HANDLE_WIDTH) mode = 'resize-left';
    else if (clickX > widthPx - RESIZE_HANDLE_WIDTH) mode = 'resize-right';
    setDragState({ id: task.id, mode });
    dragInfo.current = { startX: e.clientX, originalStart: task.start, originalEnd: task.end, originalRowId: task.rowId };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState || !dragInfo.current || !svgRef.current) return;
    const deltaX = e.clientX - dragInfo.current.startX;
    const deltaDays = Math.round(deltaX / CELL_WIDTH);
    
    if (dragState.mode === 'resize-left') {
      const newStart = addDays(dragInfo.current.originalStart, deltaDays);
      if (diffDays(dragInfo.current.originalEnd, newStart) >= 0) updateTask(dragState.id, { start: newStart });
    } else if (dragState.mode === 'resize-right') {
      const newEnd = addDays(dragInfo.current.originalEnd, deltaDays);
      if (diffDays(newEnd, dragInfo.current.originalStart) >= 0) updateTask(dragState.id, { end: newEnd });
    } else if (dragState.mode === 'move') {
      // 1. Horizontal Date Move
      if (deltaDays !== 0) {
        const newStart = addDays(dragInfo.current.originalStart, deltaDays);
        const newEnd = addDays(dragInfo.current.originalEnd, deltaDays);
        updateTask(dragState.id, { start: newStart, end: newEnd });
      }
      
      // 2. Vertical Row/Index Move (Reorder)
      const svgRect = svgRef.current.getBoundingClientRect();
      const relativeY = e.clientY - svgRect.top - HEADER_HEIGHT - topOffset;
      
      const targetRow = rowLayouts.find(r => relativeY >= r.y && relativeY < (r.y + r.height));
      
      if (targetRow) {
        // Calculate which index in this row we are hovering over
        const internalY = relativeY - targetRow.y - GRID_ROW_HEADER_H;
        // Clamp index to valid range
        const rawIndex = Math.floor(internalY / GRID_TASK_H);
        const currentTasksInRow = doc.tasks.filter(t => t.rowId === targetRow.rowId);
        
        // Ensure index is within bounds (0 to length)
        let targetIndex = Math.max(0, rawIndex);
        if (targetIndex > currentTasksInRow.length) targetIndex = currentTasksInRow.length;

        const currentTask = doc.tasks.find(t => t.id === dragState.id);

        // Check if we actually need to change anything to avoid jitter
        if (currentTask && (currentTask.rowId !== targetRow.rowId || getTaskIndex(currentTask) !== targetIndex)) {
             reorderTask(dragState.id, targetRow.rowId, targetIndex);
        }
      }
    }
  };

  // Helper to find current index of a task
  const getTaskIndex = (task: any) => {
      const tasksInRow = doc.tasks.filter(t => t.rowId === task.rowId);
      return tasksInRow.findIndex(t => t.id === task.id);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragState(null);
    dragInfo.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div id="timeline-container" style={{ overflow: 'auto', flex: 1, position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }}>
        {showTimeboxes && doc.timeboxes && doc.timeboxes.map(tb => {
           const startOffset = diffDays(tb.start, startDate);
           const duration = diffDays(tb.end, tb.start) + 1;
           if (startOffset + duration < 0) return null;
           const x = startOffset * CELL_WIDTH;
           const w = Math.max(duration * CELL_WIDTH, 10);
           const isPi = tb.type === 'pi';
           return (
             <g key={tb.id}>
               <rect x={x} y={0} width={w} height={TIMEBOX_HEIGHT} fill={isPi ? "#f3e5f5" : "#e3f2fd"} stroke={isPi ? "#9c27b0" : "#2196f3"} strokeWidth={1} />
               <text x={x + 5} y={20} fontSize="11" fill={isPi ? "#6a1b9a" : "#1565c0"} fontWeight="bold">{tb.name}</text>
             </g>
           )
        })}
        <g transform={`translate(0, ${topOffset})`}>
            {/* Grid Lines */}
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
            
            {/* Rows Backgrounds */}
            {rowLayouts.map((layout, i) => (
              <rect 
                key={layout.rowId} 
                x={0} 
                y={HEADER_HEIGHT + layout.y} 
                width={width} 
                height={layout.height} 
                fill={i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)"} 
                stroke="#f0f0f0"
              />
            ))}

            {/* Tasks */}
            {doc.tasks.map(task => {
              const rLayout = rowLayouts.find(r => r.rowId === task.rowId);
              if (!rLayout) return null;
              const tLayout = rLayout.tasks.find(t => t.taskId === task.id);
              if (!tLayout) return null;

              const startOffset = diffDays(task.start, startDate);
              const duration = diffDays(task.end, task.start) + 1;
              if (startOffset + duration < 0) return null;
              
              const x = startOffset * CELL_WIDTH;
              const w = Math.max(duration * CELL_WIDTH, 10);
              const y = HEADER_HEIGHT + tLayout.y + 40; 

              const isDragging = dragState?.id === task.id;
              const cursor = isDragging ? 'grabbing' : 'grab';
              let barColor = isDragging ? "#0052cc" : "#3b82f6";
              if (task.status === 'done') barColor = "#36b37e"; 
              if (task.status === 'blocked') barColor = "#ff5630"; 
              if (task.status === 'in-progress') barColor = "#ffab00"; 
              
              return (
                <g key={task.id} transform={`translate(${x}, ${y})`} style={{ cursor }} onPointerDown={(e) => handlePointerDown(e, task, w)} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
                  <rect width={w} height={32} rx={4} fill={barColor} opacity={isDragging ? 0.9 : 1} />
                  <text x={4} y={20} fontSize="12" fill="white" pointerEvents="none" style={{ userSelect: 'none' }}>{task.name} {task.owner ? `(${task.owner})` : ''}</text>
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
