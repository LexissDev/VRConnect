import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import useConfessionsStore from 'stores/confessionsStore';
import useAuthStore from 'stores/authStore';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const REACTION_TYPES = [
  { type: 'like', emoji: '👍' },
  { type: 'love', emoji: '❤️' },
  { type: 'haha', emoji: '😂' },
  { type: 'wow', emoji: '😮' },
  { type: 'sad', emoji: '😢' },
  { type: 'angry', emoji: '😡' },
];

// Componente de Avatar personalizado
const CustomAvatar = ({ isAnonymous, avatarUrl, username, size = 40 }) => {
  const defaultAvatarUrl = 'https://ui-avatars.com/api/?name=Anónimo&background=8B5CF6&color=fff';

  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={{ uri: isAnonymous ? defaultAvatarUrl : avatarUrl || defaultAvatarUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#4B5563',
        }}
      />
    </View>
  );
};

const ConfessionDetailScreen = ({ route, navigation }) => {
  const { confessionId } = route.params;
  const { user } = useAuthStore();
  const { getConfessionById, addComment, addReaction, reportConfession } = useConfessionsStore();

  const [confession, setConfession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  useEffect(() => {
    loadConfession();
  }, [confessionId]);

  const loadConfession = async () => {
    setLoading(true);
    try {
      const result = await getConfessionById(confessionId);
      if (result.success) {
        setConfession(result.confession);
      } else {
        throw new Error('No se pudo cargar la confesión');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la confesión');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const result = await addComment(confessionId, commentText, isAnonymous);
      if (result.success) {
        setCommentText('');
        await loadConfession();
      } else {
        Alert.alert('Error', result.error || 'No se pudo añadir el comentario');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al añadir el comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (reactionType) => {
    try {
      const result = await addReaction(confessionId, reactionType);
      if (result.success) {
        await loadConfession();
      } else {
        Alert.alert('Error', result.error || 'No se pudo añadir la reacción');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al añadir la reacción');
    } finally {
      setShowReactions(false);
    }
  };

  const handleReport = () => {
    Alert.alert('Reportar confesión', '¿Por qué quieres reportar esta confesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Contenido inapropiado', onPress: () => submitReport('inappropriate') },
      { text: 'Spam', onPress: () => submitReport('spam') },
      { text: 'Acoso', onPress: () => submitReport('harassment') },
      { text: 'Otro', onPress: () => submitReport('other') },
    ]);
  };

  const submitReport = async (reason) => {
    try {
      const result = await reportConfession(confessionId, reason);
      if (result.success) {
        Alert.alert('Gracias', 'Tu reporte ha sido enviado');
      } else {
        Alert.alert('Error', result.error || 'No se pudo enviar el reporte');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al enviar el reporte');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#121212]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!confession) {
    return (
      <SafeAreaView className="flex-1 bg-[#121212]">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-center text-lg text-white">No se encontró la confesión</Text>
          <TouchableOpacity
            className="mt-4 rounded-full bg-purple-600 px-6 py-3"
            onPress={() => navigation.goBack()}>
            <Text className="font-bold text-white">Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
    } catch (error) {
      return 'fecha desconocida';
    }
  };

  const renderReactionCount = () => {
    if (!confession.reaction_counts) return null;

    const totalReactions = Object.values(confession.reaction_counts).reduce(
      (sum, count) => sum + count,
      0
    );
    if (totalReactions === 0) return null;

    return (
      <View className="mt-2 flex-row items-center">
        <View className="flex-row">
          {Object.entries(confession.reaction_counts).map(([type, count]) => {
            if (count === 0) return null;
            const reaction = REACTION_TYPES.find((r) => r.type === type);
            return reaction ? (
              <Text key={type} className="mr-1 text-lg">
                {reaction.emoji}
              </Text>
            ) : null;
          })}
        </View>
        <Text className="ml-2 text-sm text-gray-400">{totalReactions}</Text>
      </View>
    );
  };

  const renderCommentItem = ({ item }) => (
    <View className="mb-4 border-b border-gray-800 pb-4 px-4">
      <View className="flex-row items-start">
        <CustomAvatar
          size={36}
          isAnonymous={item.is_anonymous}
          avatarUrl={item.user?.avatar_url}
          username={item.user?.username}
        />
        <View className="ml-2 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-bold text-white">
              {item.is_anonymous ? 'Anónimo' : item.user?.username}
            </Text>
            <Text className="text-xs text-gray-500">{formatDate(item.created_at)}</Text>
          </View>
          <Text className="mt-1 text-white">{item.content}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View className="flex-row items-center border-b border-gray-800 p-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Detalle de confesión</Text>
          <TouchableOpacity onPress={handleReport} className="ml-auto">
            <Feather name="flag" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={confession.comments || []}
          keyExtractor={(item) => item.id}
          renderItem={renderCommentItem}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          ListHeaderComponent={() => (
            <View className="p-4">
              <View className="mb-4 rounded-lg bg-gray-900 p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <CustomAvatar
                      size={40}
                      isAnonymous={confession.is_anonymous}
                      avatarUrl={confession.user?.avatar_url}
                      username={confession.user?.username}
                    />
                    <View className="ml-2">
                      <Text className="font-bold text-white">
                        {confession.is_anonymous ? 'Anónimo' : confession.user?.username}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {formatDate(confession.created_at)}
                      </Text>
                    </View>
                  </View>
                  <View className="rounded-full bg-purple-900 px-3 py-1">
                    <Text className="text-xs font-medium text-white">{confession.category}</Text>
                  </View>
                </View>

                <Text className="mt-4 text-lg text-white">{confession.content}</Text>

                {renderReactionCount()}

                <View className="mt-4 flex-row items-center justify-between">
                  <View className="flex-row">
                    <TouchableOpacity
                      onPress={() => setShowReactions(!showReactions)}
                      className="mr-4 flex-row items-center">
                      <Ionicons name="heart-outline" size={22} color="#9CA3AF" />
                      <Text className="ml-1 text-gray-400">Reaccionar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center">
                      <Ionicons name="chatbubble-outline" size={22} color="#9CA3AF" />
                      <Text className="ml-1 text-gray-400">
                        {confession.comments?.length || 0} Comentarios
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {showReactions && (
                  <View className="mt-2 flex-row flex-wrap justify-around rounded-lg bg-gray-800 p-2">
                    {REACTION_TYPES.map((reaction) => (
                      <TouchableOpacity
                        key={reaction.type}
                        onPress={() => handleReaction(reaction.type)}
                        className="p-2">
                        <Text className="text-2xl">{reaction.emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View className="mb-4">
                <Text className="mb-2 text-lg font-bold text-white">Comentarios</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-8 px-4">
              <Feather name="message-circle" size={40} color="#9CA3AF" />
              <Text className="mt-2 text-center text-gray-400">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </Text>
            </View>
          )}
          //contentContainerStyle={{ flexGrow: 1 }}
        />

        <View className="border-t border-gray-800 bg-gray-900 p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setIsAnonymous(!isAnonymous)}
              className="flex-row items-center">
              <Ionicons
                name={isAnonymous ? 'checkbox-outline' : 'square-outline'}
                size={20}
                color={isAnonymous ? '#8B5CF6' : '#9CA3AF'}
              />
              <Text className="ml-2 text-gray-400">Comentar anónimamente</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <TextInput
              className="flex-1 rounded-full bg-gray-800 px-4 py-2 text-white"
              placeholder="Escribe un comentario..."
              placeholderTextColor="#9CA3AF"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              className="ml-2 rounded-full bg-purple-600 p-2"
              onPress={handleAddComment}
              disabled={submitting || !commentText.trim()}>
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Feather name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConfessionDetailScreen;
