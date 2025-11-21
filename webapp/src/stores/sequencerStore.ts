import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type { Sequence, SequencerProject, MidiNote, LegacySequenceData } from "../lib/utils/types";

const STORAGE_KEY = "bloop-sequencer-project";
const DEFAULT_COLS = 64;
const DEFAULT_TEMPO = 120;

export const useSequencerStore = defineStore("sequencerStore", () => {
  // État du projet
  const project = ref<SequencerProject>({
    sequences: [],
    activeSequenceId: null,
    projectName: "Mon Projet",
    version: "2.0",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Computed pour la séquence active
  const activeSequence = computed<Sequence | null>(() => {
    if (!project.value.activeSequenceId) return null;
    return project.value.sequences.find(
      (seq) => seq.id === project.value.activeSequenceId
    ) || null;
  });

  // Computed pour les propriétés de la séquence active (compatibilité avec le composant existant)
  const layout = computed<MidiNote[]>({
    get: () => activeSequence.value?.layout || [],
    set: (newLayout: MidiNote[]) => {
      if (activeSequence.value) {
        activeSequence.value.layout = newLayout;
        activeSequence.value.updatedAt = new Date();
        project.value.updatedAt = new Date();
      }
    }
  });

  const tempo = computed<number>({
    get: () => activeSequence.value?.tempo || DEFAULT_TEMPO,
    set: (newTempo: number) => {
      if (activeSequence.value) {
        activeSequence.value.tempo = newTempo;
        activeSequence.value.updatedAt = new Date();
        project.value.updatedAt = new Date();
      }
    }
  });

  const cols = computed<number>(() => activeSequence.value?.cols || DEFAULT_COLS);

  // Générer un ID unique
  const generateId = (): string => {
    return `seq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Générer un ID unique pour une note
  const generateNoteId = (sequenceId: string): string => {
    return `${sequenceId}_note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  };

  // Générer un nom unique pour une nouvelle séquence
  const generateSequenceName = (): string => {
    const baseName = "Séquence";
    let counter = 1;
    let name = `${baseName} ${counter}`;
    
    while (project.value.sequences.some(seq => seq.name === name)) {
      counter++;
      name = `${baseName} ${counter}`;
    }
    
    return name;
  };

  // Créer une nouvelle séquence
  const createSequence = (name?: string): string => {
    const newSequence: Sequence = {
      id: generateId(),
      name: name || generateSequenceName(),
      layout: [],
      tempo: DEFAULT_TEMPO,
      cols: DEFAULT_COLS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    project.value.sequences.push(newSequence);
    project.value.activeSequenceId = newSequence.id;
    project.value.updatedAt = new Date();

    return newSequence.id;
  };

  // Supprimer une séquence
  const deleteSequence = (sequenceId: string): boolean => {
    const index = project.value.sequences.findIndex(seq => seq.id === sequenceId);
    if (index === -1) return false;

    project.value.sequences.splice(index, 1);

    // Si c'était la séquence active, sélectionner une autre ou null
    if (project.value.activeSequenceId === sequenceId) {
      if (project.value.sequences.length > 0) {
        project.value.activeSequenceId = project.value.sequences[0].id;
      } else {
        project.value.activeSequenceId = null;
      }
    }

    project.value.updatedAt = new Date();
    return true;
  };

  // Renommer une séquence
  const renameSequence = (sequenceId: string, newName: string): boolean => {
    const sequence = project.value.sequences.find(seq => seq.id === sequenceId);
    if (!sequence) return false;

    sequence.name = newName;
    sequence.updatedAt = new Date();
    project.value.updatedAt = new Date();
    return true;
  };

  // Dupliquer une séquence
  const duplicateSequence = (sequenceId: string): string | null => {
    const sequence = project.value.sequences.find(seq => seq.id === sequenceId);
    if (!sequence) return null;

    const newSequence: Sequence = {
      id: generateId(),
      name: `${sequence.name} (copie)`,
      layout: JSON.parse(JSON.stringify(sequence.layout)), // Deep copy
      tempo: sequence.tempo,
      cols: sequence.cols,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    project.value.sequences.push(newSequence);
    project.value.updatedAt = new Date();
    return newSequence.id;
  };

  // Changer la séquence active
  const setActiveSequence = (sequenceId: string | null): boolean => {
    if (sequenceId === null) {
      project.value.activeSequenceId = null;
      return true;
    }

    const sequence = project.value.sequences.find(seq => seq.id === sequenceId);
    if (!sequence) return false;

    project.value.activeSequenceId = sequenceId;
    return true;
  };

  // Réorganiser les séquences
  const reorderSequences = (fromIndex: number, toIndex: number): boolean => {
    if (fromIndex < 0 || toIndex < 0 || 
        fromIndex >= project.value.sequences.length || 
        toIndex >= project.value.sequences.length) {
      return false;
    }

    const [removed] = project.value.sequences.splice(fromIndex, 1);
    project.value.sequences.splice(toIndex, 0, removed);
    project.value.updatedAt = new Date();
    return true;
  };

  // Sauvegarder dans localStorage
  const saveToLocalStorage = (): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project.value));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde locale:", error);
    }
  };

  // Charger depuis localStorage
  const loadFromLocalStorage = (): boolean => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;

      const data = JSON.parse(saved) as SequencerProject;
      
      // Validation basique
      if (!data.sequences || !Array.isArray(data.sequences)) return false;

      // Convertir les dates
      data.createdAt = new Date(data.createdAt);
      data.updatedAt = new Date(data.updatedAt);
      data.sequences.forEach(seq => {
        seq.createdAt = new Date(seq.createdAt);
        seq.updatedAt = new Date(seq.updatedAt);
      });

      project.value = data;
      return true;
    } catch (error) {
      console.error("Erreur lors du chargement local:", error);
      return false;
    }
  };

  // Exporter le projet complet
  const exportProject = (): void => {
    const dataStr = JSON.stringify(project.value, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${project.value.projectName.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Importer un projet (supporte l'ancien format et le nouveau)
  const importProject = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(false);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const content = e.target?.result as string;
            const data = JSON.parse(content);

            // Détecter le format
            if (data.sequences && Array.isArray(data.sequences)) {
              // Nouveau format multi-séquences
              loadProjectData(data);
            } else if (data.layout && Array.isArray(data.layout)) {
              // Ancien format single-séquence
              importLegacySequence(data);
            } else {
              throw new Error("Format de fichier non reconnu");
            }

            resolve(true);
          } catch (error) {
            console.error("Erreur lors de l'import:", error);
            alert("Erreur lors du chargement du fichier. Vérifiez le format JSON.");
            resolve(false);
          }
        };

        reader.readAsText(file);
      };

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    });
  };

  // Détecter si c'est un projet avec l'ancien système de notes
  const isLegacyNoteSystem = (sequences: any[]): boolean => {
    // Vérifier si des notes ont des coordonnées Y > 35 (ancien système avait 36 notes max)
    return sequences.some(seq => 
      seq.layout?.some((note: any) => note.y >= 36)
    ) === false && sequences.some(seq => seq.layout?.length > 0);
  };

  // Migration des coordonnées Y de l'ancien système (36 notes) vers le nouveau (87 notes)
  const migrateNoteCoordinates = (oldY: number): number => {
    // Ancien système : C6 à C#3 (36 notes)
    const oldNotes = [
      "C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5", "D5", "C#5", "C5",
      "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4", "E4", "D#4", "D4", "C#4", "C4",
      "B3", "A#3", "A3", "G#3", "G3", "F#3", "F3", "E3", "D#3", "D3", "C#3"
    ];
    
    // Nouveau système : C8 à A0 (87 notes)
    const newNotes = [
      "C8",
      "B7", "A#7", "A7", "G#7", "G7", "F#7", "F7", "E7", "D#7", "D7", "C#7", "C7",
      "B6", "A#6", "A6", "G#6", "G6", "F#6", "F6", "E6", "D#6", "D6", "C#6", "C6",
      "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5", "D5", "C#5", "C5",
      "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4", "E4", "D#4", "D4", "C#4", "C4",
      "B3", "A#3", "A3", "G#3", "G3", "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3",
      "B2", "A#2", "A2", "G#2", "G2", "F#2", "F2", "E2", "D#2", "D2", "C#2", "C2",
      "B1", "A#1", "A1", "G#1", "G1", "F#1", "F1", "E1", "D#1", "D1", "C#1", "C1",
      "B0", "A#0", "A0"
    ];

    // Si l'ancien Y est valide, trouver la note correspondante et sa nouvelle position
    if (oldY >= 0 && oldY < oldNotes.length) {
      const noteName = oldNotes[oldY];
      const newIndex = newNotes.findIndex(n => n === noteName);
      return newIndex >= 0 ? newIndex : oldY; // Fallback vers oldY si pas trouvé
    }
    
    return oldY; // Retourner l'ancienne valeur si hors limites
  };

  // Charger les données d'un projet (fonction publique)
  const loadProjectData = (data: any): void => {
    const newProject: SequencerProject = {
      sequences: data.sequences || [],
      activeSequenceId: data.activeSequenceId || null,
      projectName: data.projectName || "Projet Importé",
      version: data.version || "2.0",
      createdAt: new Date(data.createdAt || new Date()),
      updatedAt: new Date(data.updatedAt || new Date()),
    };

    // Détecter si c'est un projet avec l'ancien système de notes
    const needsMigration = isLegacyNoteSystem(newProject.sequences);

    // Convertir les dates des séquences et s'assurer que les IDs des notes sont uniques
    newProject.sequences.forEach(seq => {
      seq.createdAt = new Date(seq.createdAt);
      seq.updatedAt = new Date(seq.updatedAt);
      
      // Régénérer les IDs des notes et migrer les coordonnées Y si nécessaire
      seq.layout.forEach((note, index) => {
        // Migrer les coordonnées Y de l'ancien système vers le nouveau si nécessaire
        if (needsMigration) {
          const oldY = note.y;
          note.y = migrateNoteCoordinates(oldY);
          console.log(`Migrated note Y from ${oldY} to ${note.y}`);
        }
        
        // Régénérer les IDs pour éviter les doublons entre séquences
        note.i = generateNoteId(seq.id) + `_${index}`;
      });
    });

    project.value = newProject;

    // Si aucune séquence active et qu'il y en a, prendre la première
    if (!project.value.activeSequenceId && project.value.sequences.length > 0) {
      project.value.activeSequenceId = project.value.sequences[0].id;
    }
  };

  // Importer une séquence au format legacy
  const importLegacySequence = (data: LegacySequenceData): void => {
    // Créer une nouvelle séquence à partir des données legacy
    const newSequence: Sequence = {
      id: generateId(),
      name: "Séquence Importée",
      layout: data.layout,
      tempo: data.tempo || DEFAULT_TEMPO,
      cols: data.cols || DEFAULT_COLS,
      createdAt: new Date(data.timestamp || new Date()),
      updatedAt: new Date(),
    };

    project.value.sequences.push(newSequence);
    project.value.activeSequenceId = newSequence.id;
    project.value.updatedAt = new Date();
  };

  // Initialiser avec une séquence par défaut si vide
  const initialize = (): void => {
    // Essayer de charger depuis localStorage
    if (!loadFromLocalStorage()) {
      // Si rien en localStorage, créer une séquence par défaut
      createSequence("Ma Première Séquence");
    }

    // S'assurer qu'il y a toujours au moins une séquence
    if (project.value.sequences.length === 0) {
      createSequence("Ma Première Séquence");
    }

    // S'assurer qu'il y a une séquence active
    if (!project.value.activeSequenceId && project.value.sequences.length > 0) {
      project.value.activeSequenceId = project.value.sequences[0].id;
    }
  };

  // Auto-sauvegarde quand le project change
  watch(project, saveToLocalStorage, { deep: true });

  return {
    // État
    project,
    activeSequence,
    layout,
    tempo,
    cols,

    // Actions pour les séquences
    createSequence,
    deleteSequence,
    renameSequence,
    duplicateSequence,
    setActiveSequence,
    reorderSequences,

    // Sauvegarde/Chargement
    saveToLocalStorage,
    loadFromLocalStorage,
    loadProjectData,
    exportProject,
    importProject,

    // Utilitaires
    generateNoteId,

    // Initialisation
    initialize,
  };
});