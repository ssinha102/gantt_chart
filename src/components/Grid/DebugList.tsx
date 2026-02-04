import React from 'react';
import { useStore } from '../../state/store';
import { Task } from '../../model/types';

export const DebugList: React.FC = () => {
  const { doc, addRow, addTask, deleteRow, deleteTask, updateTask, updateRow, toggleRowCollapse } = useStore();

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

  const collapsedIds = doc.view.collapsedRowIds || [];

  return (
    <div id="grid-container" style={{ padding: '0.5rem', height: '100%', overflowY: 'auto', background: '#fafbfc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Project Board</h3>
        <button onClick={() => addRow("New Phase")} style={{ padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>+ Phase</button>
      </div>
      
      <div>
        {doc.rows.map(row => {
          const isCollapsed = collapsedIds.includes(row.id);
          const tasks = doc.tasks.filter(t => t.rowId === row.id);

          return (
            <div key={row.id} style={{ marginBottom: '10px', border: '1px solid #dfe1e6', borderRadius: '4px', background: '#fff' }}>
              {/* Row Header */}
              <div style={{ 
                height: '40px',
                padding: '0 0.5rem', 
                borderBottom: isCollapsed ? 'none' : '1px solid #dfe1e6', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: '#f4f5f7',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
                borderBottomLeftRadius: isCollapsed ? '4px' : '0',
                borderBottomRightRadius: isCollapsed ? '4px' : '0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }}>
                  <button 
                    onClick={() => toggleRowCollapse(row.id)}
                    style={{ 
                      background: 'transparent', border: 'none', cursor: 'pointer', 
                      fontSize: '0.8rem', width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}
                  >
                    {isCollapsed ? '▶' : '▼'}
                  </button>
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
                </div>
                <button onClick={() => deleteRow(row.id)} style={{ color: '#de350b', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem' }}>Del</button>
              </div>
              
              {/* Task List */}
              {!isCollapsed && (
                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {tasks.map(task => (
                    <div key={task.id} style={{ 
                      height: '120px', // INCREASED: Comfortable height
                      boxSizing: 'border-box',
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-evenly',
                      padding: '8px', 
                      borderBottom: '1px solid #eee', 
                      position: 'relative',
                      background: '#fff'
                    }}>
                      
                      {/* Line 1: Title & Delete */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input 
                          value={task.name} 
                          onChange={(e) => updateTask(task.id, { name: e.target.value })}
                          style={{ flex: 1, fontWeight: '700', fontSize: '0.9rem', border: 'none', borderBottom: '1px dotted #ccc', padding: '2px 0' }}
                          placeholder="Task Title"
                        />
                        <button onClick={() => deleteTask(task.id)} style={{ color: '#de350b', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1.1rem', padding: 0 }}>&times;</button>
                      </div>

                      {/* Line 2: Owner (Dedicated Line) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', color: '#666', width: '45px' }}>Owner:</label>
                        <input 
                          placeholder="Unassigned" 
                          value={task.owner || ''} 
                          onChange={(e) => updateTask(task.id, { owner: e.target.value })}
                          style={{ flex: 1, border: '1px solid #eee', borderRadius: '3px', padding: '3px', fontSize: '0.8rem', background: '#fafafa' }}
                        />
                      </div>

                      {/* Line 3: Dates & Status */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                         <input 
                           type="date" 
                           value={task.start} 
                           onChange={(e) => updateTask(task.id, { start: e.target.value })}
                           style={{ width: '90px', border: '1px solid #eee', borderRadius: '3px', padding: '2px', fontSize: '0.75rem' }}
                         />
                         <span style={{ fontSize: '0.7rem', color: '#999' }}>to</span>
                         <input 
                           type="date" 
                           value={task.end} 
                           onChange={(e) => updateTask(task.id, { end: e.target.value })}
                           style={{ width: '90px', border: '1px solid #eee', borderRadius: '3px', padding: '2px', fontSize: '0.75rem' }}
                         />
                         <select 
                          value={task.status || 'todo'} 
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '2px', border: '1px solid #eee', borderRadius: '3px' }}
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">Doing</option>
                          <option value="blocked">Block</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      {/* Line 4: Link */}
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <label style={{ fontSize: '0.75rem', color: '#666', width: '45px' }}>Link:</label>
                          <input 
                            placeholder="https://..."
                            value={task.link || ''}
                            onChange={(e) => handleLinkChange(task.id, e.target.value)}
                            style={{ flex: 1, border: 'none', borderBottom: '1px solid #eee', padding: '2px', fontSize: '0.8rem', color: task.link ? '#0052cc' : '#ccc' }}
                          />
                          {task.link && (
                            <a 
                              href={getSafeLink(task.link)} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ fontSize: '0.8rem', color: '#0052cc', textDecoration: 'none', cursor: 'pointer', padding: '0 4px' }}
                              title="Open Link"
                            >
                              ↗
                            </a>
                          )}
                      </div>

                    </div>
                  ))}
                  
                  <button 
                    onClick={() => addTask(row.id, "New Task")} 
                    style={{ 
                      height: '36px', 
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
