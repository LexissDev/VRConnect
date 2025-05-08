import supabase from '../config/supabase.js';

// Obtener todos los mundos
export const getAllWorlds = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('worlds')
      .select('*, creator:creator_id(username, avatar_url)');
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener un mundo por ID
export const getWorldById = async (req, res) => {
  try {
    const { id } = req.params;
    
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
    
    res.status(200).json({
      ...data,
      likes_count: count
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Crear un nuevo mundo
export const createWorld = async (req, res) => {
  try {
    const { name, description, image_url, world_id } = req.body;
    const creator_id = req.user.id;
    
    const { data, error } = await supabase
      .from('worlds')
      .insert([
        { name, description, creator_id, image_url, world_id }
      ])
      .select();
    
    if (error) throw error;
    
    res.status(201).json({ 
      message: 'Mundo creado exitosamente',
      world: data[0]
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Dar like a un mundo
export const likeWorld = async (req, res) => {
  try {
    const { world_id } = req.params;
    const user_id = req.user.id;
    
    // Verificar si ya dio like
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', user_id)
      .eq('world_id', world_id);
    
    if (checkError) throw checkError;
    
    if (existingLike.length > 0) {
      // Si ya dio like, lo quitamos
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user_id)
        .eq('world_id', world_id);
      
      if (deleteError) throw deleteError;
      
      res.status(200).json({ message: 'Like removido exitosamente' });
    } else {
      // Si no ha dado like, lo agregamos
      const { error: insertError } = await supabase
        .from('likes')
        .insert([
          { user_id, world_id }
        ]);
      
      if (insertError) throw insertError;
      
      res.status(201).json({ message: 'Like agregado exitosamente' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener mundos ordenados por likes
export const getWorldsByLikes = async (req, res) => {
  try {
    // Primero obtenemos el conteo de likes por mundo
    const { data: likesCount, error: likesError } = await supabase
      .from('likes')
      .select('world_id, count')
      .group('world_id');
    
    if (likesError) throw likesError;
    
    // Obtenemos todos los mundos
    const { data: worlds, error: worldsError } = await supabase
      .from('worlds')
      .select('*, creator:creator_id(username, avatar_url)');
    
    if (worldsError) throw worldsError;
    
    // Combinamos la información
    const worldsWithLikes = worlds.map(world => {
      const likeInfo = likesCount.find(l => l.world_id === world.id);
      return {
        ...world,
        likes_count: likeInfo ? parseInt(likeInfo.count) : 0
      };
    });
    
    // Ordenamos por número de likes
    worldsWithLikes.sort((a, b) => b.likes_count - a.likes_count);
    
    res.status(200).json(worldsWithLikes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};