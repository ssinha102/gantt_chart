import React from 'react';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { DebugList } from '../components/Grid/DebugList';
import { useStore } from '../state/store';
import './App.css';

const App: React.FC = () => {
  const { status, errorMessage, clearError } = useStore();

  return (
    <div className="app-container">
      {status === "error" && (
        <div className="error-toast">
          <span>{errorMessage}</span>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      
      <Toolbar />
      
      <div className="main-content">
        <div className="split-pane left">
          <DebugList />
        </div>
        <div className="split-pane right">
          <div style={{ padding: '2rem', color: '#888', textAlign: 'center' }}>
            Timeline Visualization (Phase 2)
            <br/>
            Current Zoom: {useStore(s => s.doc.view.zoom)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;