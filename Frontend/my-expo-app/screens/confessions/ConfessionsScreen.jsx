import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import useConfessionsStore from 'stores/confessionsStore';
import ConfessionCard from '../../components/confessions/ConfessionCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const ConfessionsScreen = ({ navigation }) => {
  const { confessions, fetchConfessions, categories, setFilters, filters } = useConfessionsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);

  const communities = [
    { id: 'es', name: 'Español' },
    { id: 'en', name: 'English' },
    { id: 'pt', name: 'Português' },
    { id: 'fr', name: 'Français' },
    { id: 'de', name: 'Deutsch' },
    { id: 'it', name: 'Italiano' },
    { id: 'zh', name: '中文' },
    { id: 'ja', name: '日本語' },
    { id: 'ko', name: '한국어' },
    { id: 'all', name: 'Todas' },
  ];

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    await fetchConfessions();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCategorySelect = (categoryId) => {
    setFilters({ ...filters, category: categoryId === 'all' ? null : categoryId });
    setShowCategoryModal(false);
  };

  const handleCommunitySelect = (communityId) => {
    setFilters({ ...filters, community: communityId === 'all' ? null : communityId });
    setShowCommunityModal(false);
  };

  const renderHeader = () => (
    <View className="px-6 pb-2 pt-6">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-white">Confesiones</Text>
        <TouchableOpacity
          className="rounded-full bg-purple-600 p-3"
          onPress={() => navigation.navigate('CreateConfession')}>
          <Feather name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <Text className="mb-4 text-gray-400">
        Comparte tus pensamientos o lee lo que otros tienen que decir
      </Text>

      {/* Filtros siempre visibles en una línea */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="mr-2 flex-1 flex-row items-center rounded-full bg-gray-800 px-3 py-2"
            onPress={() => setShowCategoryModal(true)}>
            <FontAwesome5 name="tags" size={12} color="#9CA3AF" />
            <Text
              className="ml-1 flex-1 text-xs text-gray-300"
              numberOfLines={1}
              ellipsizeMode="tail">
              {filters.category
                ? categories.find((c) => c.id === filters.category)?.name
                : 'Categoría'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="mr-2 flex-1 flex-row items-center rounded-full bg-gray-800 px-3 py-2"
            onPress={() => setShowCommunityModal(true)}>
            <FontAwesome5 name="globe" size={12} color="#9CA3AF" />
            <Text
              className="ml-1 flex-1 text-xs text-gray-300"
              numberOfLines={1}
              ellipsizeMode="tail">
              {filters.community
                ? communities.find((c) => c.id === filters.community)?.name
                : 'Comunidad'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-full bg-gray-800 px-3 py-2"
            onPress={() =>
              setFilters({ ...filters, sort: filters.sort === 'newest' ? 'trending' : 'newest' })
            }>
            <Feather
              name={filters.sort === 'newest' ? 'clock' : 'trending-up'}
              size={12}
              color="#9CA3AF"
            />
            <Text className="ml-1 text-xs text-gray-300" numberOfLines={1}>
              {filters.sort === 'newest' ? 'Recientes' : 'Populares'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicadores de filtros activos */}
      <View className="flex-row flex-wrap">
        {filters.category && (
          <View className="mb-2 mr-2 flex-row items-center rounded-full bg-purple-800 px-3 py-1">
            <Text className="text-xs text-white">
              {categories.find((c) => c.id === filters.category)?.name}
            </Text>
            <TouchableOpacity
              className="ml-1"
              onPress={() => setFilters({ ...filters, category: null })}>
              <Feather name="x" size={14} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {filters.language && (
          <View className="mb-2 mr-2 flex-row items-center rounded-full bg-blue-800 px-3 py-1">
            <Text className="text-xs text-white">
              {communities.find((c) => c.id === filters.language)?.name}
            </Text>
            <TouchableOpacity
              className="ml-1"
              onPress={() => setFilters({ ...filters, language: null })}>
              <Feather name="x" size={14} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {filters.community && (
          <View className="mb-2 mr-2 flex-row items-center rounded-full bg-blue-800 px-3 py-1">
            <Text className="text-xs text-white">
              {communities.find((c) => c.id === filters.community)?.name}
            </Text>
            <TouchableOpacity
              className="ml-1"
              onPress={() => setFilters({ ...filters, community: null })}>
              <Feather name="x" size={14} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {(filters.category || filters.language) && (
          <TouchableOpacity
            className="mb-2 flex-row items-center rounded-full bg-gray-800 px-3 py-1"
            onPress={() => setFilters({ ...filters, category: null, language: null })}>
            <Text className="text-xs text-gray-300">Limpiar filtros</Text>
          </TouchableOpacity>
        )}
        {(filters.category || filters.community) && (
          <TouchableOpacity
            className="mb-2 flex-row items-center rounded-full bg-gray-800 px-3 py-1"
            onPress={() => setFilters({ ...filters, category: null, community: null })}>
            <Text className="text-xs text-gray-300">Limpiar filtros</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View className="flex-1 items-center justify-center py-10">
      <Feather name="message-circle" size={50} color="#9CA3AF" />
      <Text className="mt-4 text-center text-lg text-gray-400">No hay confesiones disponibles</Text>
      <TouchableOpacity
        className="mt-4 rounded-full bg-purple-600 px-6 py-3"
        onPress={() => navigation.navigate('CreateConfession')}>
        <Text className="font-bold text-white">Crear la primera confesión</Text>
      </TouchableOpacity>
    </View>
  );

  // Modal para seleccionar categoría
  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-3xl bg-gray-900 p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-white">Seleccionar categoría</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-80">
            <TouchableOpacity
              className="flex-row items-center border-b border-gray-800 py-3"
              onPress={() => handleCategorySelect('all')}>
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                <Feather name="grid" size={16} color="white" />
              </View>
              <Text className="text-lg text-white">Todas las categorías</Text>
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="flex-row items-center border-b border-gray-800 py-3"
                onPress={() => handleCategorySelect(category.id)}>
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-purple-600">
                  <Text className="font-bold text-white">{category.name.charAt(0)}</Text>
                </View>
                <Text className="text-lg text-white">{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Modal para seleccionar comunidad
  const renderCommunityModal = () => (
    <Modal
      visible={showCommunityModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCommunityModal(false)}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-3xl bg-gray-900 p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-white">Seleccionar comunidad</Text>
            <TouchableOpacity onPress={() => setShowCommunityModal(false)}>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-80">
            {communities.map((community) => (
              <TouchableOpacity
                key={community.id}
                className="flex-row items-center border-b border-gray-800 py-3"
                onPress={() => handleCommunitySelect(community.id)}>
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-purple-600">
                  <FontAwesome5 name="globe" size={16} color="white" />
                </View>
                <Text className="text-lg text-white">{community.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <View className="flex-1 bg-[#121212]">
        <FlatList
          data={confessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mb-4 px-6">
              <ConfessionCard
                confession={item}
                onPress={() => navigation.navigate('ConfessionDetail', { confessionId: item.id })}
              />
            </View>
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
          }
        />
        {renderCategoryModal()}
        {renderCommunityModal()}
      </View>
    </SafeAreaView>
  );
};

export default ConfessionsScreen;
