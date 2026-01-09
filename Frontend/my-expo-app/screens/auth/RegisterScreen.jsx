import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // En lugar de registrar aquí, pasamos los datos a ProfileSetupScreen
    navigation.navigate('ProfileSetup', {
      username,
      email,
      password,
    });
  };

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar style="light" />
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10">
        <View className="mb-8 items-center">
          <Image
            //source={require('../../assets/logo.png')}
            className="mb-4 h-40 w-40"
            resizeMode="contain"
          />
          <Text className="text-3xl font-bold text-white">VRConnect</Text>
          <Text className="mt-2 text-lg text-gray-400">Únete a la comunidad de VRChat</Text>
        </View>

        <View className="mb-6 space-y-4">
          <Input
            placeholder="Nombre de usuario"
            value={username}
            onChangeText={setUsername}
            icon="user"
          />
          <Input
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail"
          />
          <Input
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock"
          />
          <Input
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            icon="lock"
          />
        </View>

        <Button title="Continuar" onPress={handleContinue} loading={loading} className="mb-4" />

        <View className="mt-4 flex-row justify-center">
          <Text className="text-gray-400">¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="font-bold text-purple-500">Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;
