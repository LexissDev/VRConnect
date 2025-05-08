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

  try {
    // Si se proporciona un código OTP, verificarlo primero
    if (otp) {
      const otpResult = await verifyEmailOtp(otp);
      if (otpResult.error) {
        return otpResult;
      }
    }

    const response = await authApi.getCurrentUser();

    console.log("response en vrchatService:", response.data);
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
    console.log("result", result);
    return { success: true, result };
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};

// Función para obtener mundos
export const getWorlds = async (params = {}) => {
  try {
    const { n, offset, sort, search, tag, notag, releaseStatus, featured } = params;
    // Crear una instancia de la API de mundos
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser.data || !currentUser.data.id) {
      throw new Error("No authenticated session.");
    }

    console.log("currentUser:", currentUser);

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
        params.releaseStatus// releaseStatus
        // resto lo dejas undefined
      );
   
    return response.data;
  } catch (error) {
    console.error("Error al obtener mundos:", error);
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

export const getFriends = async () => {
  try {
    const res = await usersApi.getFriends();
    return res;
  } catch (error) {
    return { error: true, message: error.response?.data || error.message };
  }
};
