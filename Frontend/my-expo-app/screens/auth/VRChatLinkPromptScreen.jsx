import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login } from '../../services/vrchat';


const VRChatLinkPromptScreen = ({ navigation }) => {
  // Estado para manejar la carga
  const [isLoading, setIsLoading] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Animación para los beneficios
  const benefitAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    // Animación de entrada principal
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
    ]).start();

    // Animación secuencial para los beneficios
    benefitAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 800 + index * 200,
        useNativeDriver: true,
      }).start();
    });
  }, []);

 

  const handleLinkVRChat = () => {
    navigation.navigate('VRChatLogin');
  };

  const handleSkip = async () => {
    try {
      // Usar una cuenta por defecto para mostrar mapas y funcionalidades básicas
      const defaultUsername = 'usuarioTest';
      const defaultPassword = 'Narutosharingan5';

      // Mostrar indicador de carga
      setIsLoading(true);

      // Intentar iniciar sesión con la cuenta por defecto
      const response = await login(defaultUsername, defaultPassword);

      // Verificar si se requiere autenticación de dos factores
      if (!response.success && response.requires2FA === true) {
        // Navegar a la pantalla de login para mostrar el input de 2FA
        navigation.navigate('VRChatLogin', {
          username: defaultUsername,
          password: defaultPassword,
          requiresTwoFactor: true,
          twoFactorType: response.methods[0],
        });
      } else {
        // Inicio de sesión exitoso, navegar a la pantalla principal
        navigation.navigate('MainTabs');
      }
    } catch (error) {
      console.error('Error al iniciar sesión con cuenta por defecto:', error);
      // Si hay un error, navegar a MainTabs de todos modos para no bloquear al usuario
      navigation.navigate('MainTabs');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: 'people',
      title: 'Ver tus amigos',
      description: 'Accede a tu lista de amigos y su estado en tiempo real',
    },
    {
      icon: 'heart',
      title: 'Mundos favoritos',
      description: 'Accede a tus mundos favoritos y recibe notificaciones',
    },
    {
      icon: 'information-circle',
      title: 'Información detallada',
      description: 'Estadísticas y datos completos sobre tu actividad en VRChat',
    },
  ];

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-[#121212]">
        <StatusBar style="light" />

        <ScrollView contentContainerClassName="flex-grow px-6 py-10">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
            className="mb-8 items-center">
            <View className="relative mb-6 items-center justify-center">
              <View className="rounded-2xl bg-purple-700 p-1">
                <Image
                  source={require('../../assets/VRChat.png')}
                  className="h-14 w-28"
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text className="text-3xl font-bold text-white">Conecta con VRChat</Text>
            <Text className="mt-3 text-center text-lg text-gray-300">
              Mejora tu experiencia vinculando tu cuenta de VRChat
            </Text>
          </Animated.View>

          <View className="mb-8">
            {benefits.map((benefit, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: benefitAnims[index],
                  transform: [
                    {
                      translateX: benefitAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                }}
                className="mb-4 flex-row items-center rounded-xl bg-[#1E1E1E] p-4">
                <View className="mr-4 rounded-full bg-purple-900 p-3">
                  <Ionicons name={benefit.icon} size={24} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">{benefit.title}</Text>
                  <Text className="text-sm text-gray-400">{benefit.description}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mt-auto">
            <TouchableOpacity
              onPress={handleLinkVRChat}
              className="mb-4 rounded-xl bg-purple-600 p-4">
              <Text className="text-center text-lg font-bold text-white">
                Vincular mi cuenta de VRChat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              disabled={isLoading}
              className="rounded-xl border border-gray-700 p-4">
              {isLoading ? (
                <ActivityIndicator color="#9CA3AF" />
              ) : (
                <Text className="text-center text-base text-gray-300">Continuar sin vincular</Text>
              )}
            </TouchableOpacity>

            <Text className="mt-6 text-center text-xs text-gray-500">
              Puedes vincular tu cuenta más tarde desde la configuración de tu perfil
            </Text>
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default VRChatLinkPromptScreen;
