import React from 'react';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { DebugList } from '../components/Grid/DebugList';
import { Timeline } from '../components/Timeline/Timeline';

const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff' }}>
      <Toolbar />
      
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Pane: Grid */}
        <div style={{ width: '400px', borderRight: '1px solid #dfe1e6', background: '#fff', display: 'flex', flexDirection: 'column' }}>
          {/* We add a spacer to align the grid rows with the timeline rows */}
          <div style={{ height: '40px', borderBottom: '1px solid #eee', background: '#fafafa' }}>
            {/* Header Spacer */}
          </div>
          <DebugList />
        </div>
        
        {/* Right Pane: Timeline SVG */}
        <div style={{ flex: 1, display: 'flex', background: '#fff', overflow: 'hidden' }}>
          <Timeline />
        </div>
      </div>
    </div>
  );
};

export default App;
