import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { login } from 'services/vrchat';
import useAuthStore from 'stores/authStore';

const VRChatLoginScreen = ({ navigation, route }) => {
  // Obtener parámetros de la ruta si existen
  const routeParams = route.params || {};
  const {setIsVrchatUser}  = useAuthStore();
  const [username, setUsername] = useState(routeParams.username || '');
  const [password, setPassword] = useState(routeParams.password || '');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactorInput, setShowTwoFactorInput] = useState(routeParams.requiresTwoFactor || false);
  const [twoFactorType, setTwoFactorType] = useState(routeParams.twoFactorType || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Por favor, introduce tu nombre de usuario y contraseña');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await login(username, password);
      console.log('response: ', response.success);
      // Verificar si se requiere autenticación de dos factores
      if (
        !response.success &&
        response.methods[0] === 'emailOtp' &&
        response.requires2FA === true
      ) {
        setShowTwoFactorInput(true);
        setTwoFactorType(response.requiresTwoFactorAuth[0]);
        setIsLoading(false);
      } else {
        // Inicio de sesión exitoso
        setIsVrchatUser(true);
        setIsLoading(false);
        Alert.alert('Inicio de sesión exitoso', `Bienvenido, ${response.displayName}`, [
          { text: 'Continuar', onPress: () => navigation.navigate('MainTabs') },
        ]);
      }
    } catch (error) {
      setIsLoading(false);
      setError(
        error.message || 'Ha ocurrido un error al iniciar sesión. Verifica tus credenciales.'
      );
    }
  };

  const handleTwoFactorSubmit = async () => {
    if (!twoFactorCode) {
      setError('Por favor, introduce el código de verificación');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await login(username, password, twoFactorCode);

      setIsLoading(false);
      if (response.success) {
        Alert.alert('Inicio de sesión exitoso', `Bienvenido, ${response.displayName}`, [
          { text: 'Continuar', onPress: () => navigation.navigate('MainTabs') },
        ]);
        setIsVrchatUser(true);
      }
    } catch (error) {
      setIsLoading(false);
      setError(error.message || 'Código de verificación incorrecto. Inténtalo de nuevo.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView className="flex-1">
          <View className="p-6">
            {/* Encabezado */}
            <View className="mb-6 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-white">Conectar con VRChat</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Logo de VRChat */}
            <View className="my-6 items-center">
              <Image
                source={require('../../assets/VRChat.png')}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
              />
              <Text className="mt-4 text-center text-lg font-bold text-white">
                Inicia sesión en tu cuenta de VRChat
              </Text>
              <Text className="mt-2 text-center text-sm text-gray-400">
                Conecta tu cuenta para acceder a mundos, amigos y más
              </Text>
            </View>

            {!showTwoFactorInput ? (
              /* Formulario de inicio de sesión */
              <View className="mt-4">
                <View className="mb-4">
                  <Text className="mb-2 text-sm font-medium text-white">
                    Nombre de usuario o correo electrónico
                  </Text>
                  <View className="flex-row items-center rounded-xl bg-[#1E1E1E] px-4 py-3">
                    <Feather name="user" size={20} color="#9CA3AF" />
                    <TextInput
                      className="ml-3 flex-1 text-base text-white"
                      placeholder="Tu nombre de usuario"
                      placeholderTextColor="#9CA3AF"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="mb-2 text-sm font-medium text-white">Contraseña</Text>
                  <View className="flex-row items-center rounded-xl bg-[#1E1E1E] px-4 py-3">
                    <Feather name="lock" size={20} color="#9CA3AF" />
                    <TextInput
                      className="ml-3 flex-1 text-base text-white"
                      placeholder="Tu contraseña"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={secureTextEntry}
                    />
                    <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                      <Feather
                        name={secureTextEntry ? 'eye' : 'eye-off'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {error && <Text className="mb-4 text-sm text-red-500">{error}</Text>}

                <TouchableOpacity
                  className={`rounded-xl p-4 ${
                    !username || !password ? 'bg-purple-900/50' : 'bg-purple-600'
                  }`}
                  onPress={handleLogin}
                  disabled={!username || !password || isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-center text-base font-semibold text-white">
                      Iniciar Sesión
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* Formulario de verificación de dos factores */
              <View className="mt-4">
                <View className="mb-6 rounded-xl bg-[#1E1E1E] p-4">
                  <Text className="text-base font-medium text-white">
                    {twoFactorType === 'emailOtp'
                      ? 'Verificación por correo electrónico'
                      : 'Autenticación de dos factores'}
                  </Text>
                  <Text className="mt-2 text-sm text-gray-400">
                    {twoFactorType === 'emailOtp'
                      ? 'Hemos enviado un código a tu correo electrónico. Introdúcelo a continuación.'
                      : 'Introduce el código de tu aplicación de autenticación.'}
                  </Text>
                </View>

                <View className="mb-6">
                  <Text className="mb-2 text-sm font-medium text-white">
                    Código de verificación
                  </Text>
                  <View className="flex-row items-center rounded-xl bg-[#1E1E1E] px-4 py-3">
                    <Feather name="shield" size={20} color="#9CA3AF" />
                    <TextInput
                      className="ml-3 flex-1 text-base text-white"
                      placeholder="Código de 6 dígitos"
                      placeholderTextColor="#9CA3AF"
                      value={twoFactorCode}
                      onChangeText={setTwoFactorCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>

                {error && <Text className="mb-4 text-sm text-red-500">{error}</Text>}

                <TouchableOpacity
                  className={`rounded-xl p-4 ${
                    !twoFactorCode || twoFactorCode.length < 6
                      ? 'bg-purple-900/50'
                      : 'bg-purple-600'
                  }`}
                  onPress={handleTwoFactorSubmit}
                  disabled={!twoFactorCode || twoFactorCode.length < 6 || isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-center text-base font-semibold text-white">
                      Verificar
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity className="mt-4" onPress={() => setShowTwoFactorInput(false)}>
                  <Text className="text-center text-sm text-purple-400">
                    Volver al inicio de sesión
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Nota de privacidad */}
            <Text className="mt-8 text-center text-xs text-gray-400">
              Al iniciar sesión, aceptas los términos de servicio y la política de privacidad de
              VRChat.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VRChatLoginScreen;
