import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from 'stores/authStore';
import useConfessionsStore from 'stores/confessionsStore';

const CreateConfession = ({ navigation }) => {
  const { user } = useAuthStore();
  const { createConfession, loading, error: storeError, categories, communities } = useConfessionsStore();
  const [confessionText, setConfessionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [selectedCommunity, setSelectedCommunity] = useState('es');

  const handleSubmit = async () => {
    if (confessionText.trim().length < 10) {
      setError('La confesión debe tener al menos 10 caracteres');
      return;
    }

    setError(null);

    try {
      const result = await createConfession(
        confessionText, 
        isAnonymous, 
        selectedCategory, 
        selectedCommunity
      );

      if (result.success) {
        Alert.alert('Confesión enviada', 'Tu confesión ha sido publicada exitosamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        setError(
          result.error || 'Ha ocurrido un error al enviar tu confesión. Inténtalo de nuevo.'
        );
      }
    } catch (err) {
      setError('Ha ocurrido un error al enviar tu confesión. Inténtalo de nuevo.');
    }
  };

  // Componente para selección con iconos
  const SelectionGrid = ({ title, items, selectedId, onSelect }) => (
    <View className="mb-6 rounded-xl bg-[#1E1E1E] p-4">
      <Text className="mb-3 text-base font-medium text-white">{title}</Text>
      <View className="flex-row flex-wrap">
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            className={`m-1 rounded-xl ${
              selectedId === item.id ? 'bg-purple-600' : 'bg-[#333333]'
            } px-4 py-3`}
            onPress={() => onSelect(item.id)}>
            <Text
              className={`text-center text-sm ${
                selectedId === item.id ? 'text-white font-medium' : 'text-gray-300'
              }`}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
              <Text className="text-xl font-bold text-white">Nueva Confesión</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Formulario */}
            <View className="mb-6">
              <Text className="mb-2 text-base font-medium text-white">
                Comparte tu experiencia en VR
              </Text>
              <LinearGradient
                colors={['#9333EA', '#7E22CE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-xl p-1">
                <View className="rounded-lg bg-[#1E1E1E] p-2">
                  <TextInput
                    className="min-h-[150px] text-base text-white"
                    placeholder="Escribe tu confesión aquí..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                    value={confessionText}
                    onChangeText={setConfessionText}
                  />
                </View>
              </LinearGradient>
              {(error || storeError) && (
                <Text className="mt-2 text-sm text-red-500">{error || storeError}</Text>
              )}
            </View>

            {/* Selección de categoría con grid */}
            <SelectionGrid 
              title="Categoría" 
              items={categories} 
              selectedId={selectedCategory} 
              onSelect={setSelectedCategory} 
            />

            {/* Selección de comunidad con grid */}
            <SelectionGrid 
              title="Comunidad" 
              items={communities} 
              selectedId={selectedCommunity} 
              onSelect={setSelectedCommunity} 
            />

            {/* Opción de anonimato */}
            <View className="mb-8 rounded-xl bg-[#1E1E1E] p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-medium text-white">Publicar como anónimo</Text>
                  <Text className="text-sm text-gray-400">
                    {isAnonymous
                      ? 'Tu nombre no será visible para otros usuarios'
                      : `Se mostrará como: ${user?.username || 'Usuario'}`}
                  </Text>
                </View>
                <Switch
                  value={isAnonymous}
                  onValueChange={setIsAnonymous}
                  trackColor={{ false: '#3f3f46', true: '#9333EA' }}
                  thumbColor={isAnonymous ? '#d8b4fe' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Botón de enviar */}
            <TouchableOpacity
              className={`rounded-xl p-4 ${
                confessionText.trim().length < 10 ? 'bg-purple-900/50' : 'bg-purple-600'
              }`}
              onPress={handleSubmit}
              disabled={confessionText.trim().length < 10 || loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-base font-semibold text-white">
                  Publicar Confesión
                </Text>
              )}
            </TouchableOpacity>

            {/* Nota de privacidad */}
            <Text className="mt-4 text-center text-xs text-gray-400">
              Las confesiones pasan por un proceso de moderación antes de ser publicadas.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateConfession;
