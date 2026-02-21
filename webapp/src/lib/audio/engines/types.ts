import type { InstrumentConfig, NoteName } from "../../utils/types";

export type EngineState = "idle" | "loading" | "ready" | "error";

export type EngineStateCallback = (state: EngineState) => void;

export interface InstrumentEngine {
  readonly type: string;
  readonly config: InstrumentConfig;

  readonly state: EngineState;

  onStateChange(callback: EngineStateCallback): () => void;

  preload(): Promise<void>;

  playNote(noteName: NoteName, noteId: string, velocity?: number): void;
  stopNote(noteId: string): void;
  stopAllNotes(): void;

  updateConfig(config: Partial<InstrumentConfig>): void;

  dispose(): void;
}

export interface InstrumentEngineConstructor {
  new (
    audioContext: AudioContext,
    destination: AudioNode,
    config: InstrumentConfig,
  ): InstrumentEngine;
}
