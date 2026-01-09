// services/vrchat.js
const API_URL = 'http://localhost:3000/api/vrchat'; // Cambia por la URL real de tu backend

let token = null;

const setToken = (newToken) => {
  token = newToken;
};

export const login = async (username, password, otp = null) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, otp }),
    });

    // Verificar si la respuesta es JSON válido antes de parsearla
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('La respuesta del servidor no es JSON válido');
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    if (data.token) {
      setToken(data.token); // Guarda el token para futuras peticiones
    }

    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

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
    // Construir la URL con parámetros de consulta
    //let url = `${API_URL}/worlds`;

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

    const queryString = buildQueryString(queryParams);
    const url = `${API_URL}/worlds${queryString}`;

    // Añadir parámetros a la URL

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'No se pudieron obtener los mundos');
    }

    return data;
  } catch (error) {
    console.error('Error al obtener mundos:', error);
    throw error;
  }
};

export const getWorldById = async (worldId) => {
  const res = await fetch(`${API_URL}/worlds/${worldId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();

  return data;
};

export const getFriends = async () => {
  const res = await fetch(`${API_URL}/friends`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'No se pudieron obtener los amigos');
  }

  return data;
};

export const getCurrentUser = async () => {
  const res = await fetch(`${API_URL}/user/current`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  // Agrega esta línea para verificar la respuesta en la consola de desarrol

  return data;
};

export const getRecentWorlds = async () => {
  const res = await fetch(`${API_URL}/worlds/recent`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();

  // Agrega esta línea para verificar la respuesta en la consola de desarrol

  return data;
};

// Añadir esta función al final del archivo

export const getPopularWorlds = async (limit = 7) => {
  try {
    // Obtener mundos populares ordenados por popularidad
    const res = await fetch(`${API_URL}/worlds?n=${limit}&sort=popularity&releaseStatus=public`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'No se pudieron obtener los mundos populares');
    }

    return data;
  } catch (error) {
    console.error('Error al obtener mundos populares:', error);
    throw error;
  }
};
