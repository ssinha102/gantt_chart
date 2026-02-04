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
    <div id="grid-container" style={{ padding: '0.25rem', height: '100%', overflowY: 'auto', background: '#fafbfc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', padding: '0 0.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Work Breakdown</h3>
        <button onClick={() => addRow("New Row")} style={{ padding: '1px 6px', cursor: 'pointer', fontSize: '0.75rem' }}>+ Row</button>
      </div>
      
      <div>
        {doc.rows.map(row => (
          <div key={row.id} style={{ marginBottom: '4px', border: '1px solid #dfe1e6', borderRadius: '4px', background: '#fff' }}>
            {/* Row Header (Compact: 40px) */}
            <div style={{ 
              height: '40px',
              padding: '0 0.25rem', 
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
                  fontSize: '0.85rem',
                  width: '100%'
                }}
              />
              <button onClick={() => deleteRow(row.id)} style={{ color: '#de350b', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>Del</button>
            </div>
            
            {/* Task List - No Gap between tasks to minimize vertical space */}
            <div style={{ padding: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
              {doc.tasks.filter(t => t.rowId === row.id).map(task => (
                <div key={task.id} style={{ 
                  height: '80px', // Matches Timeline Track exactly (80px)
                  boxSizing: 'border-box',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '2px',
                  padding: '4px 6px', 
                  borderBottom: '1px solid #eee', 
                  position: 'relative',
                  background: '#fff'
                }}>
                  
                  {/* Line 1: Title (Bold) & Delete */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input 
                      value={task.name} 
                      onChange={(e) => updateTask(task.id, { name: e.target.value })}
                      style={{ flex: 1, fontWeight: '800', fontSize: '0.85rem', border: 'none', padding: '0', background: 'transparent', height: '18px' }}
                      placeholder="Task Title"
                    />
                     <button onClick={() => deleteTask(task.id)} style={{ color: '#de350b', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '0.9rem', lineHeight: '1', padding: 0 }}>&times;</button>
                  </div>

                  {/* Line 2: Owner & Status */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input 
                      placeholder="No Owner" 
                      value={task.owner || ''} 
                      onChange={(e) => updateTask(task.id, { owner: e.target.value })}
                      style={{ flex: 1, border: 'none', borderBottom: '1px dashed #eee', padding: '0', fontSize: '0.75rem', fontStyle: 'italic', color: '#444', height: '16px' }}
                    />
                    <select 
                      value={task.status || 'todo'} 
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={{ fontSize: '0.7rem', padding: '0', border: 'none', color: '#666', height: '16px' }}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">Doing</option>
                      <option value="blocked">Block</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  {/* Line 3: Dates & Link */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '18px' }}>
                     <input 
                       type="date" 
                       value={task.start} 
                       onChange={(e) => updateTask(task.id, { start: e.target.value })}
                       style={{ width: '80px', border: '1px solid #eee', borderRadius: '2px', padding: '0', fontSize: '0.7rem' }}
                     />
                     <span style={{ fontSize: '0.7rem', color: '#999' }}>-</span>
                     <input 
                       type="date" 
                       value={task.end} 
                       onChange={(e) => updateTask(task.id, { end: e.target.value })}
                       style={{ width: '80px', border: '1px solid #eee', borderRadius: '2px', padding: '0', fontSize: '0.7rem' }}
                     />
                     {/* Link Input inline with dates to save vertical space */}
                     <input 
                        placeholder="Link..."
                        value={task.link || ''}
                        onChange={(e) => handleLinkChange(task.id, e.target.value)}
                        style={{ flex: 1, border: 'none', padding: '0', fontSize: '0.7rem', color: task.link ? '#0052cc' : '#ccc', marginLeft: '4px' }}
                      />
                  </div>

                </div>
              ))}
              
              <button 
                onClick={() => addTask(row.id, "New Task")} 
                style={{ 
                  height: '40px', 
                  width: '100%', 
                  border: 'none',
                  borderTop: '1px solid #eee',
                  background: 'transparent', 
                  color: '#505f79',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                + Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
