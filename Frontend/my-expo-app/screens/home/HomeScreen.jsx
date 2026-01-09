import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from 'stores/authStore';
import useWorldsStore from 'stores/worldsStore';
import useEventsStore from 'stores/eventStore';
import useConfessionsStore from 'stores/confessionsStore';
import WorldCard from '../../components/world/WorldCard';
import EventCard from '../../components/event/EventCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser, getPopularWorlds } from 'services/vrchat';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { topWorlds, fetchTopWorlds } = useWorldsStore();
  const { upcomingEvents, fetchUpcomingEvents } = useEventsStore();
  const { fetchLatestConfessions } = useConfessionsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [latestConfessions, setLatestConfessions] = useState([]);
  const [popularWorlds, setPopularWorlds] = useState([]);

  useEffect(() => {
    const isCurrentUser = async () => {
      const isAuthenticated = await getCurrentUser();
      if (isAuthenticated.error) {
        navigation.navigate('VRChatLinkPrompt');
        return;
      }
      return isAuthenticated;
    };
    isCurrentUser();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      //await Promise.all([fetchTopWorlds(), fetchUpcomingEvents()]);
      const confessions = await fetchLatestConfessions();
      console.log('confessions: ', confessions);
      setLatestConfessions(confessions);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };
  useEffect(() => {
    loadPopularWorlds();
  },[])

  const loadPopularWorlds = async () => {
    try {
      const worlds = await getPopularWorlds(7);
      // Formatear los datos para que coincidan con la estructura esperada
      const formattedWorlds = worlds.map(world => ({
        id: world.id,
        name: world.name,
        description: world.description,
        image_url: world.imageUrl,
        likes_count: world.favorites,
        creator: {
          username: world.authorName
        }
      }));
      setPopularWorlds(formattedWorlds);
      return formattedWorlds;
    } catch (error) {
      console.error('Error cargando mundos populares:', error);
      return [];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Renderizador mejorado para el carrusel de confesiones
  const renderConfessionItem = ({ item }) => (
    <LinearGradient
      colors={['#9333EA', '#7E22CE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="mx-4 h-[180px] w-[220px] rounded-2xl p-4 shadow-lg"
      style={{ borderRadius: 20, overflow: 'hidden' }}>
      <View className="w-64 flex-1 justify-between">
        {/* Header con avatar y autor */}
        <View className="mb-1 flex-row items-center p-1">
          {item.author === 'Anónimo' ? (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-800">
              <Feather name="user" size={18} color="white" />
            </View>
          ) : (
            <Image source={{ uri: item.avatar }} className="h-10 w-10 rounded-full bg-purple-300" />
          )}

          <View className="ml-2">
            <Text className="font-medium text-white">{item.author}</Text>
          </View>
        </View>

        {/* Contenido de la confesión con truncado */}
        <View className="flex-1 p-1">
          <Text className="text-base font-bold text-white" numberOfLines={3} ellipsizeMode="tail">
            {item.text}
          </Text>
        </View>

        {/* Footer con likes - siempre abajo a la derecha */}
        <View className="flex-row items-center justify-end">
          <TouchableOpacity className="mr-3 flex-row items-center">
            <Feather name="heart" size={24} color="white" />
            <Text className="ml-1 text-sm text-white">{item.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  // Renderizador para el carrusel de mundos
  // Renderizador para el carrusel de mundos con estilo de slider

  // Renderizador para el carrusel de eventos
  const renderEventItem = ({ item }) => (
    <View className="mx-2 w-[300px]">
      <EventCard
        event={item}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      />
    </View>
  );

  // Componente para el botón "Ver todos"
  const SeeAllButton = ({ title, onPress }) => (
    <TouchableOpacity onPress={onPress} className="flex-row items-center">
      <Text className="mr-1 text-purple-500">{title}</Text>
      <Feather name="chevron-right" size={16} color="#8B5CF6" />
    </TouchableOpacity>
  );

  // Componente para la sección de carrusel
  const CarouselSection = ({
    title,
    data,
    renderItem,
    onSeeAll,
    emptyIcon,
    emptyText,
    itemHeight,
  }) => (
    <View className="mt-6 rounded-lg pb-2">
      <View className="mb-4 flex-row items-center justify-between px-6">
        <Text className="text-lg font-bold text-white">{title}</Text>
        <SeeAllButton title="Ver todos" onPress={onSeeAll} />
      </View>

      {data && data.length > 0 ? (
        <FlatList
          data={title === 'Mundos Populares' && data.length === 0 ? Array(5).fill(null) : data}
          renderItem={renderItem}
          keyExtractor={(item, index) => (item ? item.id.toString() : `demo-${index}`)}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={title === 'Mundos Populares' ? screenWidth * 0.8 + 16 : screenWidth * 0.6}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 10 }}
          style={{
            height: title === 'Mundos Populares' ? 220 : 150,
            borderRadius: 16,
          }}
          ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
          pagingEnabled={title === 'Mundos Populares'}
        />
      ) : (
        <View className="mx-6 flex h-[150px] items-center justify-center rounded-xl bg-gray-800">
          <Feather name={emptyIcon} size={32} color="#9CA3AF" />
          <Text className="mt-2 text-gray-400">{emptyText}</Text>
        </View>
      )}
    </View>
  );

  // Datos de ejemplo para mundos populares (demo)
  const demoWorlds = [
    {
      id: 1,
      name: 'VR Plaza',
      description: 'Un espacio social para conocer nuevos amigos',
      image: 'https://i.imgur.com/JQcWnwG.jpg',
      users: 245,
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Neon City',
      description: 'Explora una ciudad cyberpunk llena de luces y misterios',
      image: 'https://i.imgur.com/pYaO9jA.jpg',
      users: 189,
      rating: 4.6,
    },
    {
      id: 3,
      name: 'Fantasy Kingdom',
      description: 'Un reino mágico con dragones y aventuras',
      image: 'https://i.imgur.com/L8KiQLy.jpg',
      users: 312,
      rating: 4.9,
    },
    {
      id: 4,
      name: 'Space Station',
      description: 'Viaja al espacio y experimenta la gravedad cero',
      image: 'https://i.imgur.com/DvzYAUC.jpg',
      users: 156,
      rating: 4.5,
    },
    {
      id: 5,
      name: 'Tropical Paradise',
      description: 'Relájate en una playa virtual con amigos',
      image: 'https://i.imgur.com/HQmh5YN.jpg',
      users: 203,
      rating: 4.7,
    },
  ];

  // Componente para el slider de mundos populares
  const PopularWorldsSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleSlideChange = (index) => {
      setCurrentIndex(index);
    };

    // Usar datos reales o mostrar un placeholder si no hay datos
    const worldsToShow = popularWorlds.length > 0 ? popularWorlds : [];

    return (
      <View className="mt-6 pb-4">
        <View className="mb-4 flex-row items-center justify-between px-6">
          <Text className="text-lg font-bold text-white">Mundos Populares</Text>
          <SeeAllButton title="Ver todos" onPress={() => navigation.navigate('Worlds')} />
        </View>

        {worldsToShow.length > 0 ? (
          <>
            <FlatList
              data={worldsToShow}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / (screenWidth - 40));
                handleSlideChange(slideIndex);
              }}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  className="mx-5 overflow-hidden rounded-2xl"
                  style={{ width: screenWidth - 40, height: 220 }}
                  onPress={() => navigation.navigate('WorldDetail', { worldId: item.id })}>
                  <View className="relative h-full w-full">
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} className="h-full w-full" resizeMode="cover" />
                    ) : (
                      <View className="h-full w-full items-center justify-center bg-purple-900">
                        <Feather name="globe" size={40} color="white" />
                      </View>
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }}
                    />
                    <View className="absolute bottom-0 left-0 right-0 p-4">
                      <Text className="text-xl font-bold text-white">{item.name}</Text>
                      <Text className="text-sm text-gray-300" numberOfLines={2}>
                        {item.description}
                      </Text>

                      <View className="mt-2 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Feather name="user" size={14} color="#9CA3AF" />
                          <Text className="ml-1 text-xs text-gray-400">Creador: {item.creator?.username || 'Desconocido'}</Text>
                        </View>
                        <View className="flex-row items-center">
                          <Feather name="heart" size={14} color="#FBBF24" />
                          <Text className="ml-1 text-xs text-gray-400">{item.likes_count || 0}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />

            {/* Indicadores de posición */}
            <View className="mt-3 flex-row items-center justify-center">
              {worldsToShow.map((_, index) => (
                <View
                  key={index}
                  className={`mx-1 h-2 rounded-full ${
                    currentIndex === index ? 'w-6 bg-purple-500' : 'w-2 bg-gray-600'
                  }`}
                />
              ))}
            </View>
          </>
        ) : (
          <View className="mx-6 flex h-[220px] items-center justify-center rounded-xl bg-gray-800">
            <Feather name="globe" size={32} color="#9CA3AF" />
            <Text className="mt-2 text-gray-400">No hay mundos populares disponibles</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <ScrollView
        className="flex-1 bg-[#121212]"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
        }>
        {/* Header con saludo */}
        <View className="p-6 pb-2">
          <Text className="text-2xl font-bold text-white">
            Hola, {user?.username || 'Explorador'}
          </Text>
          <Text className="mt-1 text-base text-gray-400">Bienvenido a VRConnect</Text>
        </View>

        {/* Banner destacado */}
        <View className="mx-6 mt-4 overflow-hidden rounded-xl">
          <Image
            source={require('../../assets/mundoInicio.webp')}
            className="h-40 w-full rounded-xl"
            resizeMode="cover"
          />
          <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
            <Text className="text-lg font-bold text-white">Descubre nuevos mundos en VRChat</Text>
            <Text className="text-sm text-gray-300">Explora, conecta y comparte experiencias</Text>
          </View>
        </View>

        {/* Carrusel de Confesiones mejorado */}
        <CarouselSection
          title="Últimas Confesiones"
          data={latestConfessions}
          renderItem={renderConfessionItem}
          onSeeAll={() => navigation.navigate('Confessions')}
          emptyIcon="message-square"
          emptyText="No hay confesiones disponibles"
          itemHeight={200}
        />

        {/* Slider de Mundos Populares */}
        <PopularWorldsSlider />

        {/* Carrusel de Próximos Eventos */}
        <CarouselSection
          title="Próximos Eventos"
          data={upcomingEvents}
          renderItem={renderEventItem}
          onSeeAll={() => navigation.navigate('Events')}
          emptyIcon="calendar"
          emptyText="No hay eventos próximos"
          itemHeight={200}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
