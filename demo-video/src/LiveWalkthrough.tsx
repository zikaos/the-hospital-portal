import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';

export const LiveWalkthrough: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A0A' }}>
      <OffthreadVideo
        src={staticFile('portal-walkthrough.webm')}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </AbsoluteFill>
  );
};
