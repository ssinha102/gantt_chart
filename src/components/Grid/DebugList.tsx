import React from 'react';
import { useStore } from '../../state/store';

export const DebugList: React.FC = () => {
  const { doc, addRow, addTask, deleteRow, deleteTask } = useStore();

  return (
    <div style={{ padding: '1rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Work Breakdown</h3>
        <button onClick={() => addRow("New Stream")}>+ Add Row</button>
      </div>
      
      <div>
        {doc.rows.map(row => (
          <div key={row.id} style={{ marginBottom: '1rem', border: '1px solid #dfe1e6', borderRadius: '4px', background: '#f9f9fa' }}>
            <div style={{ 
              padding: '0.5rem', 
              borderBottom: '1px solid #dfe1e6', 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: '600' 
            }}>
              {row.name}
              <button onClick={() => deleteRow(row.id)} style={{ color: '#de350b', border: 'none', background: 'transparent', cursor: 'pointer' }}>Delete</button>
            </div>
            
            <ul style={{ listStyle: 'none', padding: '0.5rem', margin: 0 }}>
              {doc.tasks.filter(t => t.rowId === row.id).map(task => (
                <li key={task.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px dashed #eee'
                }}>
                  <span>{task.name}</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', color: '#666' }}>
                    {/* The fix is below: {'->'} treats the arrow as text */}
                    <span>{task.start} {'->'} {task.end}</span>
                    <button onClick={() => deleteTask(task.id)} style={{ color: '#de350b', cursor: 'pointer', border: '1px solid #eee', padding: '2px 6px' }}>x</button>
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ padding: '0.5rem', paddingTop: 0 }}>
              <button onClick={() => addTask(row.id, "New Task")} style={{ fontSize: '0.8rem', width: '100%' }}>+ Add Task</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};