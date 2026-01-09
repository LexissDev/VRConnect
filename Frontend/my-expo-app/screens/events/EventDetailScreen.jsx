import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import useEventsStore from 'stores/eventStore';
import useAuthStore from 'stores/authStore';
import { getWorldById } from 'services/vrchat';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useAuthStore();
  const { fetchEventById, currentEvent, loading, deleteEvent } = useEventsStore();
  const [worldDetails, setWorldDetails] = useState(null);
  const [loadingWorld, setLoadingWorld] = useState(false);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  useEffect(() => {
    if (currentEvent?.world_id) {
      loadWorldDetails();
    }
  }, [currentEvent]);

  const loadEventData = async () => {
    await fetchEventById(eventId);
  };

  const loadWorldDetails = async () => {
    try {
      setLoadingWorld(true);
      const worldData = await getWorldById(currentEvent.world_id);
      setWorldDetails(worldData);
    } catch (error) {
      console.error('Error al cargar detalles del mundo:', error);
    } finally {
      setLoadingWorld(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM, yyyy - HH:mm", { locale: es });
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Eliminar evento',
      '¿Estás seguro de que quieres eliminar este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteEvent(eventId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (loading || !currentEvent) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      </SafeAreaView>
    );
  }

  const isCreator = user && currentEvent.creator_id === user.id;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <LinearGradient colors={['#000000', '#121212']} className="flex-1">
        <ScrollView className="flex-1">
          {/* Imagen del evento o del mundo */}
          {currentEvent?.image_url || worldDetails?.thumbnailImageUrl ? (
            <Image
              source={{ uri: currentEvent?.image_url || worldDetails?.thumbnailImageUrl }}
              className="h-60 w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-60 w-full items-center justify-center bg-purple-900">
              <Feather name="globe" size={60} color="white" />
            </View>
          )}

          {/* Botón de volver */}
          <TouchableOpacity
            className="absolute left-4 top-4 rounded-full bg-black/50 p-2"
            onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          {/* Contenido del evento */}
          <View className="p-4">
            <Text className="mb-2 text-2xl font-bold text-white">{currentEvent.title}</Text>

            {/* Fechas */}
            <View className="mb-4 rounded-lg bg-[#2A2A2A] p-3">
              <View className="mb-2 flex-row items-center">
                <Feather name="calendar" size={18} color="#9CA3AF" />
                <Text className="ml-2 text-base text-white">Inicio: {formatDateTime(currentEvent.start_time)}</Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="clock" size={18} color="#9CA3AF" />
                <Text className="ml-2 text-base text-white">Fin: {formatDateTime(currentEvent.end_time)}</Text>
              </View>
            </View>

            {/* Descripción */}
            <Text className="mb-1 text-lg font-bold text-white">Descripción</Text>
            <Text className="mb-4 text-base text-gray-300">{currentEvent.description}</Text>

            {/* Información del mundo */}
            <Text className="mb-1 text-lg font-bold text-white">Mundo de VRChat</Text>
            {loadingWorld ? (
              <ActivityIndicator size="small" color="#6200ee" />
            ) : (
              <View className="mb-4 rounded-lg bg-[#2A2A2A] p-3">
                {worldDetails ? (
                  <>
                    <Text className="mb-1 text-base font-bold text-white">{worldDetails.name}</Text>
                    <Text className="mb-2 text-sm text-gray-400">Por: {worldDetails.authorName}</Text>
                    <TouchableOpacity
                      className="mt-2 flex-row items-center"
                      onPress={() => navigation.navigate('WorldDetail', { worldId: currentEvent.world_id })}>
                      <Text className="text-sm font-bold text-purple-500">Ver detalles del mundo</Text>
                      <Feather name="chevron-right" size={16} color="#8B5CF6" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text className="text-base text-gray-400">Información del mundo no disponible</Text>
                )}
              </View>
            )}

            {/* Organizador */}
            <Text className="mb-1 text-lg font-bold text-white">Organizador</Text>
            <View className="mb-4 flex-row items-center">
              {currentEvent.creator?.avatar_url ? (
                <Image
                  source={{ uri: currentEvent.creator.avatar_url }}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-700">
                  <Text className="text-sm font-bold text-white">
                    {currentEvent.creator?.username?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <Text className="ml-2 text-base text-white">
                {currentEvent.creator?.username || 'Organizador desconocido'}
              </Text>
            </View>

            {/* Botones de acción */}
            <View className="mt-4 flex-row">
              <TouchableOpacity
                className="mr-2 flex-1 rounded-lg bg-[#6200ee] p-4"
                onPress={() => {
                  // Aquí iría la lógica para unirse al evento
                  Alert.alert('Unirse al evento', '¡Te has unido al evento!');
                }}>
                <Text className="text-center text-base font-bold text-white">Unirse al evento</Text>
              </TouchableOpacity>

              {isCreator && (
                <TouchableOpacity
                  className="ml-2 rounded-lg bg-red-600 p-4"
                  onPress={handleDeleteEvent}>
                  <Feather name="trash-2" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default EventDetailScreen;