import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

const WorldCard = ({ world, onPress, onLike }) => {
  return (
    <TouchableOpacity className="mb-4 overflow-hidden rounded-xl bg-gray-800" onPress={onPress}>
      {world.image_url ? (
        <Image source={{ uri: world.image_url }} className="h-40 w-full" resizeMode="cover" />
      ) : (
        <View className="h-40 w-full items-center justify-center bg-purple-900">
          <Feather name="globe" size={40} color="white" />
        </View>
      )}

      <View className="p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-white">{world.name}</Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={(e) => {
              e.stopPropagation();
              onLike && onLike(world.id);
            }}>
            <Feather name="heart" size={18} color="#E5E7EB" />
            <Text className="ml-1 text-gray-300">{world.likes_count || 0}</Text>
          </TouchableOpacity>
        </View>

        <Text className="mb-3 text-gray-400" numberOfLines={2}>
          {world.description}
        </Text>

        <View className="flex-row items-center">
          {world.creator?.avatar_url ? (
            <Image source={{ uri: world.creator.avatar_url }} className="h-6 w-6 rounded-full" />
          ) : (
            <View className="h-6 w-6 items-center justify-center rounded-full bg-purple-700">
              <Text className="text-xs font-bold text-white">
                {world.creator?.username?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <Text className="ml-2 text-sm text-gray-400">
            {world.creator?.username || 'Usuario desconocido'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default WorldCard;
