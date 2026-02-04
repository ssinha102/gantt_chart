import React from 'react';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { DebugList } from '../components/Grid/DebugList';

const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff' }}>
      <Toolbar />
      
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Pane: Grid */}
        <div style={{ width: '400px', borderRight: '1px solid #dfe1e6', background: '#fff' }}>
          <DebugList />
        </div>
        
        {/* Right Pane: Timeline Placeholder */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f5f7', color: '#6b778c' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Timeline Visualization</h2>
            <p>Phase 2: SVG Rendering coming next</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;