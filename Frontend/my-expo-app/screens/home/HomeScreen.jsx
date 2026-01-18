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
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from 'stores/authStore';
import useWorldsStore from 'stores/worldsStore';
import useEventsStore from 'stores/eventStore';
import useConfessionsStore from 'stores/confessionsStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPopularWorlds } from 'services/vrchat';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { upcomingEvents, fetchUpcomingEvents } = useEventsStore();
  const { fetchLatestConfessions } = useConfessionsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [latestConfessions, setLatestConfessions] = useState([]);
  const [popularWorlds, setPopularWorlds] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const confessions = await fetchLatestConfessions();
      setLatestConfessions(confessions);
      /**
      const worlds = await getPopularWorlds(5);
      // Formatear los datos para que coincidan con la estructura esperada
      const formattedWorlds = worlds.map(world => ({
        id: world.id,
        name: world.name,
        description: world.description,
        image_url: world.imageUrl,
        likes_count: world.favorites,
        authorName: world.authorName
      }));
      setPopularWorlds(formattedWorlds);
      
      await fetchUpcomingEvents();
      */
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  /**
   * SECCIÓN: FEATURED WORLDS (Carrusel Horizontal Grande)
   */
  const renderFeaturedWorld = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('WorldDetail', { worldId: item.id })}
      style={{ width: screenWidth * 0.85 }}
      className="mr-5 h-52 overflow-hidden rounded-3xl bg-gray-200 shadow-md"
    >
      <Image 
        source={{ uri: item.image_url }} 
        className="h-full w-full"
        resizeMode="cover" 
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        className="absolute bottom-0 left-0 right-0 h-28 justify-end p-5"
      >
        <Text className="text-xl font-bold text-white shadow-sm">{item.name}</Text>
        <Text className="text-sm text-gray-300 shadow-sm">by {item.authorName || 'VRChat'}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  /**
   * SECCIÓN: LATEST CONFESSIONS (Tarjeta Limpia)
   */
  const renderConfessionCard = ({ item }) => (
     <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ConfessionDetail', { confessionId: item.id })} // Assuming this route exists
        className="mr-4 w-[280px] rounded-3xl bg-white p-5 shadow-sm shadow-purple-100" // Light shadow
        style={{ elevation: 2 }}
    >
        <View className="mb-3 flex-row items-center justify-between">
            <View className="rounded-full bg-purple-100 px-3 py-1">
                <Text className="text-xs font-bold text-purple-600">
                    {item.anonymous ? 'ANÓNIMO' : user?.username?.toUpperCase() || 'USUARIO'}
                </Text>
            </View>
            <Feather name="message-square" size={20} color="#E9D5FF" /> 
        </View>

        <Text className="mb-4 text-base font-medium leading-6 text-gray-700" numberOfLines={3}>
            "{item.text}"
        </Text>

        <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-400">Hace 12 min</Text>
            <View className="flex-row items-center space-x-3">
                 <View className="flex-row items-center">
                    <Feather name="heart" size={14} color="#9CA3AF" />
                    <Text className="ml-1 text-xs text-gray-500">{item.likes || 0}</Text>
                 </View>
                 <View className="flex-row items-center ml-2">
                    <Feather name="message-circle" size={14} color="#9CA3AF" />
                    <Text className="ml-1 text-xs text-gray-500">{item.comments || 0}</Text>
                 </View>
            </View>
        </View>
    </TouchableOpacity>
  );

  /**
   * SECCIÓN: TRENDING EVENTS (Lista Vertical o Horizontal)
   */
  const renderEventItem = ({ item }) => (
    <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
        className="mb-4 flex-row items-center rounded-3xl bg-white p-4 shadow-sm shadow-purple-100"
        style={{ elevation: 1 }}
    >
        {/* Icon Box */}
        <View className={`h-16 w-16 items-center justify-center rounded-2xl ${item.category === 'Music' ? 'bg-purple-100' : 'bg-gray-100'}`}>
            <Feather 
                name={item.category === 'Music' ? 'music' : 'calendar'} // Simple logic for demo
                size={24} 
                color={item.category === 'Music' ? '#9333EA' : '#6B7280'} 
            />
        </View>

        {/* Info */}
        <View className="flex-1 px-4">
             <View className="flex-row items-center mb-1">
                {item.is_live && (
                    <View className="mr-2 rounded bg-green-400 px-1.5 py-0.5">
                        <Text className="text-[10px] font-bold text-white">LIVE</Text>
                    </View>
                )}
                <Text className="text-xs font-bold text-purple-600 uppercase">
                    {item.is_live ? 'EN CURSO' : 'PRÓXIMAMENTE'}
                </Text>
             </View>
             
             <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{item.title}</Text>
             <Text className="text-sm text-gray-500">{item.location || 'VRChat'} • {item.attendees || 0} interesados</Text>
        </View>

        {/* Action Button */}
        <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-500 shadow-md shadow-purple-200">
             <Feather name="chevron-right" size={20} color="white" />
        </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER */}
        <View className="mb-6 flex-row items-center justify-between px-6 pt-4">
            <View className="flex-row items-center">
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Image
                        source={{ uri: user?.profile?.avatar_url || 'https://via.placeholder.com/100' }}
                        className="h-14 w-14 rounded-full border-2 border-purple-500" 
                    />
                    {/* Online Status Indicator */}
                    <View className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-400 border-2 border-white" />
                </TouchableOpacity>
                <View className="ml-3">
                    <Text className="text-xl font-bold text-gray-900">¡Hola, {user?.username}!</Text>
                    <Text className="text-sm text-purple-600 font-medium">Online en VRC</Text>
                </View>
            </View>

            <TouchableOpacity 
                onPress={logout}
                className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm"
            >
                <Feather name="log-out" size={24} color="#EF4444" />
            </TouchableOpacity>
        </View>

        {/* FEATURED WORLDS */}
        <View className="mb-8">
            <View className="mb-4 flex-row items-baseline justify-between px-6">
                <Text className="text-2xl font-bold text-gray-900">Featured Worlds</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Worlds')}>
                    <Text className="text-sm font-bold text-purple-600">Ver todos</Text>
                </TouchableOpacity>
            </View>
            
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={popularWorlds}
                keyExtractor={item => item.id.toString()}
                renderItem={renderFeaturedWorld}
                contentContainerStyle={{ paddingHorizontal: 24 }}
            />
        </View>

        {/* LATEST CONFESSIONS */}
        <View className="mb-8">
             <View className="mb-4 px-6">
                <Text className="text-2xl font-bold text-gray-900">Latest Confessions</Text>
            </View>

            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={latestConfessions}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                renderItem={renderConfessionCard}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                ListEmptyComponent={
                    <View className="ml-6 w-[280px] rounded-3xl bg-white p-5 shadow-sm items-center justify-center">
                        <Text className="text-gray-400">No hay confesiones recientes</Text>
                    </View>
                }
            />
        </View>

        {/* TRENDING EVENTS */}
        <View className="px-6">
             <View className="mb-4 flex-row items-baseline justify-between">
                <Text className="text-2xl font-bold text-gray-900">Trending Events</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Events')}>
                    <Text className="text-sm font-bold text-purple-600">Explorar</Text>
                </TouchableOpacity>
            </View>

            {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                    <View key={event.id || index}>
                        {renderEventItem({ item: event })}
                    </View>
                ))
            ) : (
                 <View className="rounded-3xl bg-white p-8 items-center shadow-sm">
                    <Feather name="calendar" size={40} color="#D1D5DB" />
                    <Text className="mt-2 text-gray-500">No hay eventos próximos hoy</Text>
                </View>
            )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
