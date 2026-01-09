import supabase from '../config/supabase.js';

export const registerUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) throw signUpError;

    // Insert profile row
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: authData.user.id, username }])
      .single();
    if (profileError) throw profileError;

    res.status(201).json({ user: authData.user, profile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const updates = req.body;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};