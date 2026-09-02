// src/services/api/brands.ts
import { cmsClient } from './client';
import type { Brand, CMSBrandsResponse, CMSBrandRaw } from './types';

function mapBrand(item: CMSBrandRaw): Brand {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    logoUrl: item.logoUrl || item.logo_url || '',
  };
}

export async function getAllBrands(locale: string = 'es'): Promise<Brand[]> {
  try {
    const response = await cmsClient.get<CMSBrandsResponse>('v1/brands', {
      languageCode: locale,
    });
    if (!response?.data || !Array.isArray(response.data)) {
      return [];
    }
    return response.data.map(mapBrand);
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    return [];
  }
}
