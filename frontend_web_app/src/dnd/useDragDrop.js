import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * useDragDrop
 * Simple HTML5 drag-and-drop utilities for WanderPlan.
 *
 * Data payload schema placed into DataTransfer:
 * {
 *   activityId: string,
 *   source: "pool" | `day:${dayId}`,
 *   index: number
 * }
 *
 * Provided helpers:
 * - buildDragPayload({ activityId, source, index }): string
 * - useDraggable({ payload, getPreviewText? }): props for draggable elements
 * - useDropZone({ onDrop, accepts? }): props for droppable areas
 * - constants: MIME
 */

/** Internal custom MIME type to avoid clashing with other payloads */
const MIME = 'application/vnd-wanderplan.activity+json';

/**
 * Build a stringified payload for dataTransfer using our schema.
 */
export function buildDragPayload({ activityId, source, index }) {
  return JSON.stringify({ activityId, source, index });
}

/**
 * PUBLIC_INTERFACE
 * useDraggable
 * Returns props for a draggable element. It sets:
 * - draggable
 * - onDragStart: writes payload to dataTransfer
 * - onDragEnd: resets dragging state
 * Optional: getPreviewText(payloadObj) -> string (sets text/plain)
 */
export function useDraggable({ payload, getPreviewText }) {
  const dataRef = useRef(payload);
  const [isDragging, setDragging] = useState(false);

  const setPayload = useCallback((p) => {
    dataRef.current = p;
  }, []);

  const onDragStart = useCallback((e) => {
    const current = dataRef.current;
    if (!current) return;
    const json = typeof current === 'string' ? current : JSON.stringify(current);
    try {
      e.dataTransfer.setData(MIME, json);
      e.dataTransfer.effectAllowed = 'move';
      // also set text/plain for accessibility and some browsers
      const text = getPreviewText ? getPreviewText(current) : 'Move activity';
      e.dataTransfer.setData('text/plain', text);
    } catch {
      // ignore
    }
    setDragging(true);
  }, [getPreviewText]);

  const onDragEnd = useCallback(() => {
    setDragging(false);
  }, []);

  const draggableProps = useMemo(() => ({
    draggable: true,
    onDragStart,
    onDragEnd,
    // ARIA: indicate dragged
    'aria-grabbed': isDragging,
    // tabindex so keyboard users can focus and see Move fallback
    tabIndex: 0,
  }), [isDragging, onDragStart, onDragEnd]);

  return { draggableProps, isDragging, setPayload, MIME };
}

/**
 * PUBLIC_INTERFACE
 * useDropZone
 * Returns props for a droppable area.
 * Options:
 * - onDrop: ({ activityId, source, index }) => void
 * - accepts: MIME types array (default [MIME])
 */
export function useDropZone({ onDrop, accepts = [MIME] }) {
  const [isOver, setIsOver] = useState(false);
  const allowDrop = useCallback((e) => {
    const types = Array.from(e.dataTransfer?.types || []);
    const ok = accepts.some(t => types.includes(t));
    if (ok) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsOver(true);
    }
  }, [accepts]);

  const onDragLeave = useCallback(() => setIsOver(false), []);
  const onDropCb = useCallback((e) => {
    setIsOver(false);
    try {
      const raw = e.dataTransfer.getData(MIME);
      if (!raw) return;
      const data = JSON.parse(raw);
      onDrop?.(data);
    } catch {
      // ignore invalid payload
    }
  }, [onDrop]);

  const dropZoneProps = useMemo(() => ({
    onDragOver: allowDrop,
    onDragEnter: allowDrop,
    onDragLeave,
    onDrop: onDropCb,
    // ARIA hints
    role: 'list',
    'aria-dropeffect': 'move',
    'data-dnd-over': isOver ? 'true' : 'false',
  }), [allowDrop, onDragLeave, onDropCb, isOver]);

  return { dropZoneProps, isOver, MIME };
}

export const DND_MIME = MIME;
