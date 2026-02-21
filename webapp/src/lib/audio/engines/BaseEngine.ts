import type { InstrumentConfig, NoteName } from "../../utils/types";
import type {
  EngineState,
  EngineStateCallback,
  InstrumentEngine,
} from "./types";

export abstract class BaseEngine implements InstrumentEngine {
  abstract readonly type: string;
  config: InstrumentConfig;

  protected _state: EngineState = "idle";
  protected stateCallbacks: Set<EngineStateCallback> = new Set();

  protected audioContext: AudioContext;
  protected destination: AudioNode;

  constructor(
    audioContext: AudioContext,
    destination: AudioNode,
    config: InstrumentConfig,
  ) {
    this.audioContext = audioContext;
    this.destination = destination;
    this.config = config;
  }

  get state(): EngineState {
    return this._state;
  }

  protected setState(newState: EngineState): void {
    if (this._state === newState) return;
    this._state = newState;
    this.stateCallbacks.forEach((cb) => cb(newState));
  }

  onStateChange(callback: EngineStateCallback): () => void {
    this.stateCallbacks.add(callback);
    return () => this.stateCallbacks.delete(callback);
  }

  abstract preload(): Promise<void>;
  abstract playNote(
    noteName: NoteName,
    noteId: string,
    velocity?: number,
  ): void;
  abstract stopNote(noteId: string): void;
  abstract stopAllNotes(): void;
  abstract updateConfig(config: Partial<InstrumentConfig>): void;
  abstract dispose(): void;
}
