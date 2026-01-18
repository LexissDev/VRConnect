import { 
    loginVRChat, 
    verifyEmailOtp, 
    getWorlds, 
    getWorldById as svcGetWorldById, 
    getCurrentUser 
} from '../services/vrchatService.js';
import dotenv from 'dotenv';

dotenv.config();

let isBotLoggedIn = false;
let isWaitingForOtp = false;
let lastSessionCheck = 0;
let sessionPromise = null;
let coolDownUntil = 0;
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const COOL_DOWN_DURATION = 2 * 60 * 1000; // 2 minutes sleep on 429

const ensureBotSession = async () => {
    // Check for Cool-Down
    const now = Date.now();
    if (now < coolDownUntil) {
        const remaining = Math.ceil((coolDownUntil - now) / 1000);
        console.warn(`VRChat Proxy in cool-down for ${remaining}s due to previous 429 error.`);
        return { success: false, error: 'Proxy en enfriamiento por demasiadas solicitudes (429)' };
    }

    // If there's an ongoing session check, wait for it
    if (sessionPromise) {
        console.log('Waiting for existing session verification...');
        return sessionPromise;
    }

    // If we checked recently and session was valid, skip verification entirely
    if (isBotLoggedIn && (now - lastSessionCheck) < SESSION_CHECK_INTERVAL) {
        return { success: true };
    }

    // Create a new promise for this session check to prevent concurrent logins
    sessionPromise = (async () => {
        try {
            console.log('Verifying VRChat session...');
            
            // 1. Check if existing session is still valid
            const user = await getCurrentUser();
            if (user.success && user.data) {
                console.log('Session is valid:', user.data.displayName);
                isBotLoggedIn = true;
                lastSessionCheck = Date.now();
                return { success: true };
            }

            // 2. If not valid, attempt fresh login ONLY if not already waiting for OTP
            if (isWaitingForOtp) {
                console.log('Already waiting for 2FA OTP, skipping login attempt.');
                return { success: false, requiresOtp: true };
            }

            console.log('No valid session, attempting login for:', process.env.VRCHAT_USERNAME);
            const result = await loginVRChat(
                process.env.VRCHAT_USERNAME, 
                process.env.VRCHAT_PASSWORD
            );

            if (result.success) {
                console.log(`Bot logueado: ${result.user.displayName}`);
                isBotLoggedIn = true;
                isWaitingForOtp = false;
                lastSessionCheck = Date.now();
                return { success: true };
            } else if (result.requires2FA) {
                 console.log("Se requiere autenticación 2FA (Email OTP).");
                 isBotLoggedIn = false;
                 isWaitingForOtp = true;
                 return { success: false, requiresOtp: true };
            } else {
                console.error('Error login bot:', result.details);
                isBotLoggedIn = false;
                isWaitingForOtp = false;
                const errorMessage = result.details?.error?.message || JSON.stringify(result.details);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            console.error('Error in session verification flow:', error);
            isBotLoggedIn = false;
            return { success: false, error: error.message };
        } finally {
            // Clear the promise so next check can proceed if needed
            sessionPromise = null;
        }
    })();

    return sessionPromise;
};

export const searchWorlds = async (req, res) => {
    try {
        const sessionState = await ensureBotSession();
        
        if (!sessionState.success) {
            if (sessionState.requiresOtp) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Se requiere verificación de 2FA',
                    requiresOtp: true 
                });
            }
            throw new Error(sessionState.error || 'Error de sesión con el Bot');
        }

        const { search, sort, n, offset, platform } = req.query;
        
        // Mapear parámetros del request al formato del servicio
        const params = {
            search,
            sort: sort || 'popularity',
            n: n ? parseInt(n) : 10,
            offset: offset ? parseInt(offset) : 0,
            releaseStatus: 'public',
            platform
        };

        const data = await getWorlds(params);
        res.json({ success: true, data });

    } catch (error) {
        console.error('Error buscando mundos en VRChat Proxy:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            
            // If we get a 429, activate cool-down
            if (error.response.status === 429) {
                console.error('!!! 429 Detected - Activating 2 minute cool-down !!!');
                coolDownUntil = Date.now() + COOL_DOWN_DURATION;
                isBotLoggedIn = false; // Force re-verify after cool-down
            }
        } else {
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
        }
        
        const status = error.response?.status || 500;
        res.status(status).json({ 
            success: false, 
            message: status === 429 ? 'Demasiadas peticiones a VRChat (429)' : 'Error al buscar mundos en VRChat',
            detail: error.message || 'Error desconocido'
        });
    }
};

export const getWorldById = async (req, res) => {
    try {
        const { worldId } = req.params;
        const data = await svcGetWorldById(worldId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(404).json({ success: false, message: 'Mundo no encontrado' });
    }
};

export const verify2FA = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ success: false, message: 'Código requerido' });

        console.log(`Verificando 2FA con código: ${code}`);
        const result = await verifyEmailOtp(code);
        
        if (result.success) {
             console.log("2FA verificado correctamente.");
             isWaitingForOtp = false; // Important: Clear OTP flag
             // Confirmar que la sesión quedó activa
             const user = await getCurrentUser();
             if(user.success) {
                 isBotLoggedIn = true;
                 lastSessionCheck = Date.now(); // Reset cache timestamp
             }
             
             return res.json({ success: true, message: 'Verificación exitosa' });
        } else {
             return res.status(400).json({ success: false, message: 'Código incorrecto o error de verificación', details: result.message });
        }
    } catch (error) {
        console.error("Error verificando 2FA:", error);
        res.status(500).json({ success: false, message: 'Error verificando 2FA' });
    }
};
