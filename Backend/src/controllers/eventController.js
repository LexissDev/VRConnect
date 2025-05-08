import supabase from '../config/supabase.js';

// Obtener todos los eventos
export const getAllEvents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, creator:creator_id(username, avatar_url), world:world_id(name, image_url)')
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Crear un nuevo evento
export const createEvent = async (req, res) => {
  try {
    const { title, description, world_id, start_time, end_time } = req.body;
    const creator_id = req.user.id;
    
    const { data, error } = await supabase
      .from('events')
      .insert([
        { title, description, world_id, creator_id, start_time, end_time }
      ])
      .select();
    
    if (error) throw error;
    
    res.status(201).json({ 
      message: 'Evento creado exitosamente',
      event: data[0]
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener un evento por ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('events')
      .select('*, creator:creator_id(username, avatar_url), world:world_id(name, image_url)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un evento
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, world_id, start_time, end_time } = req.body;
    const creator_id = req.user.id;
    
    // Verificar que el usuario sea el creador del evento
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('creator_id')
      .eq('id', id)
      .single();
    
    if (eventError) throw eventError;
    
    if (eventData.creator_id !== creator_id) {
      return res.status(403).json({ error: 'No tienes permiso para editar este evento' });
    }
    
    const { data, error } = await supabase
      .from('events')
      .update({ title, description, world_id, start_time, end_time })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.status(200).json({ 
      message: 'Evento actualizado exitosamente',
      event: data[0]
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un evento
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const creator_id = req.user.id;
    
    // Verificar que el usuario sea el creador del evento
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('creator_id')
      .eq('id', id)
      .single();
    
    if (eventError) throw eventError;
    
    if (eventData.creator_id !== creator_id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este evento' });
    }
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};