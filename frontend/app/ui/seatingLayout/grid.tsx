import React from 'react';
import { Line, Group } from 'react-konva';

interface GridProps {
  width: number;
  height: number;
  size: number;
  subdivisions: number;
}

export const Grid: React.FC<GridProps> = ({ width, height, size, subdivisions }) => {
  const subSize = size / subdivisions;

  return (
    <Group>
      {/* Subdivision grid lines */}
      {Array.from({ length: Math.ceil(width / subSize) }).map((_, i) => (
        <Line
          key={`vs${i}`}
          points={[i * subSize, 0, i * subSize, height]}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: Math.ceil(height / subSize) }).map((_, i) => (
        <Line
          key={`hs${i}`}
          points={[0, i * subSize, width, i * subSize]}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={0.5}
        />
      ))}

      {/* Major grid lines */}
      {Array.from({ length: Math.ceil(width / size) }).map((_, i) => (
        <Line
          key={`v${i}`}
          points={[i * size, 0, i * size, height]}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: Math.ceil(height / size) }).map((_, i) => (
        <Line
          key={`h${i}`}
          points={[0, i * size, width, i * size]}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={1}
        />
      ))}
    </Group>
  );
};