import React from 'react';
import { useStore } from '../../state/store';
import { Task } from '../../model/types';

export const DebugList: React.FC = () => {
  const { doc, addRow, addTask, deleteRow, deleteTask, updateTask } = useStore();

  const handleStatusChange = (taskId: string, val: string) => {
    updateTask(taskId, { status: val as Task['status'] });
  };

  return (
    <div style={{ padding: '1rem', height: '100%', overflowY: 'auto', background: '#fafbfc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Work Breakdown</h3>
        <button onClick={() => addRow("New Stream")} style={{ padding: '4px 8px', cursor: 'pointer' }}>+ Add Row</button>
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
              <span style={{ fontWeight: '700', color: '#172b4d' }}>{row.name}</span>
              <button onClick={() => deleteRow(row.id)} style={{ color: '#de350b', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem' }}>Delete Row</button>
            </div>
            
            {/* Task List */}
            <div style={{ padding: '0.5rem' }}>
              {doc.tasks.filter(t => t.rowId === row.id).map(task => (
                <div key={task.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px', 
                  padding: '8px', 
                  border: '1px solid #eee', 
                  marginBottom: '8px', 
                  borderRadius: '4px',
                  background: '#fff'
                }}>
                  {/* Top Line: Name & Delete */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      value={task.name} 
                      onChange={(e) => updateTask(task.id, { name: e.target.value })}
                      style={{ flex: 1, fontWeight: '600', border: '1px solid transparent', padding: '2px' }}
                      placeholder="Task Name"
                    />
                     <button onClick={() => deleteTask(task.id)} style={{ color: '#de350b', cursor: 'pointer', border: 'none', background: 'transparent' }}>✕</button>
                  </div>

                  {/* Details Line: Dates, Owner, Status */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    
                    {/* Owner Input */}
                    <input 
                      placeholder="Owner..." 
                      value={task.owner || ''} 
                      onChange={(e) => updateTask(task.id, { owner: e.target.value })}
                      style={{ border: '1px solid #dfe1e6', borderRadius: '3px', padding: '4px', fontSize: '0.85rem' }}
                    />

                    {/* Status Dropdown */}
                    <select 
                      value={task.status || 'todo'} 
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={{ border: '1px solid #dfe1e6', borderRadius: '3px', padding: '4px', fontSize: '0.85rem' }}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="blocked">Blocked</option>
                      <option value="done">Done</option>
                    </select>

                    {/* Start Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#666' }}>
                      <span>Start:</span>
                      <input 
                        type="date" 
                        value={task.start} 
                        onChange={(e) => updateTask(task.id, { start: e.target.value })}
                        style={{ border: '1px solid #dfe1e6', borderRadius: '3px', padding: '2px', width: '100%' }}
                      />
                    </div>

                    {/* End Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#666' }}>
                      <span>Due:</span>
                      <input 
                        type="date" 
                        value={task.end} 
                        onChange={(e) => updateTask(task.id, { end: e.target.value })}
                        style={{ border: '1px solid #dfe1e6', borderRadius: '3px', padding: '2px', width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => addTask(row.id, "New Task")} 
                style={{ 
                  width: '100%', 
                  padding: '6px', 
                  marginTop: '4px', 
                  border: '1px dashed #ccc', 
                  background: 'transparent', 
                  color: '#666',
                  cursor: 'pointer',
                  borderRadius: '4px'
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
