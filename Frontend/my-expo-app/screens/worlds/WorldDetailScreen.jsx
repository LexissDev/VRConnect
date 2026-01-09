import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
  StyleSheet,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getWorldById } from '../../services/vrchat';

const { width } = Dimensions.get('window');

const WorldDetailScreen = ({ route, navigation }) => {
  const { worldId } = route.params;
  const [world, setWorld] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Valores para animaciones
  const scrollY = new Animated.Value(0);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 0.8],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [0, 0, -50],
    extrapolate: 'clamp',
  });

  const fetchWorldDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getWorldById(worldId);
      //console.log('World details:', response);
      console.log('response: ', response);

      if (response) {
        setWorld(response);
      } else {
        setError('No se pudo cargar la información del mundo');
      }
    } catch (error) {
      setError(`Error al cargar detalles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorldDetails();
    console.log('World details:', worldId);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Mira este increíble mundo en VRChat: ${world.name}!`,
        url: `https://vrchat.com/home/world/${world.id}`,
      });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aquí podrías implementar la lógica para guardar el favorito en la base de datos
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Desconocido';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#121212]">
        <ActivityIndicator size="large" color="#6200ee" />
        <Text className="mt-4 text-white">Cargando detalles del mundo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#121212] p-5">
        <Feather name="alert-circle" size={50} color="#ff6b6b" />
        <Text className="mb-5 mt-4 text-center text-base text-[#ff6b6b]">{error}</Text>
        <TouchableOpacity className="rounded bg-[#6200ee] px-5 py-2.5" onPress={fetchWorldDetails}>
          <Text className="font-bold text-white">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!world) {
    return (
      <View className="flex-1 items-center justify-center bg-[#121212] p-5">
        <Text className="text-center text-base text-white">
          No se encontró información del mundo
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      {/* Header animado */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          },
        ]}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white" numberOfLines={1}>
            {world.name}
          </Text>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}>
        {/* Imagen de portada con animación */}
        <View className="h-[250px] w-full overflow-hidden">
          <Animated.Image
            source={{
              uri:
                world.imageUrl ||
                world.thumbnailImageUrl ||
                'https://via.placeholder.com/500x250?text=VRChat+World',
            }}
            className="h-full w-full"
            style={{
              transform: [{ scale: imageScale }, { translateY: imageTranslateY }],
            }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}>
            <TouchableOpacity
              className="absolute left-4 top-4 rounded-full bg-black/30 p-2"
              onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              className="absolute right-4 top-4 rounded-full bg-black/30 p-2"
              onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Contenido principal */}
        <View className="px-5 py-4">
          {/* Título y acciones */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-2xl font-bold text-white">{world.name}</Text>
              <Text className="mt-1 text-sm text-gray-400">
                Por {world.authorName || 'Autor desconocido'}
              </Text>
            </View>
            <TouchableOpacity className="rounded-full bg-[#6200ee] p-3" onPress={toggleFavorite}>
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Estadísticas */}
          <View className="mb-6 flex-row justify-between rounded-xl bg-[#1E1E1E] p-4">
            <View className="items-center">
              <Text className="text-lg font-bold text-white">{world.occupants || 0}</Text>
              <Text className="text-xs text-gray-400">Visitantes</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-white">{world.favorites || 0}</Text>
              <Text className="text-xs text-gray-400">Favoritos</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-white">{world.visits || 0}</Text>
              <Text className="text-xs text-gray-400">Visitas</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-white">{world.heat || 'Normal'}</Text>
              <Text className="text-xs text-gray-400">Popularidad</Text>
            </View>
          </View>

          {/* Descripción */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-bold text-white">Descripción</Text>
            <Text className="text-gray-300">
              {world.description || 'No hay descripción disponible para este mundo.'}
            </Text>
          </View>

          {/* Información adicional */}
          <View className="mb-6 rounded-xl bg-[#1E1E1E] p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm text-gray-400">Fecha de creación</Text>
              <Text className="text-sm text-white">
                {formatDate(world.created_at || world.createdAt)}
              </Text>
            </View>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm text-gray-400">Última actualización</Text>
              <Text className="text-sm text-white">
                {formatDate(world.updated_at || world.updatedAt)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-400">Estado</Text>
              <View
                className={`rounded-full px-2 py-1 ${
                  world.releaseStatus === 'public'
                    ? 'bg-green-900'
                    : world.releaseStatus === 'private'
                      ? 'bg-red-900'
                      : 'bg-yellow-900'
                }`}>
                <Text className="text-xs font-medium text-white">
                  {world.releaseStatus === 'public'
                    ? 'Público'
                    : world.releaseStatus === 'private'
                      ? 'Privado'
                      : world.releaseStatus || 'Desconocido'}
                </Text>
              </View>
            </View>
          </View>

          {/* Imágenes adicionales (si estuvieran disponibles) */}
          {world.imageUrls && world.imageUrls.length > 0 && (
            <View className="mb-6">
              <Text className="mb-2 text-lg font-bold text-white">Galería</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {world.imageUrls.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    className="mr-3 h-[120px] w-[200px] rounded-lg"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
});

export default WorldDetailScreen;
