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

const ensureBotSession = async () => {
    try {
        // Verificar si ya tenemos sesión válida
        const user = await getCurrentUser();
        if (user.success && user.data) {
            isBotLoggedIn = true;
            return { success: true };
        }

        console.log('Iniciando sesión en VRChat como Bot...');
        console.log('Usuario:', process.env.VRCHAT_USERNAME);
        // console.log('Password length:', process.env.VRCHAT_PASSWORD ? process.env.VRCHAT_PASSWORD.length : 0);

        const result = await loginVRChat(
            process.env.VRCHAT_USERNAME, 
            process.env.VRCHAT_PASSWORD
        );

        if (result.success) {
            console.log(`Bot logueado: ${result.user.displayName}`);
            isBotLoggedIn = true;
            return { success: true };
        } else if (result.requires2FA) {
             console.log("Se requiere autenticación 2FA (Email OTP).");
             return { success: false, requiresOtp: true };
        } else {
            console.error('Error login bot:', result.details);
            const errorMessage = result.details?.error?.message || JSON.stringify(result.details);
            return { success: false, error: errorMessage };
        }

    } catch (error) {
        console.error('Error ensureBotSession:', error);
        return { success: false, error: error.message };
    }
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
        } else {
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Error al buscar mundos en VRChat',
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
             // Confirmar que la sesión quedó activa
             const user = await getCurrentUser();
             if(user.success) isBotLoggedIn = true;
             
             return res.json({ success: true, message: 'Verificación exitosa' });
        } else {
             return res.status(400).json({ success: false, message: 'Código incorrecto o error de verificación', details: result.message });
        }
    } catch (error) {
        console.error("Error verificando 2FA:", error);
        res.status(500).json({ success: false, message: 'Error verificando 2FA' });
    }
};
