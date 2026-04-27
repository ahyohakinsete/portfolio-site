// Global type declarations for window object extensions

interface GlobalSlidesCache {
  projects: any[];
  allSlides: any[];
  totalSlides: number;
}

interface AllSlidesData {
  allSlides: any[];
  totalSlides: number;
  currentGlobalIndex: number;
}

declare global {
  interface Window {
    globalSlidesCache?: GlobalSlidesCache;
    allSlidesData?: AllSlidesData;
  }
}

export {};
