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
    <div id="grid-container" style={{ padding: '1rem', height: '100%', overflowY: 'auto', background: '#fafbfc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Work Breakdown</h3>
        <button onClick={() => addRow("New Row")} style={{ padding: '4px 8px', cursor: 'pointer' }}>+ Add Row</button>
      </div>
      
      <div>
        {doc.rows.map(row => (
          <div key={row.id} style={{ marginBottom: '1.5rem', border: '1px solid #dfe1e6', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            {/* Row Header */}
            <div style={{ 
              padding: '0.75rem', 
              borderBottom: '1px solid #dfe1e6', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: '#f4f5f7',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px'
            }}>
              <input 
                value={row.name}
                onChange={(e) => updateRow(row.id, { name: e.target.value })}
                style={{ 
                  fontWeight: '700', 
                  color: '#172b4d', 
                  border: '1px solid transparent', 
                  background: 'transparent',
                  fontSize: '1rem',
                  width: '100%'
                }}
              />
              <button onClick={() => deleteRow(row.id)} style={{ color: '#de350b', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Delete Row</button>
            </div>
            
            {/* Task List */}
            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {doc.tasks.filter(t => t.rowId === row.id).map(task => (
                <div key={task.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px', // Vertical spacing between stack items
                  padding: '12px', 
                  border: '1px solid #eee', 
                  borderRadius: '6px',
                  background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  position: 'relative' // For absolute positioning delete button if needed, but flex is safer
                }}>
                  
                  {/* 1. Subtask Name (Bold) & Delete & Status */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <textarea 
                      value={task.name} 
                      onChange={(e) => updateTask(task.id, { name: e.target.value })}
                      style={{ 
                        flex: 1, 
                        fontWeight: '800', // Extra bold
                        fontSize: '1rem',
                        border: '1px solid transparent', 
                        padding: '4px', 
                        resize: 'vertical',
                        minHeight: '28px',
                        fontFamily: 'inherit',
                        background: 'transparent'
                      }}
                      placeholder="Task Title"
                      rows={1}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                       <button onClick={() => deleteTask(task.id)} style={{ color: '#de350b', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1.2rem', lineHeight: '1', padding: '0 4px' }}>&times;</button>
                       {/* Status kept small in corner to maintain functionality */}
                       <select 
                          value={task.status || 'todo'} 
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          style={{ fontSize: '0.7rem', padding: '2px', border: '1px solid #eee', borderRadius: '3px' }}
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">Doing</option>
                          <option value="blocked">Block</option>
                          <option value="done">Done</option>
                        </select>
                    </div>
                  </div>

                  {/* 2. Owner (Italic) */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input 
                      placeholder="No Owner Assigned" 
                      value={task.owner || ''} 
                      onChange={(e) => updateTask(task.id, { owner: e.target.value })}
                      style={{ 
                        width: '100%',
                        border: '1px solid transparent', 
                        borderBottom: '1px dashed #eee',
                        padding: '4px', 
                        fontSize: '0.9rem',
                        fontStyle: 'italic',
                        color: '#444'
                      }}
                    />
                  </div>

                  {/* 3. Dates (Normal) - Stacked Vertically */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                     {/* Start Date (Required for Gantt logic) */}
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#666', width: '40px' }}>Start:</span>
                        <input 
                          type="date" 
                          value={task.start} 
                          onChange={(e) => updateTask(task.id, { start: e.target.value })}
                          style={{ border: '1px solid #dfe1e6', borderRadius: '3px', padding: '2px 4px', fontSize: '0.9rem' }}
                        />
                     </div>
                     {/* Due Date (The one requested) */}
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#666', width: '40px', fontWeight: 'bold' }}>Due:</span>
                        <input 
                          type="date" 
                          value={task.end} 
                          onChange={(e) => updateTask(task.id, { end: e.target.value })}
                          style={{ border: '1px solid #dfe1e6', borderRadius: '3px', padding: '2px 4px', fontSize: '0.9rem' }}
                        />
                     </div>
                  </div>

                  {/* 4. Link to Task (Blue Link) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        placeholder="Paste Link (http://...)"
                        value={task.link || ''}
                        onChange={(e) => handleLinkChange(task.id, e.target.value)}
                        style={{ 
                          flex: 1,
                          border: '1px solid #dfe1e6', 
                          borderRadius: '3px', 
                          padding: '4px', 
                          fontSize: '0.85rem',
                          color: '#0052cc'
                        }}
                      />
                      {task.link && (
                        <a 
                          href={getSafeLink(task.link)} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ 
                            fontSize: '0.85rem', 
                            color: '#0052cc', 
                            textDecoration: 'underline', 
                            whiteSpace: 'nowrap' 
                          }}
                        >
                          Open Link &rarr;
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              ))}
              
              <button 
                onClick={() => addTask(row.id, "New Task")} 
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginTop: '4px', 
                  border: '2px dashed #dfe1e6', 
                  background: '#f9f9fa', 
                  color: '#505f79',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  fontWeight: '600'
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
