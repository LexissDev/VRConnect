import supabase from '../config/supabase.js';

// Obtener todas las confesiones
export const getAllConfessions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('confessions')
      .select('*, user:user_id(username, avatar_url)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Crear una nueva confesión
export const createConfession = async (req, res) => {
  try {
    const { content, is_anonymous } = req.body;
    const user_id = is_anonymous ? null : req.user.id;
    
    const { data, error } = await supabase
      .from('confessions')
      .insert([
        { content, user_id, is_anonymous }
      ])
      .select();
    
    if (error) throw error;
    
    res.status(201).json({ 
      message: 'Confesión creada exitosamente',
      confession: data[0]
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener una confesión por ID
export const getConfessionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('confessions')
      .select('*, user:user_id(username, avatar_url)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};