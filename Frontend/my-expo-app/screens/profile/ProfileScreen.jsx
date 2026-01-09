import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from 'stores/authStore';
import useProfileStore from 'stores/profileStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser, getFriends, getRecentWorlds } from 'services/vrchat';

const ProfileScreen = ({ navigation }) => {
  const { logout } = useAuthStore();
  const { profile, loading, error, fetchProfile, updateProfile, uploadAvatar } = useProfileStore();
  const { isVrchatUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [languages, setLanguages] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [vrchatUser, setVrchatUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [recentWorlds, setRecentWorlds] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingWorlds, setLoadingWorlds] = useState(false);

  // Función para cargar datos de VRChat
  const loadVRChatData = async () => {
    if (!isVrchatUser) return;

    try {
      // Cargar datos del usuario
      const userResponse = await getCurrentUser();
      if (userResponse.success) {
        setVrchatUser(userResponse.data);
      }

      // Cargar amigos
      loadVRChatFriends();

      // Cargar mundos recientes
      loadRecentWorlds();
    } catch (error) {
      console.error('Error al cargar datos de VRChat:', error);
    }
  };

  // Función para cargar amigos
  const loadVRChatFriends = async () => {
    if (!isVrchatUser) return;

    setLoadingFriends(true);
    try {
      const response = await getFriends();
      if (response && response.success) {
        setFriends(response.data);
      }
    } catch (error) {
      console.error('Error al cargar amigos de VRChat:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Función para cargar mundos recientes
  const loadRecentWorlds = async () => {
    if (!isVrchatUser) return;

    setLoadingWorlds(true);
    try {
      const response = await getRecentWorlds();
      if (response && response.success) {
        setRecentWorlds(response.data);
      }
    } catch (error) {
      console.error('Error al cargar mundos recientes de VRChat:', error);
    } finally {
      setLoadingWorlds(false);
    }
  };

  // Añadir esto al useEffect
  useEffect(() => {
    fetchProfile();

    if (isVrchatUser) {
      loadVRChatData();
    }
  }, [isVrchatUser]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setCountry(profile.country || '');
      setLanguages(profile.languages ? profile.languages.join(', ') : '');
      setAvatar(profile.avatar_url);
    }
  }, [profile]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Necesitamos permiso para acceder a tu galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const languagesArray = languages
        .split(',')
        .map((lang) => lang.trim())
        .filter((lang) => lang !== '');

      // Si el avatar ha cambiado, primero lo subimos
      if (avatar && avatar !== profile.avatar_url && !avatar.startsWith('http')) {
        const uploadResult = await uploadAvatar(avatar);
        if (uploadResult.success) {
          setAvatar(uploadResult.avatar_url);
        } else {
          throw new Error('No se pudo subir la imagen');
        }
      }

      // Actualizar el perfil
      const result = await updateProfile({
        username,
        bio,
        country,
        languages: languagesArray,
        avatar_url: avatar,
      });

      if (result.success) {
        setIsEditing(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      } else {
        throw new Error(result.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
      console.error(error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas cerrar sesión?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sí, cerrar sesión',
        onPress: logout,
        style: 'destructive',
      },
    ]);
  };

  if (loading && !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-[#121212]">
        <ActivityIndicator color="#8B5CF6" size="large" />
        <Text className="mt-4 text-lg text-white">Cargando perfil...</Text>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-[#121212]">
        <Feather name="alert-circle" size={50} color="#EF4444" />
        <Text className="mt-4 text-center text-lg text-white">
          Error al cargar el perfil: {error}
        </Text>
        <TouchableOpacity
          className="mt-6 rounded-xl bg-purple-600 px-6 py-3"
          onPress={fetchProfile}>
          <Text className="font-bold text-white">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-[#121212]">
        <Text className="text-lg text-white">No se encontró información del perfil</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <ScrollView className="flex-1">
        {/* Botones flotantes en la esquina superior derecha */}
        {!isEditing && (
          <View className="absolute right-6 top-12 z-10 flex-row">
            <TouchableOpacity
              className="mr-3 rounded-full bg-white/20 p-3"
              onPress={() => setIsEditing(true)}>
              <Feather name="edit-2" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="rounded-full bg-red-500/20 p-3" onPress={handleLogout}>
              <Feather name="log-out" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Cabecera con rectángulo celeste */}
        <View className="px-6 pb-4 pt-8">
          <View className="rounded-xl bg-[#4c80f1] p-6 shadow-lg">
            <View className="items-center">
              <View className="h-24 w-24 overflow-hidden rounded-full bg-white/20">
                {vrchatUser?.currentAvatarImageUrl ? (
                  <Image
                    source={{ uri: vrchatUser.currentAvatarImageUrl || profile?.avatar_url }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-full w-full items-center justify-center">
                    {profile.avatar_url ? (
                      <Image
                        source={{ uri: profile.avatar_url }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Feather />
                    )}
                  </View>
                )}
              </View>
              <Text className="mt-3 text-xl font-bold text-white">
                {vrchatUser?.displayName || profile?.username}
              </Text>
              <Text className="mt-1 text-sm text-white/80">
                {vrchatUser?.statusDescription || profile?.bio || ''}
              </Text>

              {/* Estadísticas de amigos */}
              {isVrchatUser && (
                <View className="mt-4 w-full flex-row justify-around">
                  <View className="items-center">
                    <Text className="text-lg font-bold text-white">
                      {friends.filter((f) => f.status === 'online').length || 0}
                    </Text>
                    <Text className="text-xs text-white/80">Conectados</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-bold text-white">
                      {friends.filter((f) => f.status !== 'online').length || 0}
                    </Text>
                    <Text className="text-xs text-white/80">Desconectados</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-bold text-white">{friends.length || 0}</Text>
                    <Text className="text-xs text-white/80">Total Amigos</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Contenido principal */}
        <View className="px-6">
          {/* Apartado de VRChat */}
          {!isVrchatUser ? (
            <TouchableOpacity
              className="mb-4 overflow-hidden rounded-xl"
              onPress={() => navigation.navigate('VRChatLogin')}>
              <View className="bg-[#232567] p-4">
                <View className="flex-row items-center">
                  <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-[#3A3A8B]">
                    <Feather name="globe" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-white">Conectar con VRChat</Text>
                    <Text className="text-sm text-gray-300">
                      Accede a mundos, amigos y eventos de VRChat
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={24} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <>
              {/* Sección de amigos */}
              <View className="mb-4 rounded-xl bg-[#232567] p-4">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-white">Amigos de VRChat</Text>
                  <TouchableOpacity
                    className="rounded-full bg-[#3A3A8B] p-2"
                    onPress={() => loadVRChatFriends()}>
                    <Feather name="refresh-cw" size={16} color="white" />
                  </TouchableOpacity>
                </View>

                {loadingFriends ? (
                  <ActivityIndicator color="#8B5CF6" size="small" />
                ) : friends && friends.length > 0 ? (
                  <View>
                    {friends.slice(0, 3).map((friend, index) => (
                      <View
                        key={index}
                        className="mb-2 flex-row items-center rounded-lg bg-[#3A3A8B] p-2">
                        <View className="mr-3 h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#232567]">
                          {friend.currentAvatarThumbnailImageUrl ? (
                            <Image
                              source={{ uri: friend.currentAvatarThumbnailImageUrl }}
                              className="h-10 w-10"
                              resizeMode="cover"
                            />
                          ) : (
                            <Feather name="user" size={18} color="white" />
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="font-medium text-white">{friend.displayName}</Text>
                          <View className="flex-row items-center">
                            <View
                              className={`mr-2 h-2 w-2 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}
                            />
                            <Text className="text-xs text-gray-300">
                              {friend.status === 'online' ? 'En línea' : 'Desconectado'}
                            </Text>
                          </View>
                        </View>
                        {friend.location && friend.location !== 'offline' && (
                          <View className="rounded-full bg-purple-900 px-2 py-1">
                            <Text className="text-xs text-white">En un mundo</Text>
                          </View>
                        )}
                      </View>
                    ))}

                    {friends.length > 3 && (
                      <TouchableOpacity
                        className="mt-2 items-center rounded-lg bg-[#3A3A8B] p-2"
                        onPress={() => navigation.navigate('VRChatFriends')}>
                        <Text className="text-sm font-medium text-white">Ver todos los amigos</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <Text className="text-center text-gray-300">No se encontraron amigos</Text>
                )}
              </View>

              {/* Sección de mundos recientes */}
              <View className="mb-4 rounded-xl bg-[#232567] p-4">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-white">Mundos Recientes</Text>
                  <TouchableOpacity
                    className="rounded-full bg-[#3A3A8B] p-2"
                    onPress={() => loadRecentWorlds()}>
                    <Feather name="refresh-cw" size={16} color="white" />
                  </TouchableOpacity>
                </View>

                {loadingWorlds ? (
                  <ActivityIndicator color="#8B5CF6" size="small" />
                ) : recentWorlds && recentWorlds.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                    {recentWorlds.map((world, index) => (
                      <TouchableOpacity
                        key={index}
                        className="mr-3 overflow-hidden rounded-lg"
                        onPress={() => navigation.navigate('WorldDetail', { worldId: world.id })}>
                        <View className="h-24 w-32 overflow-hidden bg-[#3A3A8B]">
                          {world.thumbnailImageUrl ? (
                            <Image
                              source={{ uri: world.thumbnailImageUrl }}
                              className="h-full w-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="h-full w-full items-center justify-center">
                              <Feather name="image" size={24} color="white" />
                            </View>
                          )}
                        </View>
                        <View className="bg-[#3A3A8B] p-2">
                          <Text className="text-xs font-medium text-white" numberOfLines={1}>
                            {world.name}
                          </Text>
                          <Text className="text-xs text-gray-300" numberOfLines={1}>
                            por {world.authorName}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <Text className="text-center text-gray-300">
                    No se encontraron mundos recientes
                  </Text>
                )}
              </View>
            </>
          )}

          {/* Resto del contenido existente */}
          {/* ... existing code ... */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
