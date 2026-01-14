import { create } from 'zustand';
import supabase from 'services/supabase';

const useEventsStore = create((set, get) => ({
  events: [],
  upcomingEvents: [],
  currentEvent: null,
  loading: false,
  error: null,

  // Obtener todos los eventos
  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Iniciando fetchEvents...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });
  
      if (error) {
        console.error('Error al obtener eventos:', error);
        throw error;
      }
  
      console.log('Datos recibidos de Supabase:', data);
      set({ events: data, loading: false });
      return data;
    } catch (error) {
      console.error('Error en fetchEvents:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Obtener eventos próximos (upcoming)
  fetchUpcomingEvents: async () => {
    set({ loading: true, error: null });
    try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gte('start_time', now) // Solo futuros
            .order('start_time', { ascending: true });

        if (error) throw error;

        set({ upcomingEvents: data, loading: false });
        return data;
    } catch (error) {
        console.error('Error en fetchUpcomingEvents:', error);
        set({ error: error.message, loading: false });
        // Fallback: usar fetchEvents si falla el filtro
        const allEvents = await get().fetchEvents();
        set({ upcomingEvents: allEvents });
        return allEvents;
    }
  },

  // Obtener un evento por ID
  fetchEventById: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, creator:creator_id(username, avatar_url), world:world_id(name, image_url)')
        .eq('id', id)
        .single();

      if (error) throw error;

      set({ currentEvent: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Crear un nuevo evento
  createEvent: async (eventData) => {
    set({ loading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Debes iniciar sesión para crear un evento');
      }

      const { title, description, world_id, start_time, end_time } = eventData;
      const creator_id = session.session.user.id;
      console.log("EventData de evento: ", eventData)

      const { data, error } = await supabase
        .from('events')
        .insert([{ title, description, world_id, creator_id, start_time, end_time }])
        .select();

        console.log("Data de evento: ", data)
      if (error) throw error;

      // Actualizar la lista de eventos
      get().fetchEvents();

      set({ loading: false });
      return { success: true, event: data[0] };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Actualizar un evento
  updateEvent: async (id, eventData) => {
    set({ loading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Debes iniciar sesión para actualizar un evento');
      }

      const { title, description, world_id, start_time, end_time } = eventData;
      const creator_id = session.session.user.id;

      // Verificar que el usuario sea el creador del evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('creator_id')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;

      if (eventData.creator_id !== creator_id) {
        throw new Error('No tienes permiso para editar este evento');
      }

      const { data, error } = await supabase
        .from('events')
        .update({ title, description, world_id, start_time, end_time })
        .eq('id', id)
        .select();

      if (error) throw error;

      // Actualizar la lista de eventos y el evento actual
      get().fetchEvents();
      set({ currentEvent: data[0], loading: false });

      return { success: true, event: data[0] };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Eliminar un evento
  deleteEvent: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Debes iniciar sesión para eliminar un evento');
      }

      const creator_id = session.session.user.id;

      // Verificar que el usuario sea el creador del evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('creator_id')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;

      if (eventData.creator_id !== creator_id) {
        throw new Error('No tienes permiso para eliminar este evento');
      }

      const { error } = await supabase.from('events').delete().eq('id', id);

      if (error) throw error;

      // Actualizar la lista de eventos
      get().fetchEvents();
      set({ currentEvent: null, loading: false });

      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },
}));

export default useEventsStore;
