// src/services/api/client.ts
const getCmsUrl = () => import.meta.env.PUBLIC_CMS_URL || 'http://localhost:9015/';
const getCmsToken = () => import.meta.env.PUBLIC_CMS_TOKEN || '';

export const cmsClient = {
  async get<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
    const rawUrl = getCmsUrl();
    const token = getCmsToken();

    const baseUrl = rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    const fullBase = `${baseUrl}${cleanEndpoint}`;

    const url = new URL(fullBase);

    // Añadimos parámetros de consulta de forma limpia
    const searchParams = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value != null && value !== '')
        .map(([key, value]) => [key, String(value)])
    );

    url.search = searchParams.toString();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      headers,
    });

    if (!response.ok) {
      throw new Error(`CMS Error ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  },
};