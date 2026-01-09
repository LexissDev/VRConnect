import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EventCard = ({ event, onPress }) => {
  // Usar start_time en lugar de event_date
  const startDate = event.start_time ? new Date(event.start_time) : null;
  const formattedStartDate = startDate
    ? format(startDate, "d 'de' MMMM, yyyy - HH:mm", { locale: es })
    : 'Fecha no disponible';

  // Formatear fecha de fin
  const endDate = event.end_time ? new Date(event.end_time) : null;
  const formattedEndTime = endDate
    ? format(endDate, "HH:mm", { locale: es })
    : '';

  return (
    <TouchableOpacity className="mb-4 overflow-hidden rounded-xl bg-gray-800" onPress={onPress}>
      {/* Usar la imagen del mundo si está disponible */}
      {event.world?.image_url ? (
        <Image source={{ uri: event.world.image_url }} className="h-40 w-full" resizeMode="cover" />
      ) : (
        <View className="h-40 w-full items-center justify-center bg-purple-900">
          <Feather name="globe" size={40} color="white" />
        </View>
      )}

      <View className="p-4">
        <Text className="mb-1 text-xl font-bold text-white">{event.title}</Text>

        <View className="mb-2 flex-row items-center">
          <Feather name="calendar" size={14} color="#9CA3AF" />
          <Text className="ml-1 text-sm text-gray-400">
            {formattedStartDate}{formattedEndTime ? ` - ${formattedEndTime}` : ''}
          </Text>
        </View>

        <Text className="mb-3 text-gray-400" numberOfLines={2}>
          {event.description}
        </Text>

        {/* Mostrar el nombre del mundo */}
        <View className="mb-3 flex-row items-center">
          <Feather name="globe" size={14} color="#9CA3AF" />
          <Text className="ml-1 text-sm text-gray-400">
            {event.world?.name || 'Mundo no especificado'}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            {event.creator?.avatar_url ? (
              <Image
                source={{ uri: event.creator.avatar_url }}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <View className="h-6 w-6 items-center justify-center rounded-full bg-purple-700">
                <Text className="text-xs font-bold text-white">
                  {event.creator?.username?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <Text className="ml-2 text-sm text-gray-400">
              {event.creator?.username || 'Organizador desconocido'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;
