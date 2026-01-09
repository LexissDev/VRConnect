import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import useEventStore from '../../stores/eventStore';
import EventCard from '../../components/event/EventCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const EventsScreen = ({ navigation }) => {
  const { events, fetchEvents, loading } = useEventStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('Cargando eventos...');
    await fetchEvents();
    console.log('Eventos cargados:', events.length);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getFilteredEvents = () => {
    const now = new Date();
    console.log('Total de eventos:', events.length);

    if (filter === 'upcoming') {
      return events.filter((event) => new Date(event.start_time) > now);
    } else if (filter === 'past') {
      return events.filter((event) => new Date(event.end_time) < now);
    }

    return events;
  };

  const renderHeader = () => (
    <View className="px-6 pb-2 pt-6">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-white">Eventos</Text>
        <TouchableOpacity
          className="rounded-full bg-purple-600 p-3"
          onPress={() => navigation.navigate('CreateEvent')}>
          <Feather name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View className="mb-4 flex-row">
        <TouchableOpacity
          className={`mr-2 rounded-full px-4 py-2 ${filter === 'upcoming' ? 'bg-purple-600' : 'bg-gray-700'}`}
          onPress={() => setFilter('upcoming')}>
          <Text className="text-white">Próximos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`mr-2 rounded-full px-4 py-2 ${filter === 'past' ? 'bg-purple-600' : 'bg-gray-700'}`}
          onPress={() => setFilter('past')}>
          <Text className="text-white">Pasados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`rounded-full px-4 py-2 ${filter === 'all' ? 'bg-purple-600' : 'bg-gray-700'}`}
          onPress={() => setFilter('all')}>
          <Text className="text-white">Todos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View className="flex-1 items-center justify-center py-10">
      <Feather name="calendar" size={50} color="#9CA3AF" />
      <Text className="mt-4 text-center text-lg text-gray-400">
        {loading ? 'Cargando eventos...' : 
          filter === 'upcoming'
            ? 'No hay eventos próximos'
            : filter === 'past'
              ? 'No hay eventos pasados'
              : 'No hay eventos disponibles'}
      </Text>
      <TouchableOpacity
        className="mt-4 rounded-full bg-purple-600 px-6 py-3"
        onPress={() => navigation.navigate('CreateEvent')}>
        <Text className="font-bold text-white">Crear un evento</Text>
      </TouchableOpacity>
    </View>
  );

  const filteredEvents = getFilteredEvents();

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <LinearGradient colors={['#121212', '#1E1E1E']} className="flex-1">
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mb-4 px-6">
              <EventCard
                event={item}
                onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
              />
            </View>
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
          }
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default EventsScreen;
