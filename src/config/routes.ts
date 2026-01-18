// src/config/routes.ts
export interface RouteConfig {
  id: string; // Identificador único para la ruta (ej: 'home', 'contact')
  slugs: { [key: string]: string }; // Mapeo de idioma a slug (ej: { es: 'contacto', en: 'contact' })
  contentComponent: string; // Ruta al componente Astro que renderiza el contenido (ej: '@/components/pages/ContactPage.astro')
  metaTitleKey?: string; // Clave para el título en common.json (ej: 'meta.contact.title')
  metaDescriptionKey?: string; // Clave para la descripción en common.json
}

export const routesConfig: RouteConfig[] = [
  {
    id: 'home',
    slugs: { es: '', en: '' }, // Slug vacío para la página de inicio base del idioma
    contentComponent: '@/views/Home/index.astro',
    metaTitleKey: 'meta.home.title',
    metaDescriptionKey: 'meta.home.description',
  },
  {
    id: 'contact',
    slugs: { es: 'contacto', en: 'contact' },
    contentComponent: '@/views/Contact/index.astro',
    metaTitleKey: 'meta.contact.title',
    metaDescriptionKey: 'meta.contact.description',
  },
  {
    id: 'recipes',
    slugs: { es: 'recetas', en: 'recipes' },
    contentComponent: '@/views/Recipes/index.astro',
    metaTitleKey: 'meta.recipes.title',
    metaDescriptionKey: 'meta.recipes.description',
  },
  {
    id: 'news',
    slugs: { es: 'blog', en: 'blog' },
    contentComponent: '@/views/News/index.astro',
    metaTitleKey: 'meta.news.title',
    metaDescriptionKey: 'meta.news.description',
  },
  {
    id: 'products',
    slugs: { es: 'productos', en: 'products' },
    contentComponent: '@/views/Products/index.astro',
    metaTitleKey: 'meta.products.title',
    metaDescriptionKey: 'meta.products.description',
  },
  {
    id: 'results',
    slugs: { es: 'resultados', en: 'results' },
    contentComponent: '@/views/Results/index.astro',
    metaTitleKey: 'meta.results.title',
    metaDescriptionKey: 'meta.results.description',
  },
  {
    id: 'brands',
    slugs: { es: 'marcas', en: 'brands' },
    contentComponent: '@/views/Brands/index.astro',
    metaTitleKey: 'meta.brands.title',
    metaDescriptionKey: 'meta.brands.description',
  },
  {
    id: 'yummiesone',
    slugs: { es: 'yummiesone', en: 'yummiesone' },
    contentComponent: '@/views/YummiesOne/index.astro',
    metaTitleKey: 'meta.yummiesone.title',
    metaDescriptionKey: 'meta.yummiesone.description',
  },
  {
    id: 'about_us',
    slugs: { es: 'nosotros', en: 'about-us' },
    contentComponent: '@/views/AboutUs/index.astro',
    metaTitleKey: 'meta.about_us.title',
    metaDescriptionKey: 'meta.about_us.description',
  },
  {
    id: 'zibas_creators',
    slugs: { es: 'zibas-creators',},
    contentComponent: '@/views/ZibasCreators/index.astro',
    metaTitleKey: 'meta.zibas_creators.title',
    metaDescriptionKey: 'meta.zibas_creators.description',
  },
  {
    id: 'participacion',
    slugs: { es: 'participacion',},
    contentComponent: '@/views/Participacion/index.astro',
    metaTitleKey: 'meta.participacion.title',
    metaDescriptionKey: 'meta.participacion.description',
  },
  {
    id: 'jurados',
    slugs: { es: 'jurados' }, // Spanish-only route
    contentComponent: '@/views/Jurados/index.astro',
    metaTitleKey: 'meta.jurados.title',
    metaDescriptionKey: 'meta.jurados.description',
  },
  // ... Agrega más rutas aquí
];

// Función helper para obtener una ruta por ID
export function getRouteById(id: string): RouteConfig | undefined {
  return routesConfig.find(route => route.id === id);
}

// Función helper para encontrar una ruta por slug y lang
export function findRouteBySlug(lang: string, slug: string): RouteConfig | undefined {
  return routesConfig.find(route => route.slugs[lang] === slug);
}
