import React, { useEffect } from 'react';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { DebugList } from '../components/Grid/DebugList';
import { Timeline } from '../components/Timeline/Timeline';

const App: React.FC = () => {

  // Synchronize Scrolling between Grid and Timeline
  useEffect(() => {
    const grid = document.getElementById('grid-container');
    const timeline = document.getElementById('timeline-container');
    
    if (!grid || !timeline) return;

    const syncScroll = (source: HTMLElement, target: HTMLElement) => {
      target.scrollTop = source.scrollTop;
    };

    const handleGridScroll = () => syncScroll(grid, timeline);
    const handleTimelineScroll = () => syncScroll(timeline, grid);

    grid.addEventListener('scroll', handleGridScroll);
    timeline.addEventListener('scroll', handleTimelineScroll);

    return () => {
      grid.removeEventListener('scroll', handleGridScroll);
      timeline.removeEventListener('scroll', handleTimelineScroll);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff' }}>
      <Toolbar />
      
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Pane: Grid */}
        <div style={{ width: '400px', borderRight: '1px solid #dfe1e6', background: '#fff', display: 'flex', flexDirection: 'column' }}>
          {/* Header Spacer for Timeline Timeboxes */}
          <div style={{ height: '30px', borderBottom: '1px solid #eee', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#999' }}>
            {/* Optional: Add "Timeline Headers" text here if desired, currently purely spacing */}
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
