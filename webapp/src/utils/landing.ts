/**
 * Landing Page Utility Functions
 * Fonctions réutilisables pour la page landing
 */

/**
 * Formate un nombre pour l'affichage avec séparateurs
 */
export const formatNumber = (value: number, separator = ","): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

/**
 * Crée un tableau de références pour les composants
 */
export const createRefArray = <T>(length: number): T[] => {
  return Array.from({ length }, () => null as T);
};

/**
 * Set une référence dans un tableau à un index spécifique
 */
export const setRefAtIndex = <T>(arr: T[], index: number, el: any): void => {
  if (el && index >= 0 && index < arr.length) {
    arr[index] = el as T;
  }
};

/**
 * Obtient les éléments du DOM d'un tableau de références
 */
export const getRefElements = <T extends HTMLElement>(
  refs: (T | null)[],
): T[] => {
  return refs.filter((ref): ref is T => ref !== null);
};

/**
 * Calcule le décalage d'animation en cascade
 */
export const calculateStaggerDelay = (
  index: number,
  baseDelay = 0,
  stagger = 0.1,
): number => {
  return baseDelay + index * stagger;
};

/**
 * Crée une animation de texte split basée sur les statistiques
 */
export const createStatAnimation = (value: number, suffix = ""): string => {
  return `${value.toLocaleString()}${suffix}`;
};

/**
 * Valide si un élément est visible dans le viewport
 */
export const isElementInViewport = (el: HTMLElement): boolean => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0
  );
};

/**
 * Crée un observateur d'intersection pour les animations
 */
export const createIntersectionObserver = (
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit,
): IntersectionObserver => {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        callback(entry.isIntersecting);
      });
    },
    {
      threshold: 0.1,
      ...options,
    },
  );
};

/**
 * Lisse le scroll vers un élément
 */
export const smoothScrollTo = (
  target: string | HTMLElement,
  offset = 0,
): void => {
  const element =
    typeof target === "string" ? document.querySelector(target) : target;

  if (!element || !(element instanceof HTMLElement)) return;

  const targetPosition = element.offsetTop - offset;
  window.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  });
};

/**
 * Gère le debounce pour les événements de scroll/resize
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Gère le throttle pour les événements fréquents
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};
