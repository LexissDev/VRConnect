import { create } from 'zustand';
import supabase from 'services/supabase';

const useProfileStore = create((set) => ({
  profile: null,
  loading: false,
  error: null,

  // Obtener perfil de usuario
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();

      console.log("session data : ", session);
      if (!session?.session) {
        throw new Error('No hay sesión activa');
      }
      const userId = session.session.user.id;
     
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      console.log("data : ", data);
      if (error) throw error;

      set({ profile: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Actualizar perfil de usuario
  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('No hay sesión activa');
      }

      const userId = session.session.user.id;
      const { username, bio, country, languages, avatar_url } = profileData;

      const { data, error } = await supabase
        .from('profiles')
        .update({ username, bio, country, languages, avatar_url })
        .eq('id', userId)
        .select();

      if (error) throw error;

      set({ profile: data[0], loading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Subir avatar
  uploadAvatar: async (uri) => {
    set({ loading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('No hay sesión activa');
      }

      const userId = session.session.user.id;

      // Convertir URI a Blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generar nombre de archivo único
      const fileExt = uri.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Actualizar perfil con nueva URL
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
        .select();

      if (error) throw error;

      set({ profile: data[0], loading: false });
      return { success: true, avatar_url: publicUrl };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },
}));

export default useProfileStore;
