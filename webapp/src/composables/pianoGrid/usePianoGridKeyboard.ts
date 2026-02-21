import { onMounted, onBeforeUnmount, type Ref, type ComputedRef } from "vue";

export interface KeyboardActions {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onEscape: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onMoveSelection: (dx: number, dy: number) => void;
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

    // Arrow keys with modifiers for moving selection
    if (selectedNotes.value.size > 0) {
      const isArrowKey = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key);

      if (isArrowKey && (event.shiftKey || event.ctrlKey || event.metaKey)) {
        event.preventDefault();

        // Ctrl/Cmd + Arrow: move by octave (12 semitones) vertically
        if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
          if (event.key === "ArrowUp") {
            actions.onMoveSelection(0, -12);
          } else if (event.key === "ArrowDown") {
            actions.onMoveSelection(0, 12);
          }
          return;
        }

        // Shift + Arrow: move by 1 step
        if (event.shiftKey && !event.ctrlKey && !event.metaKey) {
          switch (event.key) {
            case "ArrowUp":
              actions.onMoveSelection(0, -1);
              break;
            case "ArrowDown":
              actions.onMoveSelection(0, 1);
              break;
            case "ArrowLeft":
              actions.onMoveSelection(-1, 0);
              break;
            case "ArrowRight":
              actions.onMoveSelection(1, 0);
              break;
          }
          return;
        }
      }
    }
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
}
