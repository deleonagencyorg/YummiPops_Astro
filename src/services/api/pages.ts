// src/services/api/pages.ts
import { cmsClient } from './client';
import { getAllBrands } from './brands';

const DEFAULT_BRAND_SLUG = import.meta.env.PUBLIC_CMS_BRAND_SLUG || 'yummi-pops';
const SITE_ID = import.meta.env.PUBLIC_CMS_SITE_ID;

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  languageCode?: string;
  featuredImage?: {
    originalUrl?: string;
    seoUrl?: string;
    url?: string;
  };
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: {
    originalUrl?: string;
    seoUrl?: string;
    url?: string;
  } | string;
}

interface CMSPagesResponse {
  data: CMSPage[];
}

/**
 * Obtiene los metadatos y contenido de una página del CMS por su slug e idioma.
 */
export async function getPageBySlug(slug: string, locale: string = 'es'): Promise<CMSPage | null> {
  try {
    const params: Record<string, string | number | boolean> = {
      page: 1,
      pageSize: 50,
      languageCode: locale,
    };

    if (SITE_ID && typeof SITE_ID === 'string' && SITE_ID.trim() !== '' && SITE_ID !== 'undefined') {
      params.siteId = SITE_ID;
    }

    if (DEFAULT_BRAND_SLUG) {
      params.brandSlug = DEFAULT_BRAND_SLUG;
      try {
        const brands = await getAllBrands(locale);
        const matchedBrand = brands.find(
          (b) => b.slug?.toLowerCase() === DEFAULT_BRAND_SLUG.toLowerCase() || b.id === DEFAULT_BRAND_SLUG
        );
        if (matchedBrand) {
          params.brandId = matchedBrand.id;
        }
      } catch (brandErr) {
        // Silencioso en caso de error
      }
    }

    const response = await cmsClient.get<CMSPagesResponse>('v1/pages', params);

    if (response?.data && Array.isArray(response.data)) {
      const page = response.data.find(
        (p) => p.slug === slug || p.slug?.toLowerCase() === slug.toLowerCase()
      );
      if (page) return page;
    }
  } catch (error) {
    // Silencioso en caso de fallback
  }

  // Intenta consultar la página directamente por slug
  try {
    const response = await cmsClient.get<{ data: CMSPage }>(`v1/pages/${slug}`, {
      languageCode: locale,
    });
    if (response?.data) {
      return response.data;
    }
  } catch (error) {
    // Silencioso
  }

  return null;
}