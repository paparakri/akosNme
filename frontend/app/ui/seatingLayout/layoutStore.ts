// layoutStore.ts
import { create } from 'zustand';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import type { LayoutState, LayoutElement, Point, ElementType } from './types';
import { elementTemplates } from './elementTemplates';

interface LayoutStore extends LayoutState {
  // Element Management
  addElement: (type: ElementType, position: Point) => void;
  updateElement: (id: string, updates: Partial<LayoutElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  
  // Selection Management
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Grid & Snap
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  toggleSnap: () => void;
  
  // Viewport Control
  setScale: (scale: number) => void;
  setPosition: (position: Point) => void;
  resetView: () => void;
  
  // History Management
  undo: () => void;
  redo: () => void;
  
  // Tool Selection
  setActiveTool: (tool: string) => void;
  
  // Layout Management
  loadLayout: (elements: LayoutElement[]) => void;
  clearLayout: () => void;
  lockElement: (id: string) => void;
  unlockElement: (id: string) => void;
}

const initialState: LayoutState = {
  elements: [],
  selectedIds: [],
  hoveredId: null,
  grid: {
    size: 20,
    enabled: true,
    snap: true,
    subdivisions: 2
  },
  viewport: {
    scale: 1,
    position: { x: 0, y: 0 },
    rotation: 0
  },
  guides: [],
  activeTool: 'select',
  history: {
    past: [],
    present: [],
    future: []
  }
};

export const useLayoutStore = create<LayoutStore>()((set, get) => ({
  ...initialState,
  
  // Element Management
  addElement: (type, position) => {
    const template = elementTemplates[type];
    const newElement: LayoutElement = {
      id: nanoid(),
      type,
      name: `${template.name} ${get().elements.length + 1}`,
      x: position.x,
      y: position.y,
      width: template.defaultWidth,
      height: template.defaultHeight,
      rotation: 0,
      style: template.style,
      minWidth: template.minWidth,
      minHeight: template.minHeight,
      capacity: template.defaultCapacity
    };
    
    set(produce((state: LayoutState) => {
      state.elements.push(newElement);
      state.selectedIds = [newElement.id];
      state.history.past.push([...state.elements]);
      state.history.future = [];
    }));
  },
  
  updateElement: (id, updates) => {
    set(produce((state: LayoutState) => {
      const index = state.elements.findIndex(el => el.id === id);
      if (index !== -1) {
        state.elements[index] = { ...state.elements[index], ...updates };
        state.history.past.push([...state.elements]);
        state.history.future = [];
      }
    }));
  },
  
  deleteElement: (id) => {
    set(produce((state: LayoutState) => {
      state.elements = state.elements.filter(el => el.id !== id);
      state.selectedIds = state.selectedIds.filter(selectedId => selectedId !== id);
      state.history.past.push([...state.elements]);
      state.history.future = [];
    }));
  },
  
  duplicateElement: (id) => {
    const element = get().elements.find(el => el.id === id);
    if (!element) return;
    
    const newElement: LayoutElement = {
      ...element,
      id: nanoid(),
      name: `${element.name} (Copy)`,
      x: element.x + 20,
      y: element.y + 20
    };
    
    set(produce((state: LayoutState) => {
      state.elements.push(newElement);
      state.selectedIds = [newElement.id];
      state.history.past.push([...state.elements]);
      state.history.future = [];
    }));
  },
  
  // Selection Management
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  
  // Grid & Snap
  toggleGrid: () => set(state => ({ grid: { ...state.grid, enabled: !state.grid.enabled } })),
  setGridSize: (size) => set(state => ({ grid: { ...state.grid, size } })),
  toggleSnap: () => set(state => ({ grid: { ...state.grid, snap: !state.grid.snap } })),
  
  // Viewport Control
  setScale: (scale) => set(state => ({ viewport: { ...state.viewport, scale } })),
  setPosition: (position) => set(state => ({ viewport: { ...state.viewport, position } })),
  resetView: () => set({ viewport: initialState.viewport }),
  
  // History Management
  undo: () => {
    const { past, present, future } = get().history;
    if (past.length === 0) return;
    
    set(produce((state: LayoutState) => {
      const previous = past[past.length - 1];
      state.history.past = past.slice(0, -1);
      state.history.future = [present, ...future];
      state.elements = previous;
    }));
  },
  
  redo: () => {
    const { past, present, future } = get().history;
    if (future.length === 0) return;
    
    set(produce((state: LayoutState) => {
      const next = future[0];
      state.history.past = [...past, present];
      state.history.future = future.slice(1);
      state.elements = next;
    }));
  },
  
  // Tool Selection
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  // Layout Management
  loadLayout: (elements) => set({ elements, selectedIds: [], history: { past: [], present: elements, future: [] } }),
  clearLayout: () => set({ ...initialState }),
  lockElement: (id) => set(produce((state: LayoutState) => {
    const element = state.elements.find(el => el.id === id);
    if (element) element.isLocked = true;
  })),
  unlockElement: (id) => set(produce((state: LayoutState) => {
    const element = state.elements.find(el => el.id === id);
    if (element) element.isLocked = false;
  }))
}));