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
    <div id="grid-container" style={{ padding: '0.25rem', height: '100%', overflowY: 'auto', background: '#fafbfc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', padding: '0 0.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Project Board</h3>
        <button onClick={() => addRow("New Phase")} style={{ padding: '1px 6px', cursor: 'pointer', fontSize: '0.75rem' }}>+ Phase</button>
      </div>
      
      <div>
        {doc.rows.map(row => {
          const isCollapsed = collapsedIds.includes(row.id);
          const tasks = doc.tasks.filter(t => t.rowId === row.id);

          return (
            <div key={row.id} style={{ marginBottom: '4px', border: '1px solid #dfe1e6', borderRadius: '4px', background: '#fff' }}>
              {/* Row Header (Main Task) */}
              <div style={{ 
                height: '40px',
                padding: '0 0.25rem', 
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
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '4px' }}>
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
                      fontSize: '0.85rem',
                      width: '100%'
                    }}
                  />
                </div>
                <button onClick={() => deleteRow(row.id)} style={{ color: '#de350b', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>Del</button>
              </div>
              
              {/* Task List (Hidden if Collapsed) */}
              {!isCollapsed && (
                <div style={{ padding: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {tasks.map(task => (
                    <div key={task.id} style={{ 
                      height: '50px', // COMPACT HEIGHT (Matches Timeline)
                      boxSizing: 'border-box',
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0 6px', 
                      borderBottom: '1px solid #eee', 
                      position: 'relative',
                      background: '#fff'
                    }}>
                      {/* Compact Single Line Row */}
                      <input 
                        value={task.name} 
                        onChange={(e) => updateTask(task.id, { name: e.target.value })}
                        style={{ flex: 1, fontWeight: '600', fontSize: '0.8rem', border: 'none', background: 'transparent' }}
                        placeholder="Task Title"
                      />
                      
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <select 
                          value={task.status || 'todo'} 
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          style={{ fontSize: '0.7rem', padding: '0', border: 'none', color: '#666', maxWidth: '60px' }}
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">Doing</option>
                          <option value="blocked">Block</option>
                          <option value="done">Done</option>
                        </select>
                        <button onClick={() => deleteTask(task.id)} style={{ color: '#de350b', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1rem', lineHeight: '1', padding: 0 }}>&times;</button>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => addTask(row.id, "New Task")} 
                    style={{ 
                      height: '30px', 
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
