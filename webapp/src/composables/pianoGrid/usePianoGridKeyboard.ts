import { onMounted, onBeforeUnmount, type Ref } from "vue";

export interface KeyboardActions {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onEscape: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
}

export function usePianoGridKeyboard(
  selectedNotes: Ref<Set<string>>,
  actions: KeyboardActions,
) {
  const handleKeydown = (event: KeyboardEvent) => {
    // Undo: Ctrl/Cmd + Z (without Shift)
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "z" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      actions.onUndo();
      return;
    }

    // Redo: Ctrl/Cmd + Shift + Z OR Ctrl/Cmd + Y
    if (
      ((event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "z") ||
      ((event.ctrlKey || event.metaKey) && event.key === "y")
    ) {
      event.preventDefault();
      actions.onRedo();
      return;
    }

    // Delete/Backspace: delete selected notes
    if (
      (event.key === "Delete" || event.key === "Backspace") &&
      selectedNotes.value.size > 0
    ) {
      event.preventDefault();
      actions.onDelete();
      return;
    }

    // Escape: clear selection
    if (event.key === "Escape") {
      actions.onEscape();
      return;
    }

    // Ctrl/Cmd + C: copy
    if ((event.ctrlKey || event.metaKey) && event.key === "c") {
      event.preventDefault();
      actions.onCopy();
      return;
    }

    // Ctrl/Cmd + V: paste
    if ((event.ctrlKey || event.metaKey) && event.key === "v") {
      event.preventDefault();
      actions.onPaste();
      return;
    }

    // Ctrl/Cmd + D: duplicate
    if ((event.ctrlKey || event.metaKey) && event.key === "d") {
      event.preventDefault();
      actions.onDuplicate();
      return;
    }
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
}
