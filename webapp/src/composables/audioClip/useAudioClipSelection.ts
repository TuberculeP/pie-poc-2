import { ref, computed } from "vue";
import type { AudioClip } from "../../lib/utils/types";

export interface SelectionRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function useAudioClipSelection(
  clips: () => AudioClip[],
  colWidth: () => number,
  gridWidth: () => number,
  gridHeight: () => number,
) {
  const selectedClipIds = ref<Set<string>>(new Set());
  const selectionRect = ref<SelectionRect | null>(null);
  const justFinishedSelecting = ref(false);

  const isSelecting = computed(() => selectionRect.value !== null);

  const selectionRectStyle = computed(() => {
    if (!selectionRect.value) return null;
    const { startX, startY, currentX, currentY } = selectionRect.value;
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  });

  const handleSelectionStart = (event: MouseEvent, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    selectionRect.value = { startX: x, startY: y, currentX: x, currentY: y };

    const handleMove = (e: MouseEvent) => {
      if (!selectionRect.value) return;
      const r = container.getBoundingClientRect();
      const mx = Math.max(0, Math.min(e.clientX - r.left, gridWidth()));
      const my = Math.max(0, Math.min(e.clientY - r.top, gridHeight()));
      selectionRect.value.currentX = mx;
      selectionRect.value.currentY = my;
    };

    const handleEnd = () => {
      if (selectionRect.value) {
        const { startX, currentX } = selectionRect.value;
        const left = Math.min(startX, currentX);
        const right = Math.max(startX, currentX);

        const colLeft = left / colWidth();
        const colRight = right / colWidth();

        for (const clip of clips()) {
          const clipLeft = clip.x;
          const clipRight = clip.x + clip.w;

          const overlaps = clipLeft < colRight && clipRight > colLeft;

          if (overlaps) {
            selectedClipIds.value.add(clip.id);
          }
        }
        justFinishedSelecting.value = true;
      }
      selectionRect.value = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
  };

  const selectClip = (clipId: string, event: MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      if (selectedClipIds.value.has(clipId)) {
        selectedClipIds.value.delete(clipId);
      } else {
        selectedClipIds.value.add(clipId);
      }
    } else if (!selectedClipIds.value.has(clipId)) {
      selectedClipIds.value.clear();
      selectedClipIds.value.add(clipId);
    }
  };

  const clearSelection = () => {
    selectedClipIds.value.clear();
  };

  const removeFromSelection = (clipId: string) => {
    selectedClipIds.value.delete(clipId);
  };

  return {
    selectedClipIds,
    selectionRect,
    isSelecting,
    selectionRectStyle,
    justFinishedSelecting,
    handleSelectionStart,
    selectClip,
    clearSelection,
    removeFromSelection,
  };
}
