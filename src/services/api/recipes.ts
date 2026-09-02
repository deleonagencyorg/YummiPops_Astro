// src/services/api/recipes.ts
import { cmsClient } from './client';
import { getAllBrands } from './brands';
import type { Recipe, CMSRecipesResponse, CMSRecipeRaw } from './types';

const DEFAULT_BRAND_SLUG = import.meta.env.PUBLIC_CMS_BRAND_SLUG || 'yummi-pops';

function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Convierte una respuesta RAW de receta del CMS a la estructura Recipe del sitio.
 */
function mapRecipe(item: CMSRecipeRaw): Recipe {
  let imageUrl = '/images/recipes/placeholder.jpg';
  if (typeof item.image === 'string' && item.image.trim() !== '') {
    imageUrl = item.image;
  } else if (item.image && typeof item.image === 'object' && item.image.url) {
    imageUrl = item.image.url;
  }

  const prepTime = item.preparation_time || item.preparationTime || 0;

  return {
    id: item.id,
    slug: item.slug || slugify(item.title) || item.id,
    title: item.title,
    image: imageUrl,
    preparation_time: prepTime,
    people: item.people,
    difficulty: item.difficulty || 'Fácil',
    ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
    instructions: Array.isArray(item.instructions) ? item.instructions : [],
    category: item.category || 'snack',
    description: item.description || '',
    gallery: Array.isArray(item.gallery) ? item.gallery : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    video: item.video || '',
    date: item.date || '',
    // SEO
    metaTitle: item.metaTitle,
    metaDescription: item.metaDescription,
    metaKeywords: item.metaKeywords,
    ogTitle: item.ogTitle,
    ogDescription: item.ogDescription,
    ogImage: item.ogImage,
  };
}

/**
 * Obtiene todas las recetas activas del CMS para la marca (por defecto yummi-pops).
 *
 * @param locale Código de idioma ('es', 'en')
 * @param brandSlug Opcional. Slug de la marca ('yummi-pops')
 */
export async function getAllRecipes(locale: string = 'es', brandSlug?: string): Promise<Recipe[]> {
  try {
    const targetBrandSlug = brandSlug || DEFAULT_BRAND_SLUG;
    const params: Record<string, string | number | boolean> = {
      page: 1,
      pageSize: 100,
      languageCode: locale,
    };

    if (targetBrandSlug) {
      params.brandSlug = targetBrandSlug;

      try {
        const brands = await getAllBrands(locale);
        const matchedBrand = brands.find(
          (b) => b.slug?.toLowerCase() === targetBrandSlug.toLowerCase() || b.id === targetBrandSlug
        );
        if (matchedBrand) {
          params.brandId = matchedBrand.id;
        }
      } catch (brandErr) {
        console.warn('[CMS Recipes] No se pudo resolver brandId desde slug, enviando brandSlug:', brandErr);
      }
    }

    const response = await cmsClient.get<CMSRecipesResponse>('v1/recipes', params);

    if (!response?.data || !Array.isArray(response.data)) {
      return [];
    }

    return response.data.map(mapRecipe);
  } catch (error) {
    console.error('[CMS Recipes] Error al obtener las recetas:', error);
    return [];
  }
}

/**
 * Obtiene el detalle de una receta del CMS por su slug o ID.
 *
 * @param slug ID o Slug de la receta
 * @param locale Código de idioma ('es', 'en')
 */
export async function getRecipeBySlug(slug: string, locale: string = 'es'): Promise<Recipe | null> {
  try {
    const response = await cmsClient.get<{ data: CMSRecipeRaw }>(`v1/recipes/${slug}`, {
      languageCode: locale,
    });

    if (response?.data) {
      return mapRecipe(response.data);
    }
  } catch (error) {
    console.warn(`[CMS Recipes] Petición directa a v1/recipes/${slug} no disponible, buscando en catálogo general...`);
  }

  // Fallback: Buscar en la lista general de recetas
  try {
    const allRecipes = await getAllRecipes(locale);
    const found = allRecipes.find(
      (r) => r.slug === slug || r.id === slug || slugify(r.title) === slug
    );
    return found || null;
  } catch (error) {
    console.error(`[CMS Recipes] Error al obtener receta por slug ${slug}:`, error);
    return null;
  }
}