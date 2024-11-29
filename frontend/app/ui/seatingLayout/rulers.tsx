import React from 'react';
import { Line, Group, Rect } from 'react-konva';
import { Point } from './types';
import { Text } from 'react-konva';

interface RulersProps {
    canvasWidth: number;
    canvasHeight: number;
    scale: number;
    offset: Point;
  }
  
  export const Rulers: React.FC<RulersProps> = ({ 
    canvasWidth, 
    canvasHeight, 
    scale, 
    offset 
  }) => {
    const rulerSize = 20;
    const majorTickSize = 10;
    const minorTickSize = 5;
    const majorSpacing = 100;
    const minorSpacing = 20;
  
    return (
      <Group>
        {/* Ruler backgrounds */}
        <Rect
          x={0}
          y={0}
          width={canvasWidth}
          height={rulerSize}
          fill="rgba(0, 0, 0, 0.3)"
        />
        <Rect
          x={0}
          y={0}
          width={rulerSize}
          height={canvasHeight}
          fill="rgba(0, 0, 0, 0.3)"
        />
  
        {/* Horizontal ruler ticks */}
        {Array.from({ length: Math.ceil(canvasWidth / minorSpacing) }).map((_, i) => {
          const x = i * minorSpacing;
          const isMajor = i % (majorSpacing / minorSpacing) === 0;
          const adjustedX = (x - offset.x) * scale;
  
          return (
            <Group key={`h${i}`}>
              <Line
                points={[adjustedX, 0, adjustedX, isMajor ? majorTickSize : minorTickSize]}
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth={1}
              />
              {isMajor && (
                <Text
                  x={adjustedX + 2}
                  y={2}
                  text={x.toString()}
                  fontSize={9}
                  fill="rgba(255, 255, 255, 0.7)"
                />
              )}
            </Group>
          );
        })}
  
        {/* Vertical ruler ticks */}
        {Array.from({ length: Math.ceil(canvasHeight / minorSpacing) }).map((_, i) => {
          const y = i * minorSpacing;
          const isMajor = i % (majorSpacing / minorSpacing) === 0;
          const adjustedY = (y - offset.y) * scale;
  
          return (
            <Group key={`v${i}`}>
              <Line
                points={[0, adjustedY, isMajor ? majorTickSize : minorTickSize, adjustedY]}
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth={1}
              />
              {isMajor && (
                <Text
                  x={2}
                  y={adjustedY + 2}
                  text={y.toString()}
                  fontSize={9}
                  fill="rgba(255, 255, 255, 0.7)"
                  rotation={-90}
                />
              )}
            </Group>
          );
        })}
      </Group>
    );
  };