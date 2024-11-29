// types.ts
export interface Point {
    x: number;
    y: number;
  }
  
  export interface Size {
    width: number;
    height: number;
  }
  
  export interface LayoutElement extends Point, Size {
    id: string;
    type: ElementType;
    name: string;
    rotation: number;
    isLocked?: boolean;
    isSelected?: boolean;
    minWidth?: number;
    minHeight?: number;
    capacity?: number;
    isReserved?: boolean;
    customProps?: Record<string, any>;
    style?: {
      fill: string;
      stroke: string;
      opacity?: number;
    };
  }
  
  export type ElementType = 'table' | 'booth' | 'bar' | 'stage' | 'vipArea' | 'danceFloor' | 'entrance' | 'exit' | 'service' | 'custom';
  
  export interface LayoutHistory {
    past: LayoutElement[][];
    present: LayoutElement[];
    future: LayoutElement[][];
  }
  
  export interface LayoutGrid {
    size: number;
    enabled: boolean;
    snap: boolean;
    subdivisions: number;
  }
  
  export interface ViewportState {
    scale: number;
    position: Point;
    rotation: number;
  }
  
  export interface LayoutGuide {
    id: string;
    type: 'horizontal' | 'vertical';
    position: number;
    color?: string;
  }
  
  export interface LayoutState {
    elements: LayoutElement[];
    selectedIds: string[];
    hoveredId: string | null;
    grid: LayoutGrid;
    viewport: ViewportState;
    guides: LayoutGuide[];
    activeTool: string;
    history: LayoutHistory;
  }
  
  export interface ElementTemplate {
    type: ElementType;
    name: string;
    icon: string;
    defaultWidth: number;
    defaultHeight: number;
    minWidth: number;
    minHeight: number;
    defaultCapacity?: number;
    allowResize?: boolean;
    allowRotate?: boolean;
    snapPoints?: Point[];
    style: {
      fill: string;
      stroke: string;
    };
  }