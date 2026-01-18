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
const GRID_PADDING = 24;
const COLUMN_GAP = 16;
const COLUMN_WIDTH = (width - (GRID_PADDING * 2) - COLUMN_GAP) / 2;

// Platform options
const platforms = [
  { id: 'All', icon: 'grid', label: 'Todos' },
  { id: 'Quest', icon: 'smartphone', label: 'Quest' },
  { id: 'PC', icon: 'monitor', label: 'PC' },
];

// Sort filter options based on VRChat API
const sortOptions = [
  { value: 'heat', label: 'Tendencias', icon: 'trending-up' },
  { value: 'popularity', label: 'Popularidad', icon: 'star' },
  { value: 'favorites', label: 'Favoritos', icon: 'heart' },
  { value: 'created', label: 'Más Nuevos', icon: 'clock' },
  { value: 'updated', label: 'Actualizados', icon: 'refresh-cw' },
  { value: 'shuffle', label: 'Aleatorio', icon: 'shuffle' },
];

const WorldHeader = React.memo(({ 
  user, 
  searchQuery, 
  setSearchQuery, 
  activePlatform, 
  setActivePlatform, 
  activeSort, 
  setActiveSort, 
  getDynamicTitle, 
  handleSearch,
  worlds,
  debouncedSearchQuery
}) => {
  return (
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

      {/* Platform Filters - Fixed below Search */}
      <View className="mb-4 flex-row justify-between">
        {platforms.map((platform) => {
            const isActive = activePlatform === platform.id;
            return (
                <TouchableOpacity
                    key={platform.id}
                    onPress={() => setActivePlatform(platform.id)}
                    className={`flex-1 flex-row items-center justify-center rounded-xl py-2.5 mx-1 ${isActive ? 'bg-[#8B5CF6]' : 'bg-white border border-gray-100'}`}
                    style={{ elevation: isActive ? 2 : 1 }}
                >
                    <Feather name={platform.icon} size={16} color={isActive ? 'white' : '#6B7280'} />
                    <Text className={`ml-2 font-bold text-sm ${isActive ? 'text-white' : 'text-gray-600'}`}>{platform.label}</Text>
                </TouchableOpacity>
            )
        })}
      </View>

      {/* Sort Filters - Horizontal Scroll (Smaller) */}
      <View className="mb-8">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24, paddingVertical: 4 }}
        >
          {sortOptions.map((option) => {
            const isActive = activeSort === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setActiveSort(option.value)}
                className={`mr-2.5 flex-row items-center rounded-full px-4 py-2 ${isActive ? 'bg-purple-600' : 'bg-white border border-gray-100'}`}
                style={{ elevation: isActive ? 2 : 0 }}
              >
                <Feather name={option.icon} size={14} color={isActive ? 'white' : '#6B7280'} />
                <Text className={`ml-1.5 font-bold text-xs ${isActive ? 'text-white' : 'text-gray-700'}`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Mundo del Día - Hero Destacado */}
      {!debouncedSearchQuery && worlds.length > 0 && (
        <View className="mb-8">
          <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-900">Mundo del Día</Text>
              <View className="bg-purple-100 px-2 py-1 rounded text-purple-700">
                  <Text className="text-xs font-bold text-purple-700 tracking-wider">DESTACADO</Text>
              </View>
          </View>
          
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
        </View>
      )}

      <View className="mb-4 flex-row items-center">
         <Feather name={sortOptions.find(o => o.value === activeSort)?.icon || "grid"} size={20} color="#8B5CF6" />
         <Text className="ml-2 text-xl font-bold text-gray-900">{getDynamicTitle()}</Text>
      </View>
    </View>
  );
});

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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activePlatform, setActivePlatform] = useState('All'); // 'All', 'Quest', 'PC'
  const [activeSort, setActiveSort] = useState('heat');

  // Dynamic titles based on selection
  const getDynamicTitle = () => {
    switch (activeSort) {
      case 'heat': return 'Tendencias Hoy';
      case 'popularity': return 'Más Populares';
      case 'favorites': return 'Favoritos de la Comunidad';
      case 'created': return 'Nuevos Descubrimientos';
      case 'updated': return 'Recién Actualizados';
      case 'shuffle': return 'Exploración Aleatoria';
      default: return 'Mundos Recomendados';
    }
  };

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
        sort: activeSort, // Use dynamic sort filter
        releaseStatus: 'public',
        search: debouncedSearchQuery.trim() || undefined,
        platform: platformParam,
      };

      console.log('Fetching with params:' , params);
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

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Initial load and filter changes
  useEffect(() => {
    fetchWorlds(true);
  }, [activeSort, activePlatform, debouncedSearchQuery]);

  // Pagination listener - only fetch more if page > 0
  useEffect(() => {
    if (page > 0) {
      console.log('Paginating to page:', page);
      fetchWorlds(false);
    }
  }, [page]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0); // Reset page triggers useEffect
    fetchWorlds(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1); // Increment triggers useEffect
    }
  };
  
  // Trigger search on submit (instant)
  const handleSearch = () => {
      setDebouncedSearchQuery(searchQuery);
      fetchWorlds(true);
  }

  const handleActivePlatformChange = (platform) => {
    setActivePlatform(platform);
    setPage(0);
    setHasMore(true);
  };

  const handleActiveSortChange = (sort) => {
    setActiveSort(sort);
    setPage(0);
    setHasMore(true);
  };


  // Grid Item Renderer
  const renderItem = ({ item }) => {
      return (
        <TouchableOpacity
            className="mb-5 rounded-2xl bg-white shadow-sm shadow-gray-200"
            style={{ 
                width: COLUMN_WIDTH, 
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
                data={debouncedSearchQuery ? worlds : worlds.slice(1)}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 100 }}
                columnWrapperStyle={{ 
                    paddingHorizontal: GRID_PADDING, 
                    justifyContent: 'space-between' 
                }}
                ListHeaderComponent={
                  <WorldHeader 
                    user={user}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activePlatform={activePlatform}
                    setActivePlatform={handleActivePlatformChange}
                    activeSort={activeSort}
                    setActiveSort={handleActiveSortChange}
                    getDynamicTitle={getDynamicTitle}
                    handleSearch={handleSearch}
                    worlds={worlds}
                    debouncedSearchQuery={debouncedSearchQuery}
                    navigation={navigation}
                  />
                }
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={handleRefresh} 
                        tintColor="#8B5CF6" 
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading && !refreshing ? (
                        <View className="py-5">
                            <ActivityIndicator size="small" color="#8B5CF6" />
                        </View>
                    ) : null
                }
            />
        )}
    </SafeAreaView>
  );
};

export default WorldsScreen;
