import { defineStore } from 'pinia';

export interface Clip {
    id: string;
    trackId: string;
    start: number;    // en secondes ou en mesures
    duration: number; // idem
}

export interface Track {
    id: string;
    name: string;
}

export const useTimelineStore = defineStore('timeline', {
    state: () => ({
        tracks: [] as Track[],
        clips: [] as Clip[],
        playhead: 0,
    }),
    actions: {
        addTrack(name: string) {
        this.tracks.push({ id: Date.now().toString(), name });
        },
        addClip(clip: Clip) {
        this.clips.push(clip);
        },
        moveClip(id: string, newStart: number) {
        const c = this.clips.find(c => c.id === id);
        if (c) c.start = newStart;
        },
        setPlayhead(position: number) {
        this.playhead = position;
        }
    }
});