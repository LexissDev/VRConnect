import supabase from '../config/supabase.js';

// Registrar un nuevo usuario
export const registerUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Registrar usuario con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    
    // Crear perfil en la tabla users
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          id: authData.user.id,
          email,
          username,
          avatar_url: null,
          bio: '',
          country: '',
          languages: []
        }
      ]);
    
    if (error) throw error;
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      user: authData.user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Iniciar sesión
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    res.status(200).json({ 
      message: 'Inicio de sesión exitoso',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener perfil de usuario
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar perfil de usuario
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, bio, country, languages, avatar_url } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .update({ username, bio, country, languages, avatar_url })
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    
    res.status(200).json({ 
      message: 'Perfil actualizado exitosamente',
      user: data[0]
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
