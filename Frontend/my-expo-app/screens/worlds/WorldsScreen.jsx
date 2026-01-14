import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { getWorlds } from '../../services/vrchat';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from 'stores/authStore';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // 2 columns with padding

const WorldsScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Modern Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlatform, setActivePlatform] = useState('All'); // 'All', 'Quest', 'PC'
  
  // Platform options
  const platforms = [
    { id: 'All', icon: 'grid', label: 'All' },
    { id: 'Quest', icon: 'smartphone', label: 'Quest' },
    { id: 'PC', icon: 'monitor', label: 'PC' },
  ];

  const fetchWorlds = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(0);
        setHasMore(true);
      }

      if (!hasMore && !refresh) return;

      setLoading(true);
      setError(null);

      const offset = refresh ? 0 : page * 20;
      console.log(`Cargando mundos... Page: ${page}, Offset: ${offset}, Refresh: ${refresh}`);

      // In VRChat API:
      // - platform='android' -> Quest compatible
      // - platform='standalonewindows' -> PC compatible
      // - undefined -> All
      
      let platformParam = undefined;
      if (activePlatform === 'Quest') platformParam = 'android';
      if (activePlatform === 'PC') platformParam = 'standalonewindows';
      
      const params = {
        n: 20,
        offset,
        sort: 'heat', // Trending
        releaseStatus: 'public',
        search: searchQuery.trim() || undefined,
        platform: platformParam,
      };

      // console.log('Fetching with params:', params);
      const response = await getWorlds(params);

      // console.log('Respuesta getWorlds: ', response);     

      if (response && Array.isArray(response)) {
        console.log(`Recibidos ${response.length} mundos.`);
        if (response.length < 20) {
          console.log('No hay más mundos (response < 20)');
          setHasMore(false);
        }

        if (refresh) {
          setWorlds(response);
        } else {
          setWorlds((prevWorlds) => [...prevWorlds, ...response]);
        }
      } else {
        // setError('Formato de respuesta inesperado'); // Fail silently or show empty
      }
    } catch (error) {
      console.error('Error fetching worlds:', error);
      // Stop pagination on error to prevent infinite loop
      if (!refresh) {
          setHasMore(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorlds(true);
  }, [activePlatform]); // Refetch when platform changes

  // Listener para paginación
  useEffect(() => {
      if (page > 0) {
          console.log(`Efecto de página disparado: ${page}`);
          fetchWorlds(false);
      }
  }, [page]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWorlds(true); // reset page to 0 inside
  };

  const handleLoadMore = () => {
    console.log(`Intentando cargar más... Loading: ${loading}, HasMore: ${hasMore}`);
    if (!loading && hasMore) {
      console.log('Aumentando página...');
      setPage((prevPage) => prevPage + 1);
    }
  };
  
  // Trigger search on submit
  const handleSearch = () => {
      fetchWorlds(true);
  }

  // Header Component (Search + Filters + Featured)
  const ListHeader = () => (
    <View className="mb-4 px-6 pt-2">
      {/* Title Header */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-100 mr-3">
                <Feather name="compass" size={24} color="#8B5CF6" />
            </View>
            <Text className="text-3xl font-bold text-gray-900">Descubre</Text>
        </View>
        
        <View className="flex-row items-center space-x-3">
             <TouchableOpacity className="relative">
                <Feather name="bell" size={24} color="#4B5563" />
                <View className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border border-white" />
             </TouchableOpacity>
             <Image 
                source={{ uri: user?.profile?.avatar_url || 'https://via.placeholder.com/40' }}
                className="h-9 w-9 rounded-full border border-gray-200"
            />
        </View>
      </View>

      {/* Search Bar */}
      <View className="mb-6 flex-row items-center rounded-2xl bg-white px-4 py-3 shadow-sm border border-gray-100">
        <Feather name="search" size={20} color="#9CA3AF" />
        <TextInput
          className="ml-3 flex-1 text-base text-gray-700"
          placeholder="Buscar mundos..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Platform Filters */}
      <View className="mb-8 flex-row justify-between">
        {platforms.map((platform) => {
            const isActive = activePlatform === platform.id;
            return (
                <TouchableOpacity
                    key={platform.id}
                    onPress={() => setActivePlatform(platform.id)}
                    className={`flex-1 flex-row items-center justify-center rounded-xl py-3 mx-1 ${isActive ? 'bg-[#8B5CF6]' : 'bg-white border border-gray-100'}`}
                    style={{ elevation: isActive ? 4 : 1 }}
                >
                    <Feather name={platform.icon} size={18} color={isActive ? 'white' : '#6B7280'} />
                    <Text className={`ml-2 font-bold ${isActive ? 'text-white' : 'text-gray-600'}`}>{platform.label}</Text>
                </TouchableOpacity>
            )
        })}
      </View>

      {/* World of the Day - Featured Hero */}
      <View className="mb-8">
        <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">World of the Day</Text>
            <View className="bg-purple-100 px-2 py-1 rounded text-purple-700">
                <Text className="text-xs font-bold text-purple-700 tracking-wider">FEATURED</Text>
            </View>
        </View>
        
        {worlds.length > 0 && (
            <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => navigation.navigate('WorldDetail', { worldId: worlds[0].id })}
                className="h-[220px] w-full overflow-hidden rounded-3xl bg-gray-200 shadow-lg shadow-purple-200"
            >
                <Image 
                    source={{ uri: worlds[0].thumbnailImageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    className="absolute bottom-0 left-0 right-0 h-32 justify-end p-5"
                >
                    <View className="mb-1 flex-row items-center">
                        <View className="h-2 w-2 rounded-full bg-green-400 mr-2" />
                        <Text className="text-xs font-bold text-gray-300 uppercase tracking-widest">{worlds[0].occupants} ONLINE</Text>
                    </View>
                    <Text className="text-2xl font-bold text-white leading-tight">{worlds[0].name}</Text>
                    <Text className="text-sm font-medium text-gray-300 mt-1">by {worlds[0].authorName}</Text>
                </LinearGradient>
            </TouchableOpacity>
        )}
      </View>

      <View className="mb-4 flex-row items-center justify-between">
         <Text className="text-xl font-bold text-gray-900">Trending Now</Text>
         <TouchableOpacity onPress={handleSearch}>
             <Text className="text-sm font-bold text-purple-600 flex-row items-center">
                 VIEW ALL <Feather name="arrow-right" size={14} />
             </Text>
         </TouchableOpacity>
      </View>
    </View>
  );

  // Grid Item Renderer
  const renderItem = ({ item, index }) => {
      // Skip the first item as it is featured
      if (index === 0 && !searchQuery) return null;

      return (
        <TouchableOpacity
            className="mb-5 rounded-2xl bg-white shadow-sm shadow-gray-200"
            style={{ 
                width: COLUMN_WIDTH, 
                marginLeft: index % 2 === 1 ? 16 : 0, // Gutter
                elevation: 2 
            }}
            onPress={() => navigation.navigate('WorldDetail', { worldId: item.id })}
        >
            <View className="h-[140px] w-full overflow-hidden rounded-t-2xl bg-gray-100 relative">
                <Image 
                    source={{ uri: item.thumbnailImageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                />
                 <View className="absolute top-2 right-2 h-8 w-8 items-center justify-center rounded-full bg-white/90">
                    <Feather name="monitor" size={14} color="#8B5CF6" /> 
                </View>
            </View>
            
            <View className="p-3">
                <Text className="mb-1 text-base font-bold text-gray-900 leading-5" numberOfLines={1}>{item.name}</Text>
                <Text className="text-xs text-gray-500 uppercase font-bold tracking-wide" numberOfLines={1}>{item.authorName}</Text>
            </View>
        </TouchableOpacity>
      );
  };


  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
        {loading && !refreshing && worlds.length === 0 ? (
            <View className="flex-1 items-center justify-center">
                 <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        ) : (
            <FlatList
                data={worlds}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 100 }}
                columnWrapperStyle={{ paddingHorizontal: 24 }} // Padding for grid
                ListHeaderComponent={ListHeader}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8B5CF6" />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
            />
        )}
    </SafeAreaView>
  );
};

export default WorldsScreen;
