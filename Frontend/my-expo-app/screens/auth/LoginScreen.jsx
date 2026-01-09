import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import useAuthStore from '../../stores/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { getCurrentUser } from 'services/vrchat';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const { login, loading, setIsVrchatUser, checkSession } = useAuthStore();

  const validate = () => {
    const newErrors = {};

    if (!email) newErrors.email = 'El correo electrónico es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Correo electrónico inválido';

    if (!password) newErrors.password = 'La contraseña es obligatoria';
    else if (password.length < 6)
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setIsVrchatUser(false);
    

    if (!validate()) return;

    const result = await login(email, password);

    checkSession();


    const isAuthenticated = await getCurrentUser();
    console.log("isAuthenticated: ", isAuthenticated);

    if (!isAuthenticated.error) {
      setIsVrchatUser(true);
    } else {
      navigation.navigate('VRChatLinkPrompt');
      return;
    }

    if (!result.success) {
      setErrors({ general: result.error });
    }

    if (result.success) {
      navigation.navigate('Home');
    }
  };

  return (
    <ScrollView className="flex-1 bg-purple-50">
      <StatusBar style="dark" />
      <View className="min-h-screen flex-1 justify-center p-6">
        <View className="mb-8 items-center">
          <Image
            //source={require('../../../assets/logo.png')}
            className="mb-4 h-32 w-32"
            resizeMode="contain"
          />
          <Text className="mb-2 text-3xl font-bold text-purple-800">CommyVR</Text>
          <Text className="text-center text-gray-600">Conecta con la comunidad de VRChat</Text>
        </View>

        <View className="mb-6 rounded-2xl bg-white p-6 shadow-md">
          <Text className="mb-6 text-2xl font-bold text-gray-800">Iniciar Sesión</Text>

          {errors.general && (
            <View className="mb-4 rounded-lg bg-red-50 p-3">
              <Text className="text-red-500">{errors.general}</Text>
            </View>
          )}

          <Input
            label="Correo Electrónico"
            placeholder="tucorreo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />

          <Input
            label="Contraseña"
            placeholder="Tu contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />

          <Button
            title={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            onPress={handleLogin}
            disabled={loading}
            fullWidth
            className="mt-2"
          />
        </View>

        <View className="flex-row justify-center">
          <Text className="text-gray-600">¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="font-semibold  text-purple-600">Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
