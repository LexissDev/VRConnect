import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import useAuthStore from 'stores/authStore';
import useEventsStore from 'stores/eventStore';
import { getWorlds } from 'services/vrchat';

import * as ImagePicker from 'expo-image-picker';
import cloudinary from 'services/cloudinary';

const CreateEventScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { createEvent, loading } = useEventsStore();
  
  // Estados para el formulario del evento
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000)); // +2 horas por defecto
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedWorld, setSelectedWorld] = useState(null);
  
  // Custom Image State
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false); // Estado para loading de imagen
  
  // Estados para el buscador de mundos
  const [worldSearchModalVisible, setWorldSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [worlds, setWorlds] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    sort: 'popularity',
    releaseStatus: 'public',
  });

  const pickImage = async () => {
    // Solicitar permisos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Se necesitan permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated to use array based on deprecation warning if applicable, or ImagePicker.MediaType.Images
      allowsEditing: true,
      aspect: [16, 9], // Aspect ratio para banners de eventos
      quality: 0.8,
    });

    if (!result.canceled) {
      setCustomImageUrl(result.assets[0].uri);
    }
  };

  // Función para buscar mundos
  const searchWorlds = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(0);
        setHasMore(true);
      }

      if (!hasMore && !refresh) return;

      setSearchLoading(true);
      setSearchError(null);

      const offset = refresh ? 0 : page * 10;

      const params = {
        n: 10,
        offset,
        sort: filters.sort,
        releaseStatus: filters.releaseStatus,
        search: searchQuery.trim() || undefined,
      };

      const response = await getWorlds(params);

      if (response && Array.isArray(response)) {
        if (response.length < 10) {
          setHasMore(false);
        }

        if (refresh) {
          setWorlds(response);
        } else {
          setWorlds((prevWorlds) => [...prevWorlds, ...response]);
        }
      } else {
        setSearchError('Formato de respuesta inesperado');
      }
    } catch (error) {
      setSearchError(`Error al buscar mundos: ${error.message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  // Cargar más mundos al hacer scroll
  const handleLoadMore = () => {
    if (!searchLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Efecto para cargar mundos cuando cambia la página
  useEffect(() => {
    if (worldSearchModalVisible) {
      searchWorlds();
    }
  }, [page, worldSearchModalVisible]);

  // Manejar cambios en los date pickers
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      
      // Si la fecha de fin es anterior a la nueva fecha de inicio, actualizar la fecha de fin
      if (endDate < selectedDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setHours(selectedDate.getHours() + 2); // +2 horas por defecto
        setEndDate(newEndDate);
      }
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Formatear fechas para mostrar
  const formatDateTime = (date) => {
    return format(date, "d 'de' MMMM, yyyy - HH:mm", { locale: es });
  };

  // Validar el formulario
  const validateForm = () => {
    if (!title.trim()) {
      alert('Por favor, ingresa un título para el evento');
      return false;
    }
    if (!description.trim()) {
      alert('Por favor, ingresa una descripción para el evento');
      return false;
    }
    if (!selectedWorld) {
      alert('Por favor, selecciona un mundo de VRChat para el evento');
      return false;
    }
    if (startDate >= endDate) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return false;
    }
    return true;
  };

  // Enviar el formulario
  const handleSubmit = async () => {
    if (!validateForm()) return;

    let finalImageUrl = useCustomImage ? customImageUrl : null;

    // Subir imagen si es local
    if (useCustomImage && customImageUrl && !customImageUrl.startsWith('http')) {
        setUploadingImage(true);
        try {
            finalImageUrl = await cloudinary.uploadToCloudinary(customImageUrl);
        } catch (error) {
            alert('Error al subir la imagen. Intenta de nuevo.');
            setUploadingImage(false);
            return;
        }
        setUploadingImage(false);
    }
  
    const eventData = {
      title,
      description,
      world_id: selectedWorld.id,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      image_url: finalImageUrl,
      world_data: {
        name: selectedWorld.name,
        image_url: selectedWorld.thumbnailImageUrl || selectedWorld.imageUrl,
        description: selectedWorld.description
      }
    };
  
    try {
      const result = await createEvent(eventData);
      console.log("Resultado completo:", result);

      
      if (result.success) {
        console.log("Evento creado exitosamente:", result.event);
        navigation.goBack();
      } else {
        alert(`Error al crear el evento: ${result.error}`);
      }
    } catch (error) {
      alert(`Error al crear el evento: ${error.message}`);
    }
  };

  // Renderizar un item de mundo en la lista de búsqueda
  const renderWorldItem = ({ item }) => (
    <TouchableOpacity
      className="mb-4 flex-row overflow-hidden rounded-lg bg-[#2A2A2A] shadow"
      onPress={() => {
        setSelectedWorld(item);
        setWorldSearchModalVisible(false);
      }}>
      <Image
        source={{ uri: item.thumbnailImageUrl || 'https://via.placeholder.com/150' }}
        className="h-[100px] w-[100px]"
        resizeMode="cover"
      />
      <View className="flex-1 justify-between p-2.5">
        <Text className="mb-1 text-base font-bold text-white">{item.name}</Text>
        <Text className="mb-2 text-sm text-[#ccc]">Por: {item.authorName}</Text>
        <View className="flex-row justify-between">
          <View className="flex-row items-center">
            <Ionicons name="people" size={16} color="#666" />
            <Text className="ml-1 text-xs text-[#ccc]">{item.occupants || 0}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="heart" size={16} color="#666" />
            <Text className="ml-1 text-xs text-[#ccc]">{item.favorites || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Modal de búsqueda de mundos
  const WorldSearchModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={worldSearchModalVisible}
      onRequestClose={() => setWorldSearchModalVisible(false)}>
      <View className="flex-1 bg-[#121212]">
        <SafeAreaView className="flex-1">
          <View className="flex-row items-center justify-between border-b border-[#333] p-4">
            <Text className="text-lg font-bold text-white">Seleccionar Mundo</Text>
            <TouchableOpacity onPress={() => setWorldSearchModalVisible(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Barra de búsqueda */}
          <View className="flex-row items-center bg-[#1E1E1E] px-2.5 py-2">
            <View className="h-10 flex-1 flex-row items-center rounded-lg bg-[#2A2A2A] px-2.5">
              <Ionicons name="search" size={20} color="#999" className="mr-2" />
              <TextInput
                className="h-10 flex-1 text-base text-white"
                placeholder="Buscar mundos..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => searchWorlds(true)}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    if (searchQuery) {
                      searchWorlds(true);
                    }
                  }}
                  className="p-1">
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              className="ml-2.5 rounded-lg bg-[#6200ee] px-4 py-2"
              onPress={() => searchWorlds(true)}>
              <Text className="font-bold text-white">Buscar</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de mundos */}
          <FlatList
            data={worlds}
            renderItem={renderWorldItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 10 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              searchLoading ? (
                <View className="py-5">
                  <ActivityIndicator size="large" color="#6200ee" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              !searchLoading ? (
                <View className="h-[400px] flex-1 items-center justify-center p-5">
                  <Ionicons name="search-outline" size={60} color="#666" />
                  <Text className="mb-3 mt-4 text-center text-base text-[#ccc]">
                    {searchQuery
                      ? 'No se encontraron mundos con tu búsqueda'
                      : 'Busca mundos para tu evento'}
                  </Text>
                </View>
              ) : null
            }
          />
        </SafeAreaView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        className="flex-1">
        <View className="flex-1 bg-[#121212]">
          {/* Encabezado */}
          <View className="flex-row items-center justify-between border-b border-[#333] p-4">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">Crear Evento</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Título */}
            <Text className="mb-2 text-base font-bold text-white">Título del evento</Text>
            <TextInput
              className="mb-4 rounded-lg bg-[#2A2A2A] p-3 text-white"
              placeholder="Ingresa un título"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />

            {/* Descripción */}
            <Text className="mb-2 text-base font-bold text-white">Descripción</Text>
            <TextInput
              className="mb-4 h-24 rounded-lg bg-[#2A2A2A] p-3 text-white"
              placeholder="Describe tu evento"
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            {/* Selector de mundo */}
            <Text className="mb-2 text-base font-bold text-white">Mundo de VRChat</Text>
            <TouchableOpacity
              className="mb-4 rounded-lg bg-[#2A2A2A] p-3"
              onPress={() => setWorldSearchModalVisible(true)}>
              {selectedWorld ? (
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: selectedWorld.thumbnailImageUrl || 'https://via.placeholder.com/50' }}
                    className="mr-3 h-12 w-12 rounded"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-base font-bold text-white">{selectedWorld.name}</Text>
                    <Text className="text-sm text-[#ccc]">Por: {selectedWorld.authorName}</Text>
                  </View>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Feather name="globe" size={24} color="#999" />
                  <Text className="ml-2 text-base text-[#999]">Seleccionar un mundo</Text>
                </View>
              )}
            </TouchableOpacity>
            {/* Selector de Imagen */}
            <Text className="mb-2 text-base font-bold text-white">Imagen del evento</Text>
            <View className="mb-4">
                  {/* Selector de tipo de imagen */}
                  <View className="mb-2 flex-row">
                    <TouchableOpacity 
                      onPress={() => setUseCustomImage(false)}
                      className={`mr-2 flex-1 rounded-lg p-3 border ${!useCustomImage ? 'bg-purple-900 border-purple-500' : 'bg-[#2A2A2A] border-transparent'}`}>
                      <Text className={`text-center font-bold ${!useCustomImage ? 'text-white' : 'text-gray-400'}`}>Por defecto (Mundo)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setUseCustomImage(true)}
                      className={`ml-2 flex-1 rounded-lg p-3 border ${useCustomImage ? 'bg-purple-900 border-purple-500' : 'bg-[#2A2A2A] border-transparent'}`}>
                      <Text className={`text-center font-bold ${useCustomImage ? 'text-white' : 'text-gray-400'}`}>Personalizada</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {useCustomImage && (
                    <View>
                      <TouchableOpacity 
                        onPress={pickImage}
                        className="mb-3 flex-row items-center justify-center rounded-lg bg-[#3A3A8B] p-3">
                        <Feather name="image" size={20} color="white" />
                        <Text className="ml-2 font-bold text-white">Seleccionar de Galería</Text>
                      </TouchableOpacity>

                      <View className="flex-row items-center mb-2">
                          <View className="h-[1px] flex-1 bg-gray-700" />
                          <Text className="mx-2 text-xs text-gray-500">O ingresa URL</Text>
                          <View className="h-[1px] flex-1 bg-gray-700" />
                      </View>

                      <TextInput
                        className="mb-2 rounded-lg bg-[#2A2A2A] p-3 text-white"
                        placeholder="URL de la imagen (https://...)"
                        placeholderTextColor="#999"
                        value={customImageUrl}
                        onChangeText={setCustomImageUrl}
                      />
                      {customImageUrl ? (
                        <Image 
                          source={{ uri: customImageUrl }} 
                          className="h-40 w-full rounded-lg bg-[#2A2A2A]" 
                          resizeMode="cover"
                        />
                      ) : null}
                    </View>
                  )}
                </View>
            {/* Fecha y hora de inicio */}
            <Text className="mb-2 text-base font-bold text-white">Fecha y hora de inicio</Text>
            <TouchableOpacity
              className="mb-4 flex-row items-center rounded-lg bg-[#2A2A2A] p-3"
              onPress={() => setShowStartDatePicker(true)}>
              <Feather name="calendar" size={24} color="#999" />
              <Text className="ml-2 text-base text-white">{formatDateTime(startDate)}</Text>
            </TouchableOpacity>

            {/* Fecha y hora de fin */}
            <Text className="mb-2 text-base font-bold text-white">Fecha y hora de fin</Text>
            <TouchableOpacity
              className="mb-4 flex-row items-center rounded-lg bg-[#2A2A2A] p-3"
              onPress={() => setShowEndDatePicker(true)}>
              <Feather name="calendar" size={24} color="#999" />
              <Text className="ml-2 text-base text-white">{formatDateTime(endDate)}</Text>
            </TouchableOpacity>

            {/* Botón de crear evento */}
            <TouchableOpacity
              className="mt-4 rounded-lg bg-[#6200ee] p-4"
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-base font-bold text-white">Crear Evento</Text>
              )}
            </TouchableOpacity>
          </ScrollView>

          {/* Date Pickers */}
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="datetime"
              display="default"
              onChange={onStartDateChange}
              minimumDate={new Date()}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="datetime"
              display="default"
              onChange={onEndDateChange}
              minimumDate={startDate}
            />
          )}

          {/* Modal de búsqueda de mundos */}
          <WorldSearchModal />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateEventScreen;