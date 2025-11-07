import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../lib/utils/apiClient";
import type { MidiNote, NoteName } from "../lib/utils/types";

export const useProjectStore = defineStore("project", () => {
  const isSaving = ref(false);
  const currentProjectId = ref<string | null>(null); // ID du projet actuellement chargé
  const hasUnsavedChanges = ref(false); // Changements non sauvegardés
  const lastSavedState = ref<string | null>(null); // Hash de la dernière sauvegarde

  // Structure JSON complète du projet musical
  const generateProjectData = (
    layout: MidiNote[],
    tempo: number,
    cols: number,
    notes: NoteName[],
    enableKeyboardSimulation: boolean,
  ) => {
    return {
      project: {
        metadata: {
          id: crypto.randomUUID(),
          name: "Mon Projet Musical",
          description: "Projet créé avec BloopNoteSequencer",
          version: "2.0.0",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: "user-placeholder",
          tags: ["sequencer", "demo"],
          bpm: tempo,
          key: "C",
          scale: "major",
          time_signature: {
            numerator: 4,
            denominator: 4,
          },
          sample_rate: 44100,
          bit_depth: 24,
          duration_bars: cols / 4,
        },

        timeline: {
          global_settings: {
            snap_to_grid: true,
            grid_resolution: "1/16",
            loop_start: 0,
            loop_end: cols,
            punch_in: null,
            punch_out: null,
          },
          markers: [
            {
              id: "marker-1",
              name: "Début",
              position: 0,
              color: "#ff6b6b",
              type: "section",
            },
          ],
          time_stretching: {
            enabled: true,
            algorithm: "elastique_pro",
            preserve_formants: true,
          },
        },

        tracks: [
          {
            id: "track-sequencer",
            name: "Séquenceur Principal",
            type: "instrument",
            color: "#66b3ff",
            position: 0,
            enabled: true,
            solo: false,
            mute: false,
            record_armed: false,

            routing: {
              input: {
                source: "none",
                channel: null,
                stereo_link: true,
              },
              output: {
                destination: "master",
                channel: "1-2",
                pre_fader_sends: [],
                post_fader_sends: [],
              },
            },

            mixer: {
              volume: {
                value: -6.0,
                automation: { enabled: false, points: [] },
              },
              pan: {
                value: 0.0,
                law: "-3dB",
                automation: { enabled: false, points: [] },
              },
            },

            effects: [],

            clips: [
              {
                id: "clip-sequencer",
                name: "Séquence MIDI",
                start_position: 0,
                end_position: cols,
                midi: {
                  notes: layout.map((note) => ({
                    ...note,
                    velocity: 100,
                    note: notes[note.y] || "C4",
                  })),
                  cc_automation: [],
                },
              },
            ],
          },
        ],

        folders: [],
        buses: [],

        master: {
          mixer: {
            volume: { value: 0.0, automation: { enabled: false, points: [] } },
            pan: {
              value: 0.0,
              law: "-3dB",
              automation: { enabled: false, points: [] },
            },
          },
          effects: [],
        },

        current_state: {
          sequencer: {
            layout,
            tempo,
            cols,
            notes_config: notes,
            active_instrument: "Basic",
            keyboard_simulation: enableKeyboardSimulation,
          },
        },
      },
    };
  };

  // Sauvegarder un projet en ligne (CREATE ou UPDATE selon le contexte)
  const saveProjectOnline = async (
    layout: MidiNote[],
    tempo: number,
    cols: number,
    notes: NoteName[],
    enableKeyboardSimulation: boolean,
  ): Promise<{ success: boolean; error?: string; projectId?: string }> => {
    if (isSaving.value) {
      return { success: false, error: "Sauvegarde déjà en cours" };
    }

    isSaving.value = true;

    try {
      const projectData = generateProjectData(
        layout,
        tempo,
        cols,
        notes,
        enableKeyboardSimulation,
      );

      let result;
      let isUpdate = false;

      if (currentProjectId.value) {
        // UPDATE : Le projet existe déjà
        isUpdate = true;
        result = await apiClient.put<{ body: any }>(
          `/app/projects/${currentProjectId.value}`,
          {
            name: "Mon Projet Musical",
            description: "Projet créé avec BloopNoteSequencer",
            data: projectData,
          },
        );
      } else {
        // CREATE : Nouveau projet
        result = await apiClient.post<{ body: any }>("/app/projects", {
          name: "Mon Projet Musical",
          description: "Projet créé avec BloopNoteSequencer",
          data: projectData,
        });
      }

      const { data, error } = result;

      if (error) {
        throw new Error(error);
      }

      // Si c'est une création, sauvegarder le nouvel ID
      if (!isUpdate && data?.body?.id) {
        currentProjectId.value = data.body.id;
      }

      // Marquer comme sauvegardé et sauvegarder l'état actuel
      hasUnsavedChanges.value = false;
      lastSavedState.value = JSON.stringify({
        layout,
        tempo,
        cols,
        enableKeyboardSimulation,
      });

      // eslint-disable-next-line no-console
      console.log(
        `✅ Projet ${isUpdate ? "mis à jour" : "créé"} en ligne avec succès:`,
        data,
      );

      return {
        success: true,
        projectId: currentProjectId.value || undefined,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("❌ Erreur lors de la sauvegarde en ligne:", error);
      return {
        success: false,
        error:
          "Erreur lors de la sauvegarde en ligne. Vérifiez votre connexion.",
      };
    } finally {
      isSaving.value = false;
    }
  };

  // Récupérer tous les projets de l'utilisateur
  const getProjects = async () => {
    try {
      const { data, error } = await apiClient.get<{ body: any[] }>(
        "/app/projects",
      );

      if (error) {
        throw new Error(error);
      }

      return { success: true, data: data?.body || [] };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("❌ Erreur lors de la récupération des projets:", error);
      return {
        success: false,
        error: "Erreur lors de la récupération des projets.",
      };
    }
  };

  // Récupérer un projet spécifique
  const getProject = async (id: string) => {
    try {
      const { data, error } = await apiClient.get<{ body: any }>(
        `/app/projects/${id}`,
      );

      if (error) {
        throw new Error(error);
      }

      return { success: true, data: data?.body };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("❌ Erreur lors de la récupération du projet:", error);
      return {
        success: false,
        error: "Erreur lors de la récupération du projet.",
      };
    }
  };

  // Charger un projet et appliquer ses données au séquenceur
  const loadProjectToSequencer = async (
    projectId: string,
    layout: any,
    tempo: any,
    enableKeyboardSimulation: any,
    nextNoteId: any,
    cols: number,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await getProject(projectId);

      if (result.success && result.data) {
        const projectData = result.data.data;
        const sequencerState = projectData?.project?.current_state?.sequencer;

        if (sequencerState) {
          // Charger les données du séquenceur
          layout.value = sequencerState.layout || [];
          tempo.value = sequencerState.tempo || 120;
          enableKeyboardSimulation.value =
            sequencerState.keyboard_simulation ?? true;

          // Mettre à jour nextNoteId pour éviter les conflits
          const maxId = Math.max(
            0,
            ...layout.value
              .map((note: any) => parseInt(note.i.replace(/\D/g, "")))
              .filter((id: number) => !isNaN(id)),
          );
          nextNoteId.value = maxId + 1;

          // Sauvegarder l'ID du projet actuellement chargé
          currentProjectId.value = projectId;

          // Marquer comme sauvegardé et sauvegarder l'état chargé
          hasUnsavedChanges.value = false;
          lastSavedState.value = JSON.stringify({
            layout: layout.value,
            tempo: tempo.value,
            cols,
            enableKeyboardSimulation: enableKeyboardSimulation.value,
          });

          // eslint-disable-next-line no-console
          console.log("✅ Projet chargé depuis l'URL:", projectId);
          return { success: true };
        }
      }

      return {
        success: false,
        error: result.error || "Projet non trouvé",
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("❌ Erreur lors du chargement du projet:", error);
      return {
        success: false,
        error: "Erreur lors du chargement du projet.",
      };
    }
  };

  // Fonction pour créer un nouveau projet (reset currentProjectId)
  const createNewProject = () => {
    currentProjectId.value = null;
    hasUnsavedChanges.value = false;
    lastSavedState.value = null;
  };

  // Fonction pour détecter les changements
  const checkForChanges = (
    layout: MidiNote[],
    tempo: number,
    cols: number,
    enableKeyboardSimulation: boolean,
  ) => {
    const currentState = JSON.stringify({
      layout,
      tempo,
      cols,
      enableKeyboardSimulation,
    });

    if (lastSavedState.value && currentState !== lastSavedState.value) {
      hasUnsavedChanges.value = true;
    } else if (!lastSavedState.value && (layout.length > 0 || tempo !== 120)) {
      // Nouveau projet avec des modifications par rapport à l'état initial
      hasUnsavedChanges.value = true;
    }
  };

  // Fonction pour confirmer l'abandon des changements
  const confirmUnsavedChanges = (): boolean => {
    if (!hasUnsavedChanges.value) return true;

    return window.confirm(
      "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir continuer ? Les changements seront perdus.",
    );
  };

  return {
    isSaving,
    currentProjectId,
    hasUnsavedChanges,
    saveProjectOnline,
    getProjects,
    getProject,
    generateProjectData,
    loadProjectToSequencer,
    createNewProject,
    checkForChanges,
    confirmUnsavedChanges,
  };
});
