import React, { useState } from 'react';
import { useStore } from '../../state/store';

// A temporary component for Phase 1 to verify data model logic
export const DebugList: React.FC = () => {
  const { doc, addRow, deleteRow, addTask, deleteTask } = useStore();
  const [newRowName, setNewRowName] = useState("");
  
  // Quick Task Form State
  const [targetRowId, setTargetRowId] = useState("");
  const [taskName, setTaskName] = useState("");
  const [taskStart, setTaskStart] = useState(new Date().toISOString().split('T')[0]);
  const [taskEnd, setTaskEnd] = useState(new Date().toISOString().split('T')[0]);

  const handleAddRow = () => {
    if (!newRowName) return;
    addRow(newRowName);
    setNewRowName("");
  };

  const handleAddTask = () => {
    if (!targetRowId || !taskName) return;
    addTask(targetRowId, {
      name: taskName,
      start: taskStart,
      end: taskEnd
    });
    setTaskName("");
  };

  return (
    <div style={{ padding: '1rem', overflowY: 'auto' }}>
      <h3>Debug Data View</h3>
      
      {/* Row Adder */}
      <div style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '0.5rem' }}>
        <h4>Add Row</h4>
        <input 
          value={newRowName} 
          onChange={e => setNewRowName(e.target.value)} 
          placeholder="Row Name" 
        />
        <button onClick={handleAddRow}>Add Row</button>
      </div>

      {/* Task Adder */}
      <div style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '0.5rem' }}>
        <h4>Add Task</h4>
        <select value={targetRowId} onChange={e => setTargetRowId(e.target.value)}>
          <option value="">Select Row...</option>
          {doc.rows.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <input value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="Task Name" />
        <input type="date" value={taskStart} onChange={e => setTaskStart(e.target.value)} />
        <input type="date" value={taskEnd} onChange={e => setTaskEnd(e.target.value)} />
        <button onClick={handleAddTask}>Add Task</button>
      </div>

      {/* Display */}
      <div>
        {doc.rows.map(row => (
          <div key={row.id} style={{ borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
            <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
              <span>{row.name} <small>({row.id})</small></span>
              <button onClick={() => deleteRow(row.id)} style={{ color: 'red' }}>X</button>
            </div>
            <ul style={{ margin: '0.5rem 0' }}>
              {doc.tasks.filter(t => t.rowId === row.id).map(task => (
                <li key={task.id} style={{ display: 'flex', gap: '1rem' }}>
                  <span>{task.name}</span>
                  <span style={{ color: '#666' }}>{task.start} -> {task.end}</span>
                  <button onClick={() => deleteTask(task.id)} style={{ fontSize: '0.8rem' }}>Del</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};