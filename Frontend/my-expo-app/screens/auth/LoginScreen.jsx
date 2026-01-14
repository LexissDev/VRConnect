import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import useAuthStore from '../../stores/authStore';

const { width } = Dimensions.get('window');

const InputField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  error,
  focusedName,
  icon,
  focusedInput,
  setFocusedInput,
  showPassword,
  setShowPassword
}) => (
  <View className="mb-5">
    <Text className="mb-2 ml-1 text-base font-medium text-gray-800">{label}</Text>
    <View 
      className={`flex-row items-center rounded-2xl border bg-white px-4 py-3.5 shadow-sm transition-all
        ${focusedInput === focusedName ? 'border-purple-300 ring-2 ring-purple-100' : 'border-transparent'}
        ${error ? 'border-red-400' : ''}
      `}
    >
      <TextInput
        className="flex-1 text-base text-gray-800"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        onFocus={() => setFocusedInput(focusedName)}
        onBlur={() => setFocusedInput(null)}
        autoCapitalize="none"
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather 
            name={showPassword ? "eye" : "eye-off"} 
            size={20} 
            color="#6b7280" 
          />
        </TouchableOpacity>
      )}
    </View>
    {error && <Text className="ml-1 mt-1 text-xs text-red-500">{error}</Text>}
  </View>
);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);

  const { login, loading } = useAuthStore();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'El correo electrónico es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Correo electrónico inválido';

    if (!password) newErrors.password = 'La contraseña es obligatoria';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    console.log('Botón login presionado');
    if (!validate()) {
        console.log('Validación fallida', errors);
        return;
    }
    console.log('Intentando login con:', email);
    const result = await login(email, password);
    console.log('Resultado login:', result);
    if (!result.success) {
      setErrors({ general: result.error });
    }
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
          className="px-8"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-10 items-center">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-md shadow-purple-200">
               <Feather name="box" size={40} color="#7C3AED" />
            </View>
            <Text className="mb-1 text-3xl font-bold text-gray-900">
              Bienvenido
            </Text>
            <Text className="text-center text-base text-gray-500">
              Accede a tu cuenta de VRChat
            </Text>
          </View>

          {/* Form */}
          <View className="w-full">
            {errors.general && (
              <View className="mb-6 flex-row items-center rounded-xl bg-red-50 p-4 border border-red-100">
                <Feather name="alert-circle" size={20} color="#EF4444" />
                <Text className="ml-3 flex-1 text-sm font-medium text-red-500">{errors.general}</Text>
              </View>
            )}

            <InputField
              label="Usuario o Correo"
              value={email}
              onChangeText={setEmail}
              placeholder="Introduce tu usuario"
              focusedName="email"
              focusedInput={focusedInput}
              setFocusedInput={setFocusedInput}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />

            <InputField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              focusedName="password"
              focusedInput={focusedInput}
              setFocusedInput={setFocusedInput}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />

            <TouchableOpacity className="mb-8 items-end">
              <Text className="text-sm font-medium text-purple-600">
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="mt-2 w-full"
            >
              <LinearGradient
                colors={['#8B5CF6', '#3B82F6']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    borderRadius: 12, 
                    paddingVertical: 16, 
                    width: '100%', // FORCE WIDTH
                    shadowColor: '#A855F7', 
                    shadowOffset: { width: 0, height: 10 }, 
                    shadowOpacity: 0.3, 
                    shadowRadius: 10, 
                    elevation: 5 
                }}
              >
                {loading ? (
                   <Text className="font-bold text-white">Iniciando...</Text>
                ) : (
                   <Text className="text-lg font-bold text-white">Iniciar Sesión</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View className="mt-8 flex-row justify-center">
              <Text className="text-gray-500">¿No tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="font-bold text-purple-600">Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
