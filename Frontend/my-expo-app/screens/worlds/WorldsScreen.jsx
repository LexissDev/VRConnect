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
  Modal,
  ScrollView,
} from 'react-native';
import { getWorlds } from '../../services/vrchat';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const WorldsScreen = ({ navigation }) => {
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Nuevos estados para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    sort: 'popularity',
    releaseStatus: 'public',
    featured: '',
    tag: '',
  });
  const [isSearching, setIsSearching] = useState(false);

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

      // Incluir parámetros de búsqueda y filtros
      const params = {
        n: 20,
        offset,
        sort: filters.sort,
        releaseStatus: filters.releaseStatus,
        search: searchQuery.trim() || undefined,
        tag: filters.tag || undefined,
        featured: filters.featured || undefined,
      };

      console.log('Fetching with params:', params);
      const response = await getWorlds(params);

      console.log('response: ', response);

      if (response && Array.isArray(response)) {
        if (response.length < 20) {
          setHasMore(false);
        }

        if (refresh) {
          setWorlds(response);
        } else {
          setWorlds((prevWorlds) => [...prevWorlds, ...response]);
        }
      } else {
        setError('Formato de respuesta inesperado');
      }
    } catch (error) {
      setError(`Error al cargar mundos: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsSearching(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWorlds(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Función para manejar la búsqueda
  const handleSearch = () => {
    setIsSearching(true);
    setPage(0);
    fetchWorlds(true);
  };

  // Función para aplicar filtros
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
    setPage(0);
    fetchWorlds(true);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      sort: 'popularity',
      releaseStatus: 'public',
      featured: '',
      tag: '',
    });
    setSearchQuery('');
    setPage(0);
    fetchWorlds(true);
  };

  useEffect(() => {
    fetchWorlds();
  }, [page]);

  const renderWorldItem = ({ item }) => (
    <TouchableOpacity
      className="mb-2.5 flex-row overflow-hidden rounded-lg bg-[#2A2A2A] shadow"
      onPress={() => navigation.navigate('WorldDetail', { worldId: item.id })}>
      <Image
        source={{ uri: item.thumbnailImageUrl || 'https://via.placeholder.com/150' }}
        className="h-[120px] w-[120px]"
        resizeMode="cover"
      />
      <View className="flex-1 justify-between p-2.5">
        <Text className="mb-1 text-base font-bold text-white">{item.name}</Text>
        <Text className="mb-2 text-sm text-[#ccc]">Por: {item.authorName}</Text>
        <View className="flex-row justify-between">
          <View className="flex-row items-center">
            <Ionicons name="people" size={16} color="#666" />
            <Text className="ml-1 text-xs text-[#ccc]">{item.occupants || 0}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="heart" size={16} color="#666" />
            <Text className="ml-1 text-xs text-[#ccc]">{item.favorites || 0}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time" size={16} color="#666" />
            <Text className="ml-1 text-xs text-[#ccc]">{formatDate(item.updated_at)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Desconocido';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Componente para el modal de filtros
  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isFilterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="max-h-[80%] rounded-t-[20px] bg-[#1E1E1E]">
          <View className="flex-row items-center justify-between border-b border-[#333] p-4">
            <Text className="text-lg font-bold text-white">Filtros</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4">
            {/* Ordenar por */}
            <Text className="mb-2 mt-4 text-base font-bold text-white">Ordenar por</Text>
            <View className="flex-row flex-wrap">
              {[
                { value: 'popularity', label: 'Popularidad' },
                { value: 'created', label: 'Fecha de creación' },
                { value: 'updated', label: 'Última actualización' },
                { value: '_created_at', label: 'Más recientes' },
                { value: 'heat', label: 'Tendencia' },
                { value: 'name', label: 'Nombre' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`mb-2 mr-2 rounded-full bg-[#2A2A2A] px-3 py-2 ${
                    filters.sort === option.value ? 'bg-[#6200ee]' : ''
                  }`}
                  onPress={() => setFilters({ ...filters, sort: option.value })}>
                  <Text
                    className={`text-sm ${
                      filters.sort === option.value ? 'font-bold text-white' : 'text-[#ccc]'
                    }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Estado de publicación */}
            <Text className="mb-2 mt-4 text-base font-bold text-white">Estado</Text>
            <View className="flex-row flex-wrap">
              {[
                { value: 'public', label: 'Público' },
                { value: 'private', label: 'Privado' },
                { value: 'all', label: 'Todos' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`mb-2 mr-2 rounded-full bg-[#2A2A2A] px-3 py-2 ${
                    filters.releaseStatus === option.value ? 'bg-[#6200ee]' : ''
                  }`}
                  onPress={() => setFilters({ ...filters, releaseStatus: option.value })}>
                  <Text
                    className={`text-sm ${
                      filters.releaseStatus === option.value
                        ? 'font-bold text-white'
                        : 'text-[#ccc]'
                    }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Destacados */}
            <Text className="mb-2 mt-4 text-base font-bold text-white">Destacados</Text>
            <View className="flex-row flex-wrap">
              {[
                { value: '', label: 'Todos' },
                { value: 'true', label: 'Destacados' },
                { value: 'false', label: 'No destacados' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`mb-2 mr-2 rounded-full bg-[#2A2A2A] px-3 py-2 ${
                    filters.featured === option.value ? 'bg-[#6200ee]' : ''
                  }`}
                  onPress={() => setFilters({ ...filters, featured: option.value })}>
                  <Text
                    className={`text-sm ${
                      filters.featured === option.value ? 'font-bold text-white' : 'text-[#ccc]'
                    }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Etiquetas populares */}
            <Text className="mb-2 mt-4 text-base font-bold text-white">Etiquetas populares</Text>
            <View className="flex-row flex-wrap">
              {[
                { value: '', label: 'Todas' },
                { value: 'game', label: 'Juego' },
                { value: 'social', label: 'Social' },
                { value: 'avatar', label: 'Avatar' },
                { value: 'quest', label: 'Quest' },
                { value: 'horror', label: 'Terror' },
                { value: 'music', label: 'Música' },
                { value: 'dance', label: 'Baile' },
                { value: 'adventure', label: 'Aventura' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`mb-2 mr-2 rounded-full bg-[#2A2A2A] px-3 py-2 ${
                    filters.tag === option.value ? 'bg-[#6200ee]' : ''
                  }`}
                  onPress={() => setFilters({ ...filters, tag: option.value })}>
                  <Text
                    className={`text-sm ${
                      filters.tag === option.value ? 'font-bold text-white' : 'text-[#ccc]'
                    }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View className="flex-row justify-between border-t border-[#333] p-4">
            <TouchableOpacity
              className="rounded-lg border border-[#6200ee] px-4 py-2.5"
              onPress={clearFilters}>
              <Text className="font-bold text-[#6200ee]">Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-lg bg-[#6200ee] px-4 py-2.5"
              onPress={() => applyFilters(filters)}>
              <Text className="font-bold text-white">Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (error && worlds.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#121212] p-5">
        <Text className="mb-5 text-center text-base text-[#ff6b6b]">{error}</Text>
        <TouchableOpacity
          className="rounded bg-[#6200ee] px-5 py-2.5"
          onPress={() => fetchWorlds(true)}>
          <Text className="font-bold text-white">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <View className="flex-1 bg-[#121212]">
        {/* Barra de búsqueda */}
        <View className="flex-row items-center bg-[#1E1E1E] px-2.5 py-2">
          <View className="h-10 flex-1 flex-row items-center rounded-lg bg-[#2A2A2A] px-2.5">
            <Ionicons name="search" size={20} color="#999" className="mr-2" />
            <TextInput
              className="h-10 flex-1 text-base text-white"
              placeholder="Buscar mundos..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  if (searchQuery) {
                    setPage(0);
                    fetchWorlds(true);
                  }
                }}
                className="p-1">
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            className="ml-2.5 h-10 w-10 items-center justify-center rounded-lg bg-[#2A2A2A]"
            onPress={() => setFilterModalVisible(true)}>
            <Ionicons
              name="options"
              size={22}
              color="#fff"
              style={{ transform: [{ rotate: '90deg' }] }}
            />
          </TouchableOpacity>
        </View>

        {/* Chips de filtros activos */}
        {(filters.sort !== 'popularity' ||
          filters.releaseStatus !== 'public' ||
          filters.featured !== '' ||
          filters.tag !== '') && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="bg-[#1E1E1E] px-2.5 py-2">
            {filters.sort !== 'popularity' && (
              <View className="mr-2 h-[36px] min-w-[100px] flex-row items-center rounded-full bg-[#6200ee] px-4 py-2">
                <Text
                  className="mr-1.5 flex-1 flex-shrink-0 text-xs text-white"
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  Orden: {getSortLabel(filters.sort)}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setFilters({ ...filters, sort: 'popularity' });
                    setPage(0);
                    fetchWorlds(true);
                  }}
                  className="ml-1">
                  <Ionicons name="close-circle" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {filters.releaseStatus !== 'public' && (
              <View className="mr-2 h-[36px] min-w-[100px] flex-row items-center rounded-full bg-[#6200ee] px-4 py-2">
                <Text
                  className="mr-1.5 flex-1 flex-shrink-0 text-xs text-white"
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  Estado:{' '}
                  {filters.releaseStatus === 'all'
                    ? 'Todos'
                    : filters.releaseStatus === 'private'
                      ? 'Privado'
                      : 'Público'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setFilters({ ...filters, releaseStatus: 'public' });
                    setPage(0);
                    fetchWorlds(true);
                  }}
                  className="ml-1">
                  <Ionicons name="close-circle" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {filters.featured !== '' && (
              <View className="mr-2 h-[36px] min-w-[100px] flex-row items-center rounded-full bg-[#6200ee] px-4 py-2">
                <Text
                  className="mr-1.5 flex-1 flex-shrink-0 text-xs text-white"
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {filters.featured === 'true' ? 'Destacados' : 'No destacados'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setFilters({ ...filters, featured: '' });
                    setPage(0);
                    fetchWorlds(true);
                  }}
                  className="ml-1">
                  <Ionicons name="close-circle" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {filters.tag !== '' && (
              <View className="mr-2 h-[36px] min-w-[100px] flex-row items-center rounded-full bg-[#6200ee] px-4 py-2">
                <Text
                  className="mr-1.5 flex-1 flex-shrink-0 text-xs text-white"
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  Tag: {filters.tag}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setFilters({ ...filters, tag: '' });
                    setPage(0);
                    fetchWorlds(true);
                  }}
                  className="ml-1">
                  <Ionicons name="close-circle" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Botón para limpiar todos los filtros */}
            <TouchableOpacity
              className="h-[36px] min-w-[100px] flex-row items-center justify-center rounded-full bg-[#444] px-4 py-2"
              onPress={clearFilters}>
              <Text className="text-xs font-medium text-white">Limpiar todo</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Indicador de búsqueda */}
        {isSearching && (
          <View className="flex-row items-center justify-center bg-[#1E1E1E] p-2">
            <ActivityIndicator size="small" color="#6200ee" />
            <Text className="ml-2 text-sm text-white">Buscando...</Text>
          </View>
        )}

        <FlatList
          data={worlds}
          renderItem={renderWorldItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6200ee']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && !refreshing ? (
              <View className="py-5">
                <ActivityIndicator size="large" color="#6200ee" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View className="h-[400px] flex-1 items-center justify-center p-5">
                <Ionicons name="search-outline" size={60} color="#666" />
                <Text className="mb-3 mt-4 text-center text-base text-[#ccc]">
                  No se encontraron mundos con los filtros actuales
                </Text>
                <TouchableOpacity
                  className="mt-2 rounded-full bg-[#6200ee] px-6 py-3"
                  onPress={clearFilters}>
                  <Text className="text-sm font-bold text-white">Limpiar filtros</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />

        {/* Modal de filtros */}
        <FilterModal />
      </View>
    </SafeAreaView>
  );
};

// Función auxiliar para obtener la etiqueta de ordenación
const getSortLabel = (sortValue) => {
  const sortOptions = {
    popularity: 'Popularidad',
    created: 'Fecha de creación',
    updated: 'Última actualización',
    _created_at: 'Más recientes',
    heat: 'Tendencia',
    name: 'Nombre',
  };
  return sortOptions[sortValue] || sortValue;
};

export default WorldsScreen;
