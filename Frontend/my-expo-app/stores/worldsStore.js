import { create } from 'zustand';
import supabase from 'services/supabase';

const useWorldsStore = create((set, get) => ({
  worlds: [],
  filteredWorlds: [],
  currentWorld: null,
  loading: false,
  error: null,

  // Obtener todos los mundos
  fetchWorlds: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('worlds')
        .select('*, creator:creator_id(username, avatar_url)');

      if (error) throw error;

      set({ worlds: data, filteredWorlds: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Obtener un mundo por ID
  fetchWorldById: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('worlds')
        .select('*, creator:creator_id(username, avatar_url)')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Obtener el número de likes
      const { count, error: likesError } = await supabase
        .from('likes')
        .select('id', { count: 'exact' })
        .eq('world_id', id);

      if (likesError) throw likesError;

      set({
        currentWorld: { ...data, likes_count: count },
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Dar like a un mundo
  toggleLike: async (worldId) => {
    set({ loading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Debes iniciar sesión para dar like');
      }

      const userId = session.session.user.id;

      // Verificar si ya dio like
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', userId)
        .eq('world_id', worldId);

      if (checkError) throw checkError;

      if (existingLike.length > 0) {
        // Si ya dio like, lo quitamos
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', userId)
          .eq('world_id', worldId);

        if (deleteError) throw deleteError;
      } else {
        // Si no ha dado like, lo agregamos
        const { error: insertError } = await supabase
          .from('likes')
          .insert([{ user_id: userId, world_id: worldId }]);

        if (insertError) throw insertError;
      }

      // Actualizar el mundo actual si está cargado
      if (get().currentWorld && get().currentWorld.id === worldId) {
        get().fetchWorldById(worldId);
      }

      // Actualizar la lista de mundos
      get().fetchWorlds();

      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Filtrar mundos por nombre
  filterWorldsByName: (searchTerm) => {
    const { worlds } = get();
    const filtered = worlds.filter((world) =>
      world.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    set({ filteredWorlds: filtered });
  },

  // Ordenar mundos por likes
  sortWorldsByLikes: () => {
    const { filteredWorlds } = get();
    const sorted = [...filteredWorlds].sort((a, b) => b.likes_count - a.likes_count);
    set({ filteredWorlds: sorted });
  },
}));

export default useWorldsStore;
