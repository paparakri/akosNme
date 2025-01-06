import React from 'react';
import { Layer, Group, Rect, Text, Transformer } from 'react-konva';
import { elementTemplates } from './elementTemplates';
import { useLayoutStore } from './layoutStore';
import type { LayoutElement } from './types';
import { KonvaEventObject } from 'konva/lib/Node';
import { Node, NodeConfig } from 'konva/lib/Node';

interface ElementProps {
  element: LayoutElement;
  isSelected: boolean;
  onSelect: (evt: KonvaEventObject<MouseEvent, Node<NodeConfig>>) => void;
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
  const { grid } = useLayoutStore();

  React.useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const template = elementTemplates[element.type];

  const snapToGrid = (value: number): number => {
    if (!grid.snap) return value;
    const gridSize = grid.size;
    return Math.round(value / gridSize) * gridSize;
  };

  const handleDragMove = (e: any) => {
    if (!grid.snap) return;
    
    const node = e.target;
    const newPos = {
      x: snapToGrid(node.x()),
      y: snapToGrid(node.y())
    };
    
    node.position(newPos);
  };

  const handleTransform = () => {
    if (!shapeRef.current) return;

    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    node.scaleX(1);
    node.scaleY(1);

    let newWidth = Math.max(template.minWidth, node.width() * scaleX);
    let newHeight = Math.max(template.minHeight, node.height() * scaleY);
    let newX = node.x();
    let newY = node.y();
    let newRotation = node.rotation();

    if (grid.snap) {
      newWidth = snapToGrid(newWidth);
      newHeight = snapToGrid(newHeight);
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);
      newRotation = Math.round(newRotation / 15) * 15;
    }

    onChange({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      rotation: newRotation
    });
  };

  const handleClick = (evt: KonvaEventObject<MouseEvent, Node<NodeConfig>>) => {
    onSelect(evt);
  };

  const handleTap = (evt: KonvaEventObject<Event, Node<NodeConfig>>) => {
    const syntheticEvent = {
      ...evt,
      evt: new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
    } as KonvaEventObject<MouseEvent, Node<NodeConfig>>;
    
    onSelect(syntheticEvent);
  };

  return (
    <>
      <Group
        draggable={!element.isLocked}
        onDragStart={onDragStart}
        onDragMove={handleDragMove}
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
          onClick={handleClick}
          onTap={handleTap}
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
            
            let snapBox = { ...newBox };
            if (grid.snap) {
              snapBox.width = snapToGrid(newBox.width);
              snapBox.height = snapToGrid(newBox.height);
              snapBox.x = snapToGrid(newBox.x);
              snapBox.y = snapToGrid(newBox.y);
            }
            
            return {
              ...snapBox,
              width: Math.max(minWidth, snapBox.width),
              height: Math.max(minHeight, snapBox.height)
            };
          }}
          enabledAnchors={template.allowResize ? undefined : []}
          rotateEnabled={template.allowRotate}
          rotationSnaps={grid.snap ? [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180] : []}
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