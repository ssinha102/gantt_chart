import React from 'react';
import { useStore } from '../../state/store';
import { Task } from '../../model/types';

export const DebugList: React.FC = () => {
  const { doc, addRow, addTask, deleteRow, deleteTask, updateTask, updateRow } = useStore();

  const handleStatusChange = (taskId: string, val: string) => {
    updateTask(taskId, { status: val as Task['status'] });
  };

  const handleLinkChange = (taskId: string, val: string) => {
    updateTask(taskId, { link: val });
  };

  const getSafeLink = (link?: string) => {
    if (!link) return '';
    if (link.startsWith('http://') || link.startsWith('https://')) return link;
    return `https://${link}`;
  };

  return (
    <div id="grid-container" style={{ padding: '0.5rem', height: '100%', overflowY: 'auto', background: '#fafbfc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Work Breakdown</h3>
        <button onClick={() => addRow("New Row")} style={{ padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>+ Row</button>
      </div>
      
      <div>
        {doc.rows.map(row => (
          <div key={row.id} style={{ marginBottom: '10px', border: '1px solid #dfe1e6', borderRadius: '4px', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            {/* Row Header (Compact: 40px) */}
            <div style={{ 
              height: '40px',
              padding: '0 0.5rem', 
              borderBottom: '1px solid #dfe1e6', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: '#f4f5f7',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px'
            }}>
              <input 
                value={row.name}
                onChange={(e) => updateRow(row.id, { name: e.target.value })}
                style={{ 
                  fontWeight: '700', 
                  color: '#172b4d', 
                  border: '1px solid transparent', 
                  background: 'transparent',
                  fontSize: '0.9rem',
                  width: '100%'
                }}
              />
              <button onClick={() => deleteRow(row.id)} style={{ color: '#de350b', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>Delete</button>
            </div>
            
            {/* Task List */}
            <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
              {doc.tasks.filter(t => t.rowId === row.id).map(task => (
                <div key={task.id} style={{ 
                  height: '110px', // Matches Timeline Track exactly
                  boxSizing: 'border-box',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '4px',
                  padding: '6px', 
                  borderBottom: '1px solid #eee', 
                  position: 'relative'
                }}>
                  
                  {/* Row 1: Title (Bold) & Delete */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                    <input 
                      value={task.name} 
                      onChange={(e) => updateTask(task.id, { name: e.target.value })}
                      style={{ flex: 1, fontWeight: '800', fontSize: '0.9rem', border: 'none', padding: '0', background: 'transparent' }}
                      placeholder="Task Title"
                    />
                     <button onClick={() => deleteTask(task.id)} style={{ color: '#de350b', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1rem', lineHeight: '1' }}>&times;</button>
                  </div>

                  {/* Row 2: Owner & Status */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      placeholder="No Owner" 
                      value={task.owner || ''} 
                      onChange={(e) => updateTask(task.id, { owner: e.target.value })}
                      style={{ flex: 1, border: 'none', borderBottom: '1px dashed #eee', padding: '0', fontSize: '0.8rem', fontStyle: 'italic', color: '#444' }}
                    />
                    <select 
                      value={task.status || 'todo'} 
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={{ fontSize: '0.7rem', padding: '0', border: 'none', color: '#666' }}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">Doing</option>
                      <option value="blocked">Block</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  {/* Row 3: Dates (Side-by-Side for Compactness) */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                     <input 
                       type="date" 
                       value={task.start} 
                       onChange={(e) => updateTask(task.id, { start: e.target.value })}
                       style={{ flex: 1, border: '1px solid #dfe1e6', borderRadius: '3px', padding: '1px', fontSize: '0.8rem' }}
                     />
                     <span style={{ fontSize: '0.7rem', color: '#999' }}>→</span>
                     <input 
                       type="date" 
                       value={task.end} 
                       onChange={(e) => updateTask(task.id, { end: e.target.value })}
                       style={{ flex: 1, border: '1px solid #dfe1e6', borderRadius: '3px', padding: '1px', fontSize: '0.8rem' }}
                     />
                  </div>

                  {/* Row 4: Link */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input 
                        placeholder="Link..."
                        value={task.link || ''}
                        onChange={(e) => handleLinkChange(task.id, e.target.value)}
                        style={{ flex: 1, border: 'none', padding: '0', fontSize: '0.8rem', color: task.link ? '#0052cc' : 'inherit' }}
                      />
                      {task.link && <a href={getSafeLink(task.link)} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#0052cc', textDecoration: 'none' }}>↗</a>}
                  </div>

                </div>
              ))}
              
              <button 
                onClick={() => addTask(row.id, "New Task")} 
                style={{ 
                  height: '40px', // Matches Footer
                  width: '100%', 
                  border: 'none',
                  borderTop: '1px solid #eee',
                  background: 'transparent', 
                  color: '#505f79',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                + Add Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
