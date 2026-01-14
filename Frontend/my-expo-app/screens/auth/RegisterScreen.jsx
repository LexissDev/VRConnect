import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const InputField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  focusedName,
  toggleSecure,
  isSecureVisible,
  focusedInput,
  setFocusedInput
}) => (
  <View className="mb-5">
    <Text className="mb-2 ml-1 text-base font-medium text-gray-800">{label}</Text>
    <View 
      className={`flex-row items-center rounded-2xl border bg-white px-4 py-3.5 shadow-sm transition-all
        ${focusedInput === focusedName ? 'border-purple-300 ring-2 ring-purple-100' : 'border-transparent'}
      `}
    >
      <TextInput
        className="flex-1 text-base text-gray-800"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isSecureVisible}
        onFocus={() => setFocusedInput(focusedName)}
        onBlur={() => setFocusedInput(null)}
        autoCapitalize="none"
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={toggleSecure}>
          <Feather 
            name={isSecureVisible ? "eye" : "eye-off"} 
            size={20} 
            color="#6b7280" 
          />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleContinue = () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // Pasar datos a ProfileSetup para completar el registro allí
    navigation.navigate('ProfileSetup', {
      username: username.trim(),
      email: email.trim(),
      password,
    });
  };

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#E0E7FF', '#F3E8FF', '#E0F2FE']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
          className="px-8 py-10"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-8 items-center">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-md shadow-purple-200">
               <Feather name="image" size={40} color="#7C3AED" />
            </View>
            <Text className="mb-1 text-3xl font-bold text-gray-900">
              Bienvenido
            </Text>
            <Text className="text-center text-base text-gray-500">
              Crea tu identidad virtual
            </Text>
          </View>

          {/* Form */}
          <View className="w-full">
            <InputField
              label="NOMBRE DE USUARIO"
              value={username}
              onChangeText={setUsername}
              placeholder="VRChat_User"
              focusedName="username"
              focusedInput={focusedInput}
              setFocusedInput={setFocusedInput}
            />

            <InputField
              label="EMAIL"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              focusedName="email"
              focusedInput={focusedInput}
              setFocusedInput={setFocusedInput}
            />

            <InputField
              label="CONTRASEÑA"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              focusedName="password"
              toggleSecure={() => setShowPassword(!showPassword)}
              isSecureVisible={showPassword}
              focusedInput={focusedInput}
              setFocusedInput={setFocusedInput}
            />

            <InputField
              label="CONFIRMAR CONTRASEÑA"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              focusedName="confirmPassword"
              toggleSecure={() => setShowConfirmPassword(!showConfirmPassword)}
              isSecureVisible={showConfirmPassword}
              focusedInput={focusedInput}
              setFocusedInput={setFocusedInput}
            />

            <TouchableOpacity className="mb-6 flex-row items-center">
              <View className="mr-2 h-5 w-5 rounded border border-gray-300 bg-white" />
              <Text className="text-sm text-gray-600">Recordar contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleContinue}
              className="mt-2 text-center"
            >
              <LinearGradient
                colors={['#8B5CF6', '#3B82F6']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 16, shadowColor: '#A855F7', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 }}
              >
                 <Text className="text-lg font-bold text-white">Registrarse</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View className="mt-8 flex-row justify-center">
              <Text className="text-gray-500">¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="font-bold text-purple-600 border-b border-purple-600">Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;
