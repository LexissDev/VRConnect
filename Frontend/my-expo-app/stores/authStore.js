import { create } from 'zustand';
import supabase from 'services/supabase';

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  profile: null,
  loading: false,
  error: null,
  isVrchatUser: false,

  setIsVrchatUser: (isVrchatUser) => set({ isVrchatUser }),

  // Iniciar sesión
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Obtener perfil desde 'profiles'
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      set({
        user: data.user,
        session: data.session,
        profile: profileData,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Registrar usuario
  register: async (email, password, username, profileData = {}) => {
    set({ loading: true, error: null, setIsVrchatUser: false });
    try {
      // 1. Registrar al usuario

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('signUpData : ', signUpData);
      console.log('signUpError : ', signUpError);
      if (signUpError) {
        console.error('Error al registrar:', signUpError);
        return;
      }

      // 2. Obtener el ID del usuario registrado
      const userId = signUpData.user?.id;

      console.log('userId : ', userId); // Añade esta línea para imprimir el userId en la consola

      if (!userId) {
        console.error('No se pudo obtener el ID del usuario');
        return;
      }

      // 3. Crear el perfil vinculado al usuario
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        username,
        avatar_url: profileData.avatar_url || null,
        bio: profileData.bio || '',
        country: profileData.country || '',
        languages: profileData.languages || [],
      });

      if (profileError) {
        console.error('Error al guardar el perfil:', profileError);
      }

      // Recuperar perfil insertado
      const { data: insertedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      set({
        user: signUpData.user,
        session: signUpData.session,
        profile: insertedProfile,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .single();

      if (error) throw error;

      set({ profile: data, loading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Cerrar sesión
  logout: async () => {
    set({ loading: true });
    const { error } = await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      profile: null,
      loading: false,
      error: error?.message || null,
    });
  },

  // Verificar sesión activa y cargar perfil
  checkSession: async () => {
    set({ loading: true });
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      set({ user: null, session: null, profile: null, loading: false, error: error?.message });
      return;
    }

    const userId = data.session.user.id;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      set({ error: profileError.message, loading: false });
      return;
    }

    set({
      user: data.session.user,
      session: data.session,
      profile: profileData,
      loading: false,
    });
  },
}));

export default useAuthStore;
