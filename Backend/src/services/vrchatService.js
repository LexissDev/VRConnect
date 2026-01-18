import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import vrchat from "vrchat";

// Activar soporte de cookies
const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

let configuration = new vrchat.Configuration({
  baseOptions: {
    jar,
    headers: {
      "User-Agent": "VRConnect/1.0.0 (your@email.com)",
    },
    withCredentials: true,
  },
});

let authApi = new vrchat.AuthenticationApi(configuration);
let usersApi = new vrchat.UsersApi(configuration);
let worldsApi = new vrchat.WorldsApi(configuration);
let friendsApi = new vrchat.FriendsApi(configuration);

export const loginVRChat = async (username, password, otp = null) => {
  // Actualizar la configuración con las credenciales del usuario
  configuration = new vrchat.Configuration({
    username,
    password,
    baseOptions: {
      jar,
      headers: {
        "User-Agent": "VRConnect/1.0.0 example@email.com",
      },
      withCredentials: true,
    },
  });

  // Recrear las APIs con la nueva configuración
  authApi = new vrchat.AuthenticationApi(configuration);
  usersApi = new vrchat.UsersApi(configuration);
  worldsApi = new vrchat.WorldsApi(configuration);
  friendsApi = new vrchat.FriendsApi(configuration);

  try {
    // Si se proporciona un código OTP, verificarlo primero
    if (otp) {
      const otpResult = await verifyEmailOtp(otp);
      if (otpResult.error) {
        return otpResult;
      }
    }

    const response = await authApi.getCurrentUser();
    console.log("Response GetCurrentUser:", response); // Agrega este console.log para verificar los detalles del usuario actua
   
    if (response.data.requiresTwoFactorAuth) {
      return {
        requires2FA: true,
        methods: response.data.requiresTwoFactorAuth,
      };
    }
    return { success: true, user: response.data };
  } catch (error) {
    console.error(
      "Error logging in to VRChat:",
      error.response?.data || error.message
    );
    return { error: true, details: error.response?.data || error.message };
  }
};

export const verifyEmailOtp = async (code) => {
  try {
    const result = await authApi.verify2FAEmailCode({ code });
    
    return { success: true, result };
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};

// Función para obtener mundos
export const getWorlds = async (params = {}) => {
  try {
    const { n, offset, sort, search, tag, notag, releaseStatus, featured } = params;
    // La sesión ya debe estar validada por el controlador (ensureBotSession)

    

    const response = await worldsApi.searchWorlds(
        params.featured,    // featured
        params.sort,        // sort
        undefined,          // user
        undefined,          // userId
        params.n,           // n
        undefined,          // order
        params.offset,      // offset
        params.search,      // search
        params.tag,         // tag
        params.notag,       // notag
        params.releaseStatus,// releaseStatus
        undefined,          // maxUnityVersion
        undefined,          // minUnityVersion
        params.platform     // platform
      );
   
    return response.data;
  } catch (error) {
    console.error("Error al obtener mundos (Service):");
    if (error.response) {
        console.error("VRChat API Error:", error.response.status, error.response.data);
    } else {
        console.error("Error:", error.message);
    }
    throw error;
  }
};

// Función para obtener detalles de un mundo específico
export const getWorldById = async (worldId) => {
  try {
    // Crear una instancia de la API de mundos
    const worldsApi = new vrchat.WorldsApi(configuration);

    // Llamar a la API de VRChat
    const response = await worldsApi.getWorld(worldId);

    return response.data;
  } catch (error) {
    console.error("Error al obtener detalles del mundo:", error);
    throw error;
  }
};

export const getAllFriends = async (includeOffline = true) => {
    try {
      let allFriends = [];
      let offset = 0;
      const limit = 100; // Número máximo de amigos por solicitud
      let hasMoreFriends = true;
      
      while (hasMoreFriends) {
        const response = await friendsApi.getFriends(offset, limit, includeOffline);
        
        if (!response.data || response.data.length === 0) {
          hasMoreFriends = false;
        } else {
          allFriends = [...allFriends, ...response.data];
          offset += response.data.length;
          
          // Si recibimos menos amigos que el límite, significa que no hay más
          if (response.data.length < limit) {
            hasMoreFriends = false;
          }
        }
      }
      
      return { success: true, data: allFriends };
    } catch (error) {
      console.error("Error al obtener la lista completa de amigos:", error);
      return { error: true, message: error.response?.data || error.message };
    }
  };

  export const getCurrentUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      console.log("Usuario actual:", currentUser.data); // Agrega este console.log para verificar los detalles del usuario actua
      return { success: true, data: currentUser.data };
    } catch (error) {
      console.error("Error al obtener el usuario actual:", error);
      return { error: true, message: error.response?.data || error.message };
    }
  }


  export const getRecentWorlds = async (limit = 10) => {
    try {
      const response = await worldsApi.getRecentWorlds();
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error al obtener los mundos recientes:", error);
      return { error: true, message: error.response?.data || error.message };
    }
  }
