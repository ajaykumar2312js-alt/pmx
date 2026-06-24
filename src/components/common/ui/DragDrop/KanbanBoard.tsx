// A simplified multi-container DnD wrapper based on @dnd-kit
import React from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableList';

export interface BoardColumn<T> {
  id: string;
  title: string;
  items: T[];
}

interface KanbanBoardProps<T> {
  columns: BoardColumn<T>[];
  keyExtractor: (item: T) => string;
  onMove: (itemId: string, fromColId: string, toColId: string, newIndex: number) => void;
  renderCard: (item: T) => React.ReactNode;
  renderColumn?: (column: BoardColumn<T>, children: React.ReactNode) => React.ReactNode;
  appendContent?: React.ReactNode;
}

export function KanbanBoard<T>({ columns, keyExtractor, onMove, renderCard, renderColumn, appendContent }: KanbanBoardProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // We leave actual cross-column logic out of this wrapper and just notify parent,
    // but typically you'd calculate exact target column and index.
    // For simplicity, we assume over.id is either a column id or an item id.
    const activeId = String(active.id);
    const overId = String(over.id);

    // Find source column
    const fromCol = columns.find(c => c.items.some(i => keyExtractor(i) === activeId));
    
    // Find target column (if hovered over item, get its col)
    let toCol = columns.find(c => c.id === overId);
    if (!toCol) {
      toCol = columns.find(c => c.items.some(i => keyExtractor(i) === overId));
    }

    if (fromCol && toCol) {
      let newIndex = toCol.items.length;
      if (toCol.id !== overId) {
        newIndex = toCol.items.findIndex(i => keyExtractor(i) === overId);
      }
      onMove(activeId, fromCol.id, toCol.id, newIndex);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '16px 0' }}>
        {columns.map((col) => {
          const content = (
            <SortableContext key={col.id} id={col.id} items={col.items.map(keyExtractor)} strategy={verticalListSortingStrategy}>
              <div style={{ minHeight: '200px' }}>
                {col.items.map((item) => (
                  <SortableItem key={keyExtractor(item)} id={keyExtractor(item)}>
                    {renderCard(item)}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          );

          if (renderColumn) {
            return renderColumn(col, content);
          }

          return (
            <div key={col.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', minWidth: '300px' }}>
              <h3 style={{ margin: '0 0 16px 0' }}>{col.title}</h3>
              {content}
            </div>
          );
        })}
        {appendContent}
      </div>
    </DndContext>
  );
}
