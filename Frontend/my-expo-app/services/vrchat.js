// services/vrchat.js
const API_URL = process.env.EXPO_PUBLIC_API_URL 
  ? `${process.env.EXPO_PUBLIC_API_URL}/api/vrchat`
  : 'http://localhost:3000/api/vrchat';

// Función auxiliar para construir parámetros de consulta
const buildQueryString = (params) => {
  const parts = [];

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  });

  return parts.length > 0 ? `?${parts.join('&')}` : '';
};

export const getWorlds = async (params = {}) => {
  try {
    // Filtrar parámetros no nulos
    const queryParams = {};
    if (params.featured) queryParams.featured = params.featured;
    if (params.sort) queryParams.sort = params.sort;
    if (params.n) queryParams.n = params.n;
    if (params.offset) queryParams.offset = params.offset;
    if (params.search) queryParams.search = params.search;
    if (params.tag) queryParams.tag = params.tag;
    if (params.notag) queryParams.notag = params.notag;
    if (params.releaseStatus) queryParams.releaseStatus = params.releaseStatus;
    if (params.platform) queryParams.platform = params.platform;
    if (params.user) queryParams.user = params.user;
    if (params.userId) queryParams.userId = params.userId;

    const queryString = buildQueryString(queryParams);
    const url = `${API_URL}/worlds${queryString}`;
    console.log('URL:', url);
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'No se pudieron obtener los mundos');
    }

    return data.data;
  } catch (error) {
    console.error('Error al obtener mundos:', error);
    throw error;
  }
};

export const getWorldById = async (worldId) => {
  try {
    const res = await fetch(`${API_URL}/worlds/${worldId}`);
    const data = await res.json();
    return data.data;
  } catch (error) {
     console.error("Error getting world by id", error);
     return null;
  }
};

export const getCurrentUser = async () => {
   // Deprecated or Mocked if strictly needed by some component temporarily
   return { error: 'Not implemented in this version' };
};

export const getRecentWorlds = async () => {
    // Para simplificar, "Recent" ahora podría ser simplemente "Popular" o
    // alguna lógica del backend que devuelva mundos predeterminados.
    // Usaremos el endpoint proxy de worlds con un sort por defecto.
    return getPopularWorlds(5);
};

// Añadir esta función al final del archivo

export const getPopularWorlds = async (limit = 7) => {
  try {
    // Obtener mundos populares ordenados por popularidad
    const res = await fetch(`${API_URL}/worlds?n=${limit}&sort=popularity&releaseStatus=public`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'No se pudieron obtener los mundos populares');
    }

    return data.data;
  } catch (error) {
    console.error('Error al obtener mundos populares:', error);
    throw error;
  }
};
