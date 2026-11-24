const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const slugOf = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Fetches everything once per browser session and reuses it after that
export async function getAllData(): Promise<any> {
  if (window.globalSlidesCache) return window.globalSlidesCache;

  const response = await fetch(`${API_URL}/all-data`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  const allSlides: any[] = [];
  data.projects.forEach((project: any) => {
    project.slides.forEach((slide: any, idx: number) => {
      allSlides.push({
        ...slide,
        projectId: project.id,
        projectTitle: project.title,
        projectOrder: project.order,
        orderInProject: idx
      });
    });
  });

  window.globalSlidesCache = {
    projects: data.projects,
    allSlides,
    totalSlides: allSlides.length
  };
  return window.globalSlidesCache;
}

// Flattens the cache into one thumbnail per image, numbered within each project
export function flattenThumbnails(cache: any): any[] {
  if (!cache) return [];
  return cache.projects.flatMap((project: any) =>
    project.slides.map((slide: any, idx: number) => ({
      ...slide,
      projectTitle: project.title,
      projectSlug: slugOf(project.title),
      slideNumber: idx + 1
    }))
  );
}