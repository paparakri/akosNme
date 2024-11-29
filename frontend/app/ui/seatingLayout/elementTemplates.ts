// elementTemplates.ts
import { ElementTemplate } from './types';

export const elementTemplates: Record<string, ElementTemplate> = {
  table: {
    type: 'table',
    name: 'Table',
    icon: '🪑',
    defaultWidth: 80,
    defaultHeight: 80,
    minWidth: 40,
    minHeight: 40,
    defaultCapacity: 4,
    allowResize: true,
    allowRotate: true,
    style: {
      fill: 'rgba(147, 51, 234, 0.2)',
      stroke: 'rgba(147, 51, 234, 0.5)',
    }
  },
  booth: {
    type: 'booth',
    name: 'Booth',
    icon: '🛋️',
    defaultWidth: 120,
    defaultHeight: 100,
    minWidth: 60,
    minHeight: 60,
    defaultCapacity: 6,
    allowResize: true,
    allowRotate: true,
    style: {
      fill: 'rgba(59, 130, 246, 0.2)',
      stroke: 'rgba(59, 130, 246, 0.5)',
    }
  },
  bar: {
    type: 'bar',
    name: 'Bar',
    icon: '🍸',
    defaultWidth: 200,
    defaultHeight: 60,
    minWidth: 100,
    minHeight: 40,
    allowResize: true,
    allowRotate: true,
    style: {
      fill: 'rgba(234, 179, 8, 0.2)',
      stroke: 'rgba(234, 179, 8, 0.5)',
    }
  },
  stage: {
    type: 'stage',
    name: 'Stage',
    icon: '🎭',
    defaultWidth: 200,
    defaultHeight: 150,
    minWidth: 100,
    minHeight: 100,
    allowResize: true,
    allowRotate: true,
    style: {
      fill: 'rgba(236, 72, 153, 0.2)',
      stroke: 'rgba(236, 72, 153, 0.5)',
    }
  },
  danceFloor: {
    type: 'danceFloor',
    name: 'Dance Floor',
    icon: '💃',
    defaultWidth: 200,
    defaultHeight: 200,
    minWidth: 100,
    minHeight: 100,
    allowResize: true,
    allowRotate: true,
    style: {
      fill: 'rgba(244, 63, 94, 0.2)',
      stroke: 'rgba(244, 63, 94, 0.5)',
    }
  },
  entrance: {
    type: 'entrance',
    name: 'Entrance',
    icon: '🚪',
    defaultWidth: 60,
    defaultHeight: 20,
    minWidth: 40,
    minHeight: 20,
    allowResize: true,
    allowRotate: true,
    style: {
      fill: 'rgba(34, 197, 94, 0.2)',
      stroke: 'rgba(34, 197, 94, 0.5)',
    }
  },
  vipArea: {
    type: 'vipArea',
    name: 'VIP Area',
    icon: '👑',
    defaultWidth: 200,
    defaultHeight: 200,
    minWidth: 100,
    minHeight: 100,
    allowResize: true,
    allowRotate: true,
    style: {
      fill: 'rgba(168, 85, 247, 0.2)',
      stroke: 'rgba(168, 85, 247, 0.5)',
    }
  }
};