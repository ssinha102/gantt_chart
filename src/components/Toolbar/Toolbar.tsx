import React from 'react';
import { useStore } from '../../state/store';

export const Toolbar: React.FC = () => {
  const { doc, setTitle, loadDoc } = useStore();

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
        style={{ 
          fontSize: '1.2rem', 
          fontWeight: '600', 
          border: '1px solid transparent', 
          padding: '4px',
          borderRadius: '4px' 
        }}
      />
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleDownload} style={{ padding: '6px 12px', cursor: 'pointer' }}>
          Export JSON
        </button>
        <label style={{ 
          padding: '6px 12px', 
          cursor: 'pointer', 
          background: '#0052cc', 
          color: 'white', 
          borderRadius: '3px' 
        }}>
          Import JSON
          <input type="file" hidden onChange={handleUpload} accept=".json" />
        </label>
      </div>
    </div>
  );
};