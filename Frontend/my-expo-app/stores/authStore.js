import { create } from 'zustand';
import supabase from '../services/supabase';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  error: null,

  // Login
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Cargar perfil tras login exitoso
      await get().fetchProfile(data.user.id);

      set({ user: data.user, loading: false });
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error en login:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Tu correo no ha sido confirmado. Por favor revisa tu bandeja de entrada.';
      } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Correo o contraseña incorrectos.';
      }

      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Registro: ahora solo email, password y username
  register: async (email, password, username) => {
    set({ loading: true, error: null });
    try {
      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // 2. Crear perfil en tabla 'profiles'
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id, 
            username,
            avatar_url: 'https://via.placeholder.com/150', // Avatar por defecto
            bio: 'Nuevo usuario en VRConnect' 
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Error creando perfil:', profileError);
        // Podríamos intentar borrar el user si falla el profile, pero por ahora lo dejamos así
      }

      set({ 
        user: authData.user, 
        profile: profileData,
        loading: false 
      });
      return { success: true, user: authData.user };
    } catch (error) {
      console.error('Error en registro:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Cerrar sesión
  logout: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, profile: null, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Obtener perfil de usuario
  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      set({ profile: data });
      return data;
    } catch (error) {
      console.error('Error recuperando perfil:', error);
      return null;
    }
  },

  // Restaurar sesión al iniciar app
  checkSession: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await get().fetchProfile(session.user.id);
        set({ user: session.user, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error restaurando sesión:', error);
      set({ loading: false });
    }
  }
}));

export default useAuthStore;
