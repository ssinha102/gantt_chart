import React from 'react';
import { useStore } from '../../state/store';

export const Toolbar: React.FC = () => {
  const { doc, setTitle, loadDoc, toggleTimeboxes, addTimebox } = useStore();

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${doc.title.replace(/\s+/g, '_')}.gantt.json`;
    a.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        loadDoc(json);
      } catch (err) {
        alert("Failed to load JSON");
      }
    }
  };

  const handleAddSprint = () => {
    const name = prompt("Sprint Name (e.g. Sprint 24):");
    if (!name) return;
    const today = new Date().toISOString().split('T')[0];
    const end = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    addTimebox('sprint', name, today, end);
  };

  const handleAddPI = () => {
    const name = prompt("PI Name (e.g. PI 5):");
    if (!name) return;
    const today = new Date().toISOString().split('T')[0];
    const end = new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    addTimebox('pi', name, today, end);
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem', 
      padding: '0.75rem 1rem', 
      borderBottom: '1px solid #dfe1e6',
      background: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}>
      <input 
        value={doc.title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Project Title"
        style={{ fontSize: '1.2rem', fontWeight: '600', border: '1px solid transparent', padding: '4px', borderRadius: '4px' }}
      />
      
      <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
          <input 
            type="checkbox" 
            checked={!!doc.view.showTimeboxes} 
            onChange={toggleTimeboxes} 
          />
          Show Sprints/PIs
        </label>
        <button onClick={handleAddSprint} style={{ padding: '4px 8px', fontSize: '0.9rem' }}>+ Sprint</button>
        <button onClick={handleAddPI} style={{ padding: '4px 8px', fontSize: '0.9rem' }}>+ PI</button>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleDownload} style={{ padding: '6px 12px', cursor: 'pointer' }}>Export JSON</button>
        <label style={{ padding: '6px 12px', cursor: 'pointer', background: '#0052cc', color: 'white', borderRadius: '3px' }}>
          Import JSON
          <input type="file" hidden onChange={handleUpload} accept=".json" />
        </label>
      </div>
    </div>
  );
};
