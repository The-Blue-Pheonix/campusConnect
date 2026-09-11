import { createClient } from '@supabase/supabase-js';

// Get these from Supabase Settings > API
const supabaseUrl = 'https://nowsnqcjmvkoifvdcyra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vd3NucWNqbXZrb2lmdmRjeXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDkzNTEsImV4cCI6MjA4MzI4NTM1MX0._5lNLYknWrGSPCmpAesrIk5sbVNxSpqP6vspyrH9J58';

export const supabase = createClient(supabaseUrl, supabaseKey);