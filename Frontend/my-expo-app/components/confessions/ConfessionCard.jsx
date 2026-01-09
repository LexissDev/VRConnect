import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, Alert, Pressable } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import useConfessionsStore from 'stores/confessionsStore';

const REACTION_TYPES = [
  { id: 'like', emoji: '👍' },
  { id: 'love', emoji: '❤️' },
  { id: 'haha', emoji: '😂' },
  { id: 'wow', emoji: '😮' },
  { id: 'sad', emoji: '😢' },
  { id: 'angry', emoji: '😡' },
];

const ConfessionCard = ({ confession, onPress }) => {
  const { reportConfession, addReaction } = useConfessionsStore();
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  // Animaciones
  const reactionContainerAnim = useRef(new Animated.Value(0)).current;
  const reactionScaleAnims = useRef(
    REACTION_TYPES.reduce((acc, reaction) => {
      acc[reaction.id] = new Animated.Value(0);
      return acc;
    }, {})
  ).current;

  const formattedDate = confession.created_at
    ? formatDistanceToNow(new Date(confession.created_at), { addSuffix: true, locale: es })
    : '';

  const toggleReactions = () => {
    if (showReactions) {
      // Ocultar reacciones con animación
      Animated.parallel([
        Animated.timing(reactionContainerAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        ...Object.values(reactionScaleAnims).map((anim) =>
          Animated.timing(anim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          })
        ),
      ]).start(() => setShowReactions(false));
    } else {
      // Mostrar reacciones con animación
      setShowReactions(true);
      Animated.parallel([
        Animated.timing(reactionContainerAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        ...Object.entries(reactionScaleAnims).map(([id, anim], index) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 150,
            delay: index * 50,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }
  };

  const handleReaction = async (reactionId) => {
    // Animar el emoji seleccionado
    Animated.sequence([
      Animated.timing(reactionScaleAnims[reactionId], {
        toValue: 1.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(reactionScaleAnims[reactionId], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Llamar a la función de reacción del store
    try {
      const result = await addReaction(confession.id, reactionId);
      if (!result.success) {
        Alert.alert('Error', result.error || 'No se pudo añadir la reacción');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al añadir la reacción');
    }

    // Ocultar el panel de reacciones
    setTimeout(() => {
      Animated.timing(reactionContainerAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowReactions(false));
    }, 300);
  };

  const handleReportPress = () => {
    setShowReportMenu(!showReportMenu);
  };

  const submitReport = async (reason) => {
    try {
      const result = await reportConfession(confession.id, reason);
      if (result.success) {
        Alert.alert('Gracias', 'Tu reporte ha sido enviado');
      } else {
        Alert.alert('Error', result.error || 'No se pudo enviar el reporte');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al enviar el reporte');
    } finally {
      setShowReportMenu(false);
    }
  };

  // Renderizar contadores de reacciones
  const renderReactionCounts = () => {
    if (!confession.reaction_counts) return null;

    const hasReactions = Object.values(confession.reaction_counts).some((count) => count > 0);
    if (!hasReactions) return null;

    return (
      <View className="mt-2 flex-row flex-wrap">
        {Object.entries(confession.reaction_counts).map(([type, count]) => {
          if (count === 0) return null;
          const reaction = REACTION_TYPES.find((r) => r.id === type);
          if (!reaction) return null;

          return (
            <View
              key={type}
              className="mb-1 mr-2 flex-row items-center rounded-full bg-gray-700 px-2 py-1">
              <Text className="text-sm">{reaction.emoji}</Text>
              <Text className="ml-1 text-xs text-white">{count}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View className="mb-4 overflow-hidden rounded-xl bg-gray-800">
      <Pressable
        onPress={onPress}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
        className="p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            {confession.is_anonymous ? (
              <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-700">
                <Feather name="user" size={18} color="white" />
              </View>
            ) : confession.user?.avatar_url ? (
              <Image
                source={{ uri: confession.user.avatar_url }}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-700">
                <Text className="text-lg font-bold text-white">
                  {confession.user?.username?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View className="ml-3 flex-1 flex-row items-center">
              <View className="flex-1">
                <Text className="font-bold text-white">
                  {confession.is_anonymous
                    ? 'Anónimo'
                    : confession.user?.username || 'Usuario desconocido'}
                </Text>
                <Text className="text-xs text-gray-400">{formattedDate}</Text>
              </View>

              {/* Categoría flotando al lado del nombre */}
              {confession.category && (
                <View className="ml-2 rounded-full bg-purple-800 px-3 py-1">
                  <Text className="text-xs text-white">
                    {confession.category.charAt(0).toUpperCase() + confession.category.slice(1)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View>
            <TouchableOpacity className="rounded-full p-2" onPress={handleReportPress}>
              <Feather name="more-vertical" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {showReportMenu && (
              <View className="absolute right-0 top-10 z-10 w-40 rounded-lg bg-gray-900 shadow-lg">
                <TouchableOpacity className="p-3" onPress={() => submitReport('inappropriate')}>
                  <Text className="text-white">Contenido inapropiado</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <Text className="mb-4 text-white">{confession.content}</Text>

        {/* Eliminar o comentar esta sección ya que ahora la categoría está arriba */}
        {/* 
        <View className="mb-3 flex-row">
          {confession.category && (
            <View className="mr-2 rounded-full bg-purple-800 px-3 py-1">
              <Text className="text-xs text-white">
                {confession.category.charAt(0).toUpperCase() + confession.category.slice(1)}
              </Text>
            </View>
          )}
        </View>
        */}

        {/* Mostrar contadores de reacciones */}
        {renderReactionCounts()}

        {/* Reacciones y comentarios */}
        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-4 flex-row items-center" onPress={toggleReactions}>
              <Feather name="heart" size={20} color="#9CA3AF" />
              <Text className="ml-2 text-gray-400">Reaccionar</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center" onPress={onPress}>
              <Feather name="message-circle" size={20} color="#9CA3AF" />
              <Text className="ml-2 text-gray-400">Comentarios</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Panel de reacciones */}
        {showReactions && (
          <Animated.View
            className="absolute bottom-16 left-4 flex-row rounded-full bg-gray-900 p-2 shadow-lg"
            style={{
              opacity: reactionContainerAnim,
              transform: [
                {
                  scale: reactionContainerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            }}>
            {REACTION_TYPES.map((reaction) => (
              <Animated.View
                key={reaction.id}
                style={{
                  transform: [{ scale: reactionScaleAnims[reaction.id] }],
                }}>
                <TouchableOpacity className="mx-1 p-2" onPress={() => handleReaction(reaction.id)}>
                  <Text className="text-2xl">{reaction.emoji}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </Pressable>
    </View>
  );
};

export default ConfessionCard;
