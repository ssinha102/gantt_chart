import React, { useState, useRef } from 'react';
import { useStore } from '../../state/store';
import { addDays, diffDays, getTodayStr } from '../../utils/dateUtils';

const CELL_WIDTH = 40; 
const HEADER_HEIGHT = 10; 
const TIMEBOX_HEIGHT = 30; 
const RESIZE_HANDLE_WIDTH = 5; 

// LAYOUT CONSTANTS (UPDATED)
const GRID_ROW_HEADER_H = 40; 
const GRID_TASK_H = 120;      // INCREASED: Matches Grid Editor Height
const GRID_ROW_FOOTER_H = 36; // Matches Grid Footer

export const Timeline: React.FC = () => {
  const { doc, updateTask, reorderTask } = useStore();
  const showTimeboxes = doc.view.showTimeboxes;
  const collapsedIds = doc.view.collapsedRowIds || [];
  const topOffset = showTimeboxes ? TIMEBOX_HEIGHT : 0;
  
  const [dragState, setDragState] = useState<{ id: string; mode: 'move' | 'resize-left' | 'resize-right' } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragInfo = useRef<{ startX: number; originalStart: string; originalEnd: string; originalRowId: string } | null>(null);

  const startDate = getTodayStr(); 

  // 1. Layout Calculation
  let currentY = 0;
  const rowLayouts = doc.rows.map(row => {
    const rowY = currentY;
    const isCollapsed = collapsedIds.includes(row.id);
    const rowTasks = doc.tasks.filter(t => t.rowId === row.id);
    
    currentY += GRID_ROW_HEADER_H;
    
    let taskLayouts: any[] = [];
    if (!isCollapsed) {
      taskLayouts = rowTasks.map((task, index) => {
        const taskY = currentY;
        currentY += GRID_TASK_H;
        return { taskId: task.id, y: taskY, index };
      });
      currentY += GRID_ROW_FOOTER_H;
    }
    
    const height = currentY - rowY;
    currentY += 10; // Margin

    return { rowId: row.id, y: rowY, height, tasks: taskLayouts, isCollapsed };
  });

  // 2. Width Calculation
  let maxDays = 90; 
  if (doc.tasks.length > 0) {
    const latestDate = doc.tasks.reduce((latest, task) => task.end > latest ? task.end : latest, startDate);
    const daysNeeded = diffDays(latestDate, startDate) + 30;
    maxDays = Math.max(maxDays, daysNeeded);
  }
  const renderDays = maxDays;
  const width = renderDays * CELL_WIDTH;
  const height = Math.max(currentY + HEADER_HEIGHT + topOffset, 600); 

  // 3. Interactions
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
      if (deltaDays !== 0) {
        const newStart = addDays(dragInfo.current.originalStart, deltaDays);
        const newEnd = addDays(dragInfo.current.originalEnd, deltaDays);
        updateTask(dragState.id, { start: newStart, end: newEnd });
      }
      
      const svgRect = svgRef.current.getBoundingClientRect();
      const relativeY = e.clientY - svgRect.top - HEADER_HEIGHT - topOffset;
      const targetRow = rowLayouts.find(r => relativeY >= r.y && relativeY < (r.y + r.height));
      
      if (targetRow && !targetRow.isCollapsed) { 
        const internalY = relativeY - targetRow.y - GRID_ROW_HEADER_H;
        const rawIndex = Math.floor(internalY / GRID_TASK_H);
        const currentTasksInRow = doc.tasks.filter(t => t.rowId === targetRow.rowId);
        let targetIndex = Math.max(0, rawIndex);
        if (targetIndex > currentTasksInRow.length) targetIndex = currentTasksInRow.length;

        const currentTask = doc.tasks.find(t => t.id === dragState.id);
        if (currentTask && (currentTask.rowId !== targetRow.rowId || getTaskIndex(currentTask) !== targetIndex)) {
             reorderTask(dragState.id, targetRow.rowId, targetIndex);
        }
      }
    }
  };

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
        {/* Timeboxes */}
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
            {/* Rows Backgrounds */}
            {rowLayouts.map((layout, i) => (
              <rect 
                key={layout.rowId} 
                x={0} 
                y={HEADER_HEIGHT + layout.y} 
                width={width} 
                height={layout.height} 
                fill={i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)"} 
              />
            ))}

            {/* Tasks Bubbles */}
            {doc.tasks.map(task => {
              const rLayout = rowLayouts.find(r => r.rowId === task.rowId);
              if (!rLayout || rLayout.isCollapsed) return null;
              
              const tLayout = rLayout.tasks.find(t => t.taskId === task.id);
              if (!tLayout) return null;

              const startOffset = diffDays(task.start, startDate);
              const duration = diffDays(task.end, task.start) + 1;
              if (startOffset + duration < 0) return null;
              
              const x = startOffset * CELL_WIDTH;
              const w = Math.max(duration * CELL_WIDTH, 10);
              
              const isHovered = hoveredId === task.id;
              const isDragging = dragState?.id === task.id;
              
              // Bubble Size:
              // Standard: 90px (Fits nicely in 120px track with padding)
              const bubbleHeight = 90; 
              // Hover Popover: 120px (Slightly larger to show link info clearly)
              const displayHeight = isHovered && !isDragging ? 110 : bubbleHeight;

              const y = HEADER_HEIGHT + tLayout.y + ((GRID_TASK_H - bubbleHeight) / 2); 

              let statusColor = "#3b82f6"; 
              if (task.status === 'done') statusColor = "#36b37e"; 
              if (task.status === 'blocked') statusColor = "#ff5630"; 
              if (task.status === 'in-progress') statusColor = "#ffab00"; 

              const cursor = isDragging ? 'grabbing' : 'grab';
              
              return (
                <g 
                  key={task.id} 
                  transform={`translate(${x}, ${y})`} 
                  style={{ cursor, zIndex: isHovered ? 999 : 1 }} 
                  onPointerDown={(e) => handlePointerDown(e, task, w)} 
                  onPointerMove={handlePointerMove} 
                  onPointerUp={handlePointerUp}
                  onMouseEnter={() => setHoveredId(task.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Card Background */}
                  <rect 
                    width={w} 
                    height={displayHeight} 
                    rx={4} 
                    fill="white" 
                    stroke="#dfe1e6"
                    strokeWidth={1}
                    filter={isHovered ? "drop-shadow(0px 4px 8px rgba(0,0,0,0.15))" : ""}
                  />
                  
                  {/* Status Bar */}
                  <rect x={0} y={0} width={6} height={displayHeight} rx={4} fill={statusColor} />
                  <rect x={4} y={0} width={2} height={displayHeight} fill={statusColor} />

                  {/* Content Container */}
                  <svg x={10} y={0} width={w - 12} height={displayHeight}>
                     <text x={0} y={22} fontSize="12" fontWeight="bold" fill="#172b4d" style={{ userSelect: 'none' }}>
                       {task.name}
                     </text>

                     {/* Regular View */}
                     <g opacity={1}>
                       {task.owner && (
                         <text x={0} y={40} fontSize="11" fontStyle="italic" fill="#444" style={{ userSelect: 'none' }}>
                           {task.owner}
                         </text>
                       )}
                       <text x={0} y={task.owner ? 58 : 40} fontSize="10" fill="#666" style={{ userSelect: 'none' }}>
                         {task.start.slice(5)} → {task.end.slice(5)}
                       </text>
                       {task.link && (
                         <text x={0} y={task.owner ? 74 : 56} fontSize="10" fill="#0052cc" style={{ userSelect: 'none', textDecoration: 'underline' }}>
                           Has Link ↗
                         </text>
                       )}
                     </g>
                  </svg>

                  {/* Handles */}
                  <rect x={0} y={0} width={RESIZE_HANDLE_WIDTH} height={displayHeight} fill="transparent" style={{ cursor: 'ew-resize' }} />
                  <rect x={w - RESIZE_HANDLE_WIDTH} y={0} width={RESIZE_HANDLE_WIDTH} height={displayHeight} fill="transparent" style={{ cursor: 'ew-resize' }} />
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
};
