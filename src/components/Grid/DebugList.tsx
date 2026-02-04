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

  // Helper to ensure link is clickable
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
            <div style={{ padding: '0.75rem' }}>
              {doc.tasks.filter(t => t.rowId === row.id).map(task => (
                <div key={task.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px', 
                  padding: '12px', 
                  border: '1px solid #eee', 
                  marginBottom: '12px', 
                  borderRadius: '6px',
                  background: '#fff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}>
                  {/* Row 1: Title (Bold) & Delete */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <textarea 
                      value={task.name} 
                      onChange={(e) => updateTask(task.id, { name: e.target.value })}
                      style={{ 
                        flex: 1, 
                        fontWeight: '700', 
                        fontSize: '0.95rem',
                        border: '1px solid transparent', 
                        padding: '2px', 
                        resize: 'vertical',
                        minHeight: '24px',
                        fontFamily: 'inherit'
                      }}
                      placeholder="Task Title"
                      rows={1}
                    />
                     <button onClick={() => deleteTask(task.id)} style={{ color: '#de350b', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1.2rem', lineHeight: '1' }}>&times;</button>
                  </div>

                  {/* Row 2: Owner (Italics) & Status */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input 
                      placeholder="Owner" 
                      value={task.owner || ''} 
                      onChange={(e) => updateTask(task.id, { owner: e.target.value })}
                      style={{ 
                        border: '1px solid #dfe1e6', 
                        borderRadius: '4px', 
                        padding: '6px', 
                        fontSize: '0.9rem',
                        fontStyle: 'italic'
                      }}
                    />
                    <select 
                      value={task.status || 'todo'} 
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={{ border: '1px solid #dfe1e6', borderRadius: '4px', padding: '6px', fontSize: '0.9rem' }}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="blocked">Blocked</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  {/* Row 3: Dates (Expanded) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ fontSize: '0.75rem', color: '#6b778c', fontWeight: '600' }}>START DATE</label>
                        <input 
                          type="date" 
                          value={task.start} 
                          onChange={(e) => updateTask(task.id, { start: e.target.value })}
                          style={{ border: '1px solid #dfe1e6', borderRadius: '4px', padding: '6px', width: '100%', boxSizing: 'border-box' }}
                        />
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ fontSize: '0.75rem', color: '#6b778c', fontWeight: '600' }}>END DATE</label>
                        <input 
                          type="date" 
                          value={task.end} 
                          onChange={(e) => updateTask(task.id, { end: e.target.value })}
                          style={{ border: '1px solid #dfe1e6', borderRadius: '4px', padding: '6px', width: '100%', boxSizing: 'border-box' }}
                        />
                     </div>
                  </div>

                  {/* Row 4: Link (Blue if populated) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#6b778c', fontWeight: '600' }}>LINK TO TASK</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        placeholder="https://..."
                        value={task.link || ''}
                        onChange={(e) => handleLinkChange(task.id, e.target.value)}
                        style={{ 
                          flex: 1,
                          border: '1px solid #dfe1e6', 
                          borderRadius: '4px', 
                          padding: '6px', 
                          fontSize: '0.9rem',
                          color: task.link ? '#0052cc' : 'inherit',
                          textDecoration: task.link ? 'underline' : 'none'
                        }}
                      />
                      {task.link && (
                        <a 
                          href={getSafeLink(task.link)} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ 
                            padding: '6px 12px', 
                            background: '#0052cc', 
                            color: 'white', 
                            borderRadius: '4px', 
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          Open
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
                  padding: '8px', 
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
