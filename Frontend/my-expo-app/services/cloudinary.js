// Servicio para gestionar múltiples cuentas de Cloudinary
const cloudinaryAccounts = [
  {
    cloudName: 'dtpxdpcl4',
    uploadPreset: 'avatars1',
    apiKey: '712599265626118',
  },
  {
    cloudName: 'dtpxdpcl4',
    uploadPreset: 'avatars1',
    apiKey: '712599265626118',
  },
  {
    cloudName: 'dtpxdpcl4',
    uploadPreset: 'avatars1',
    apiKey: '712599265626118',
  },
  // Puedes añadir más cuentas según necesites
];

let currentAccountIndex = 0;

// Función para obtener la siguiente cuenta en rotación
const getNextAccount = () => {
  const account = cloudinaryAccounts[currentAccountIndex];
  // Rotar al siguiente índice para la próxima llamada
  currentAccountIndex = (currentAccountIndex + 1) % cloudinaryAccounts.length;
  return account;
};

// Función para subir imagen a Cloudinary usando la rotación de cuentas
const uploadToCloudinary = async (uri) => {
  try {
    const account = getNextAccount();

    // Crear un FormData para la subida
    const formData = new FormData();

    // Obtener el nombre del archivo de la URI
    const filename = uri.split('/').pop();

    // Determinar el tipo MIME
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image';

    // Añadir la imagen al FormData
    formData.append('file', {
      uri,
      name: filename,
      type,
    });

    // Añadir los parámetros de Cloudinary
    formData.append('upload_preset', account.uploadPreset);

    // Realizar la petición a la API de Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${account.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al subir imagen');
    }

    // Retornar la URL segura de la imagen
    return data.secure_url;
  } catch (error) {
    console.error('Error en uploadToCloudinary:', error);
    throw error;
  }
};

export default {
  uploadToCloudinary,
};
