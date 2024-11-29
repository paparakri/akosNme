import React from 'react';
import { Layer, Group, Rect, Text, Transformer } from 'react-konva';
import { elementTemplates } from './elementTemplates';
import type { LayoutElement } from './types';

interface ElementProps {
  element: LayoutElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<LayoutElement>) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const Element: React.FC<ElementProps> = ({
  element,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd
}) => {
  const shapeRef = React.useRef<any>(null);
  const transformerRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const template = elementTemplates[element.type];
  const handleTransform = () => {
    if (!shapeRef.current) return;

    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(template.minWidth, node.width() * scaleX),
      height: Math.max(template.minHeight, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  return (
    <>
      <Group
        draggable={!element.isLocked}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <Rect
          ref={shapeRef}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation}
          fill={element.style?.fill || template.style.fill}
          stroke={element.style?.stroke || template.style.stroke}
          strokeWidth={2}
          opacity={element.isLocked ? 0.5 : 1}
          onClick={onSelect}
          onTap={onSelect}
          onTransformEnd={handleTransform}
        />
        <Text
          x={element.x}
          y={element.y + element.height / 2 - 8}
          width={element.width}
          text={element.name}
          align="center"
          fill="white"
          fontSize={12}
        />
        {element.capacity && (
          <Text
            x={element.x}
            y={element.y + element.height / 2 + 8}
            width={element.width}
            text={`${element.capacity} seats`}
            align="center"
            fill="rgba(255, 255, 255, 0.7)"
            fontSize={10}
          />
        )}
      </Group>
      {isSelected && !element.isLocked && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            const minWidth = template.minWidth || 20;
            const minHeight = template.minHeight || 20;
            return {
              ...newBox,
              width: Math.max(minWidth, newBox.width),
              height: Math.max(minHeight, newBox.height)
            };
          }}
          enabledAnchors={template.allowResize ? undefined : []}
          rotateEnabled={template.allowRotate}
          anchorFill="#fff"
          anchorStroke="#666"
          anchorSize={8}
          anchorCornerRadius={2}
          borderStroke="#3b82f6"
          borderDash={[4, 4]}
          padding={4}
        />
      )}
    </>
  );
};