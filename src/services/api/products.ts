// src/services/api/products.ts
import { cmsClient } from './client';
import { getAllBrands } from './brands';
import type { Product, CMSProductsResponse, CMSProductRaw } from './types';

const DEFAULT_BRAND_SLUG = import.meta.env.PUBLIC_CMS_BRAND_SLUG || 'yummi-pops';

/**
 * Convierte un producto RAW devuelto por la API del CMS a la interfaz Product estándar.
 */
function mapProduct(item: CMSProductRaw): Product {
  // Manejo seguro de la imagen del producto
  let imageUrl = '/images/products/placeholder.jpg';
  if (typeof item.image === 'string' && item.image.trim() !== '') {
    imageUrl = item.image;
  } else if (item.image && typeof item.image === 'object' && item.image.url) {
    imageUrl = item.image.url;
  }

  // Manejo de colores de presentación y fondo
  const backgroundColor = item.backgroundColor || item.background_color || item.background_product || '#0D75C9';
  const headerTextColor = item.headerTextColor || item.header_text_color || item.header_color || '#FFFFFF';
  const textColor = item.textColor || item.text_color || '#FFFFFF';
  const colorButton = item.colorButton || item.color_button || '#FFFFFF';

  return {
    id: item.id,
    slug: item.slug || item.id,
    name: item.name,
    category: item.category || 'all',
    image: imageUrl,
    description: item.description || '',
    short_description: item.shortDescription || item.short_description || item.description || '',
    background_color: backgroundColor,
    backgroundColor: backgroundColor,
    background_product: backgroundColor,
    header_color: headerTextColor,
    header_text_color: headerTextColor,
    headerTextColor: headerTextColor,
    text_color: textColor,
    textColor: textColor,
    color_button: colorButton,
    colorButton: colorButton,
    weight: Array.isArray(item.weight) ? item.weight : [],
    sizes: Array.isArray(item.sizes) ? item.sizes : [],
    nutrition: item.nutrition,
    brandId: item.brandId,
    isnew: item.isNew ?? item.isnew ?? false,
    isNew: item.isNew ?? item.isnew ?? false,
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
 * Obtiene todos los productos del CMS para la marca Yummi Pops (o configurada en PUBLIC_CMS_BRAND_SLUG).
 *
 * @param locale Idioma seleccionado ('es', 'en')
 * @param brandSlug Opcional. Slug de la marca ('yummi-pops', 'pops', etc.)
 */
export async function getAllProducts(locale: string = 'es', brandSlug?: string): Promise<Product[]> {
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
        // Intenta resolver el brandSlug al UUID registrado en el CMS
        const brands = await getAllBrands(locale);
        const matchedBrand = brands.find(
          (b) => b.slug?.toLowerCase() === targetBrandSlug.toLowerCase() || b.id === targetBrandSlug
        );
        if (matchedBrand) {
          params.brandId = matchedBrand.id;
        }
      } catch (brandErr) {
        console.warn('[CMS Products] No se pudo resolver brandId desde slug, enviando brandSlug:', brandErr);
      }
    }

    const response = await cmsClient.get<CMSProductsResponse>('v1/products', params);

    if (!response?.data || !Array.isArray(response.data)) {
      return [];
    }

    return response.data.map(mapProduct);
  } catch (error) {
    console.error('[CMS Products] Error al obtener lista de productos:', error);
    return [];
  }
}

/**
 * Obtiene el detalle de un producto específico del CMS por su slug o ID.
 *
 * @param slug ID o Slug del producto
 * @param locale Idioma seleccionado ('es', 'en')
 */
export async function getProductBySlug(slug: string, locale: string = 'es'): Promise<Product | null> {
  try {
    const response = await cmsClient.get<{ data: CMSProductRaw }>(`v1/products/${slug}`, {
      languageCode: locale,
    });

    if (response?.data) {
      return mapProduct(response.data);
    }
  } catch (error) {
    console.warn(`[CMS Products] Petición directa a v1/products/${slug} no disponible, buscando en catálogo general...`);
  }

  // Fallback: Buscar en el catálogo general de la marca
  try {
    const allProducts = await getAllProducts(locale);
    const found = allProducts.find(
      (p) => p.slug === slug || p.id === slug || p.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
    );
    return found || null;
  } catch (error) {
    console.error(`[CMS Products] Error al obtener detalle del producto ${slug}:`, error);
    return null;
  }
}