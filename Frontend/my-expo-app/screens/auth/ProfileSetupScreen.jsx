import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from '../../stores/authStore';
import useProfileStore from '../../stores/profileStore';
import Button from '../../components/ui/Button';
import cloudinary from 'services/cloudinary';
import { SafeAreaView } from 'react-native-safe-area-context';

const languages = [
  { id: 'es', name: 'Español' },
  { id: 'en', name: 'English' },
  { id: 'fr', name: 'Français' },
  { id: 'de', name: 'Deutsch' },
  { id: 'it', name: 'Italiano' },
  { id: 'pt', name: 'Português' },
  { id: 'ja', name: 'Japanese' },
  { id: 'ko', name: 'Korean' },
  { id: 'ru', name: 'Russian' },
  { id: 'zh', name: 'Chinese' },
];

const ProfileSetupScreen = ({ navigation, route }) => {
  // Recibimos los datos del registro
  const { username, email, password } = route.params || {};
  const [avatar, setAvatar] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState(['es']);
  const [loading, setLoading] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { register } = useAuthStore();

  React.useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tu galería');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);

      // Animación al seleccionar imagen
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const toggleLanguage = (langId) => {
    if (selectedLanguages.includes(langId)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((id) => id !== langId));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, langId]);
    }
  };

  const uploadAvatar = async (uri) => {
    try {
      // Usar el servicio de Cloudinary con rotación de cuentas
      const avatarUrl = await cloudinary.uploadToCloudinary(uri);
      console.log('avatarUrl:', avatarUrl);
      return avatarUrl;
    } catch (error) {
      console.error('Error al subir avatar:', error);
      throw error;
    }
  };

    const handleContinue = async () => {
    // Si no hay avatar, usar uno por defecto o forzar (decisión de diseño, aquí forzamos o ponemos warning)
    let finalAvatarUrl = avatar;
    
    if (!finalAvatarUrl) {
       Alert.alert('Imagen requerida', 'Por favor selecciona una imagen de perfil');
       return;
    }

    setLoading(true);
    try {
      // Subir imagen a Cloudinary si es local
      let avatarUrl = finalAvatarUrl;
      if (!avatarUrl.startsWith('http')) {
         avatarUrl = await uploadAvatar(finalAvatarUrl);
      }

      // Registrar usuario con todos los datos
      const result = await register(email, password, username);

      if (!result.success) {
        throw new Error(result.error || 'Error al registrar usuario');
      }
      
      const { updateProfile } = useProfileStore.getState();
      await updateProfile({
        avatar_url: avatarUrl,
        languages: selectedLanguages
      });

      // Animación de salida Y navegación a HOME
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // La navegación la maneja el AuthStack al detectar usuario
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#E0E7FF', '#F3E8FF', '#E0F2FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="flex-grow px-6 py-5">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
            className="mb-8 items-center">
            <Text className="text-3xl font-bold text-gray-900">Personaliza tu perfil</Text>
            <Text className="mt-2 text-center text-lg text-gray-500">
              Hola {username}! Vamos a personalizar tu experiencia
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
            className="mb-8 items-center">
            <TouchableOpacity
              onPress={pickImage}
              className="mb-4 overflow-hidden rounded-full border-4 border-white shadow-lg shadow-purple-200">
              {avatar ? (
                <Animated.Image
                  source={{ uri: avatar }}
                  className="h-32 w-32"
                  style={{ transform: [{ scale: scaleAnim }] }}
                />
              ) : (
                <View className="h-32 w-32 items-center justify-center bg-white">
                  <Feather name="camera" size={40} color="#A855F7" />
                  <Text className="mt-2 text-sm text-gray-400">Añadir foto</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text className="text-base text-gray-600">Selecciona una imagen de perfil</Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mb-8">
            <Text className="mb-4 text-xl font-bold text-gray-800">¿Qué idiomas hablas?</Text>
            <View className="flex-row flex-wrap">
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.id}
                  onPress={() => toggleLanguage(lang.id)}
                  className={`m-1 rounded-full px-4 py-2 border ${
                    selectedLanguages.includes(lang.id) 
                      ? 'bg-purple-600 border-purple-600' 
                      : 'bg-white border-white shadow-sm'
                  }`}>
                  <Text
                    className={`text-sm font-medium ${
                      selectedLanguages.includes(lang.id) ? 'text-white' : 'text-gray-600'
                    }`}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mt-auto">
             <TouchableOpacity
              onPress={handleContinue}
              disabled={loading}
              className="mt-2"
            >
              <LinearGradient
                colors={['#8B5CF6', '#3B82F6']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 16, shadowColor: '#A855F7', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 }}
              >
                {loading ? (
                   <Text className="font-bold text-white">Registrando...</Text>
                ) : (
                   <Text className="text-lg font-bold text-white">Completar Registro</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ProfileSetupScreen;
