import React from 'react';
import { Line, Group } from 'react-konva';
import { LayoutGuide } from './types';

interface GuideProps {
    guides: LayoutGuide[];
    canvasWidth: number;
    canvasHeight: number;
  }
  
  export const Guides: React.FC<GuideProps> = ({ guides, canvasWidth, canvasHeight }) => {
    return (
      <Group>
        {guides.map((guide) => (
          <React.Fragment key={guide.id}>
            <Line
              points={
                guide.type === 'vertical'
                  ? [guide.position, 0, guide.position, canvasHeight]
                  : [0, guide.position, canvasWidth, guide.position]
              }
              stroke={guide.color || '#3b82f6'}
              strokeWidth={1}
              dash={[4, 4]}
            />
          </React.Fragment>
        ))}
      </Group>
    );
  };