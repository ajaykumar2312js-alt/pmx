import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { GripVertical } from 'lucide-react';
import styles from './DragDrop.module.css';

export interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const SortableItem = ({ id, children, className }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(styles.sortableItem, { [styles.dragging]: isDragging }, className)}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners} aria-label="Drag handle">
        <GripVertical size={16} />
      </div>
      {children}
    </div>
  );
};

export interface SortableListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  className?: string;
}

export function SortableList<T>({ items, keyExtractor, onReorder, renderItem, className }: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => keyExtractor(item) === active.id);
      const newIndex = items.findIndex(item => keyExtractor(item) === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  const ids = items.map(keyExtractor);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item) => (
            <SortableItem key={keyExtractor(item)} id={keyExtractor(item)}>
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
