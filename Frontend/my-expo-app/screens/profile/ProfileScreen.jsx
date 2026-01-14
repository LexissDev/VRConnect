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
             <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white text-lg font-bold">Mis Datos</Text>
             </View>
             
             {/* Aquí podrías poner estadísticas propias de la app o nada */}
             <View className="bg-[#2A2A2A] p-4 rounded-xl mb-4">
                 <Text className="text-gray-400">Nombre de usuario: {username}</Text>
                 <Text className="text-gray-400">Email: {useAuthStore.getState().user?.email}</Text>
             </View>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
