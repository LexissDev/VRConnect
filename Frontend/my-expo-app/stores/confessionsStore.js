import { create } from 'zustand';
import supabase from 'services/supabase';

const useConfessionsStore = create((set, get) => ({
  confessions: [],
  featuredConfessions: [],
  categories: [
    { id: 'romance', name: 'Romance' },
    { id: 'drama', name: 'Drama' },
    { id: 'opinion', name: 'Opinión' },
    { id: 'other', name: 'Otros' },
  ],
  communities: [
    { id: 'es', name: 'Español' },
    { id: 'en', name: 'English' },
    { id: 'pt', name: 'Português' },
    { id: 'fr', name: 'Français' },
    { id: 'de', name: 'Deutsch' },
    { id: 'it', name: 'Italiano' },
    { id: 'zh', name: '中文' },
    { id: 'ja', name: '日本語' },
    { id: 'ko', name: '한국어' }
  ],
  reactions: [
    { id: 'like', emoji: '👍', name: 'Me gusta' },
    { id: 'love', emoji: '❤️', name: 'Me encanta' },
    { id: 'haha', emoji: '😂', name: 'Me divierte' },
    { id: 'wow', emoji: '😮', name: 'Me sorprende' },
    { id: 'sad', emoji: '😢', name: 'Me entristece' },
    { id: 'angry', emoji: '😡', name: 'Me enoja' },
  ],
  loading: false,
  error: null,
  filters: {
    community: null,
    category: null,
    sort: 'newest',
  },

  // Establecer filtros
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  // Obtener todas las confesiones
  fetchConfessions: async () => {
    const state = get();
    set({ loading: true, error: null });
    try {
      const { community, category, sort } = state.filters;

      let query = supabase
        .from('confessions')
        .select(`
          *,
          user:profiles (id, username, avatar_url),
          reactions:confession_reactions (*),
          comments:confession_comments(count)
        `)
        .eq('is_hidden', false);

      // Aplicar filtros
      if (community) {
        query = query.eq('community', community);
      }

      if (category) {
        query = query.eq('category', category);
      }

      // Aplicar ordenamiento
      if (sort === 'trending') {
        query = query.order('likes_count', { ascending: false });
      } else if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sort === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Procesar las reacciones para cada confesión
      const processedData = data.map((confession) => {
        const reactionCounts = {};

        if (confession.reactions) {
          confession.reactions.forEach((reaction) => {
            if (!reactionCounts[reaction.reaction_type]) {
              reactionCounts[reaction.reaction_type] = 0;
            }
            reactionCounts[reaction.reaction_type]++;
          });
        }

        return {
          ...confession,
          reaction_counts: reactionCounts,
          comments_count: confession.comments ? confession.comments.count : 0,
          reactions: undefined, // No guardar todas las reacciones individuales
        };
      });

      set({ confessions: processedData, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Obtener confesiones destacadas
  fetchFeaturedConfessions: async (timeframe = 'day') => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('confessions')
        .select(
          `
          *, 
          user:auth.users!user_id(id, email)
        `
        )
        .eq('is_hidden', false)
        .order('likes_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      console.log("error:", error)

      set({ featuredConfessions: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Crear una nueva confesión
  createConfession: async (content, isAnonymous, category, community) => {
    set({ loading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Debes iniciar sesión para crear una confesión');
      }

      const userId = session.session.user.id;

      const { data, error } = await supabase
        .from('confessions')
        .insert([
          {
            content,
            user_id: userId,
            is_anonymous: isAnonymous,
            category,
            community,
            likes_count: 0,
            dislikes_count: 0,
            reports_count: 0,
            is_hidden: false,
          },
        ])
        .select();

      if (error) throw error;

      // Actualizar la lista de confesiones
      await get().fetchConfessions();

      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Añadir una reacción a una confesión
  addReaction: async (confessionId, reactionType) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Debes iniciar sesión para reaccionar');
      }

      const userId = session.session.user.id;

      // Verificar si ya existe una reacción
      const { data: existingReaction, error: checkError } = await supabase
        .from('confession_reactions')
        .select('*')
        .eq('confession_id', confessionId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // Si ya existe una reacción, actualizarla o eliminarla
      if (existingReaction) {
        // Si es la misma reacción, eliminarla (toggle)
        if (existingReaction.reaction_type === reactionType) {
          const { error: deleteError } = await supabase
            .from('confession_reactions')
            .delete()
            .eq('id', existingReaction.id);

          if (deleteError) throw deleteError;
        } else {
          // Si es una reacción diferente, actualizar
          const { error: updateError } = await supabase
            .from('confession_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);

          if (updateError) throw updateError;
        }
      } else {
        // Si no existe, crear una nueva reacción
        const { error: insertError } = await supabase
          .from('confession_reactions')
          .insert([{ confession_id: confessionId, user_id: userId, reaction_type: reactionType }]);

        if (insertError) throw insertError;
      }

      // Actualizar la lista de confesiones
      await get().fetchConfessions();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Añadir un comentario a una confesión
  addComment: async (confessionId, content, isAnonymous) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Debes iniciar sesión para comentar');
      }

      const userId = session.session.user.id;

      const { error } = await supabase.from('confession_comments').insert([
        {
          confession_id: confessionId,
          user_id: userId,
          content,
          is_anonymous: isAnonymous,
        },
      ]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reportar una confesión
  reportConfession: async (confessionId, reason) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Debes iniciar sesión para reportar');
      }

      const userId = session.session.user.id;

      // Verificar si ya ha reportado esta confesión
      const { data: existingReport, error: checkError } = await supabase
        .from('confession_reports')
        .select('*')
        .eq('confession_id', confessionId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingReport) {
        return { success: false, error: 'Ya has reportado esta confesión' };
      }

      // Crear el reporte
      const { error } = await supabase
        .from('confession_reports')
        .insert([{ confession_id: confessionId, user_id: userId, reason }]);

      if (error) throw error;

      // Actualizar la lista de confesiones
      await get().fetchConfessions();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obtener una confesión por ID con sus comentarios
  getConfessionById: async (confessionId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('confessions')
        .select(
          `
          *, 
          user:profiles(id, username, avatar_url),
          reactions:confession_reactions(*),
          comments:confession_comments(
            id,
            content,
            created_at,
            is_anonymous,
            user:profiles(id, username, avatar_url)
          )
        `
        )
        .eq('id', confessionId)
        .single();

      if (error) throw error;

      // Procesar las reacciones
      const reactionCounts = {};
      if (data.reactions) {
        data.reactions.forEach((reaction) => {
          if (!reactionCounts[reaction.reaction_type]) {
            reactionCounts[reaction.reaction_type] = 0;
          }
          reactionCounts[reaction.reaction_type]++;
        });
      }

      // Formatear la respuesta
      const result = {
        ...data,
        reaction_counts: reactionCounts,
        reactions: undefined, // No guardar todas las reacciones individuales
      };

      set({ loading: false });
      return { success: true, confession: result };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },
  // Obtener las últimas 5 confesiones para la pantalla de inicio
  fetchLatestConfessions: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('confessions')
        .select(`
          *,
          user:profiles (id, username, avatar_url),
          reactions:confession_reactions (*)
        `)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Procesar las reacciones para cada confesión
      const processedData = data.map((confession) => {
        const reactionCounts = {};

        if (confession.reactions) {
          confession.reactions.forEach((reaction) => {
            if (!reactionCounts[reaction.reaction_type]) {
              reactionCounts[reaction.reaction_type] = 0;
            }
            reactionCounts[reaction.reaction_type]++;
          });
        }

        // Determinar el avatar según la lógica de ConfessionCard
        let avatar;
        if (confession.is_anonymous) {
          // Para confesiones anónimas, usar un avatar generado con el ID como semilla
          avatar = `https://api.dicebear.com/7.x/avataaars/png?seed=${confession.id}`;
        } else if (confession.user?.avatar_url) {
          // Si el usuario tiene avatar, usarlo
          avatar = confession.user.avatar_url;
        } else {
          // Si no tiene avatar, generar uno con la inicial del nombre
          avatar = `https://api.dicebear.com/7.x/initials/png?seed=${confession.user?.username || 'U'}`;
        }

        return {
          id: confession.id,
          text: confession.content,
          author: confession.is_anonymous ? 'Anónimo' : confession.user?.username || 'Usuario',
          likes: Object.values(reactionCounts).reduce((sum, count) => sum + count, 0),
          avatar: avatar,
          created_at: confession.created_at
        };
      });

      set({ loading: false });
      return processedData;
    } catch (error) {
      set({ error: error.message, loading: false });
      return [];
    }
  },
}));

export default useConfessionsStore;
