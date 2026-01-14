import supabase from '../config/supabase.js';

// Crear confesión
export const createConfession = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { content, is_anonymous, category, community } = req.body;

    const { data, error } = await supabase
      .from('confessions')
      .insert([{ user_id, content, is_anonymous, category, community }])
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todas las confesiones visibles
export const getConfessions = async (req, res) => {
  try {
    const { category, community } = req.query;
    
    let query = supabase
      .from('confessions')
      .select('*')
      .eq('is_hidden', false);
    
    // Aplicar filtros si están presentes
    if (category) query = query.eq('category', category);
    if (community) query = query.eq('community', community);
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Reaccionar a una confesión
export const reactToConfession = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { confession_id, reaction_type } = req.body;

    // Insertar o actualizar reacción
    const { data, error } = await supabase
      .from('confession_reactions')
      .upsert([{ confession_id, user_id, reaction_type }], { onConflict: ['confession_id', 'user_id'] });

    if (error) throw error;

    // Recontar todas las reacciones por tipo
    const reactionCounts = {};
    
    // Obtener todos los tipos de reacciones disponibles
    const reactionTypes = ['like', 'love', 'haha', 'wow', 'sad', 'angry', 'dislike'];
    
    // Contar cada tipo de reacción
    for (const type of reactionTypes) {
      const { count } = await supabase
        .from('confession_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('confession_id', confession_id)
        .eq('reaction_type', type);
      
      reactionCounts[type] = count;
    }
    
    // Actualizar los contadores en la confesión
    await supabase
      .from('confessions')
      .update({ 
        likes_count: reactionCounts.like || 0,
        dislikes_count: reactionCounts.dislike || 0,
        reaction_data: reactionCounts  // Guardar todos los contadores en un campo JSON
      })
      .eq('id', confession_id);

    res.json({ success: true, reactionCounts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Comentar confesión
export const commentOnConfession = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { confession_id, content, is_anonymous } = req.body;

    const { data, error } = await supabase
      .from('confession_comments')
      .insert([{ confession_id, user_id, content, is_anonymous }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener comentarios de una confesión
export const getComments = async (req, res) => {
  try {
    const { confessionId } = req.params;

    const { data, error } = await supabase
      .from('confession_comments')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq('confession_id', confessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(400).json({ error: error.message });
  }
};

// Reportar confesión
export const reportConfession = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { confession_id, reason } = req.body;

    const { data, error } = await supabase
      .from('confession_reports')
      .insert([{ confession_id, user_id, reason }])
      .single();

    if (error) throw error;

    // Incrementar contador de reportes
    const { count } = await supabase
      .from('confession_reports')
      .select('*', { count: 'exact', head: true })
      .eq('confession_id', confession_id);

    await supabase
      .from('confessions')
      .update({ reports_count: count })
      .eq('id', confession_id);

    res.status(201).json({ reported: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
