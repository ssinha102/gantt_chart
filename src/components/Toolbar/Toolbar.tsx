import React, { useRef } from 'react';
import { useStore } from '../../state/store';
import { saveToFile, loadFromFile } from '../../utils/fileIO';
import { Zoom } from '../../model/types';

export const Toolbar: React.FC = () => {
  const { doc, setTitle, setZoom, loadDoc, resetDoc, setError } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const newDoc = await loadFromFile(file);
      loadDoc(newDoc);
    } catch (err: any) {
      setError(err.message || "Failed to load file");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleNewProject = () => {
    if (confirm("Are you sure? This will clear current unsaved changes.")) {
      resetDoc();
    }
  };

  return (
    <div style={{
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem', 
      padding: '0.5rem 1rem', 
      borderBottom: '1px solid #ccc',
      background: '#f8f9fa'
    }}>
      <input 
        style={{ fontSize: '1.2rem', fontWeight: 'bold', border: 'none', background: 'transparent' }}
        value={doc.title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Project Title"
      />
      
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
        <select 
          value={doc.view.zoom} 
          onChange={(e) => setZoom(e.target.value as Zoom)}
          style={{ padding: '4px' }}
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>

        <button onClick={handleNewProject}>New</button>
        <button onClick={() => saveToFile(doc)}>Export JSON</button>
        <button onClick={() => fileInputRef.current?.click()}>Import JSON</button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".json,.gantt.json" 
        />
      </div>
    </div>
  );
};