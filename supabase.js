const SUPABASE_URL = "https://imvrjlwrmdecebzpnnqk.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_8tVfb8ZD4X99cWccVuMrqQ_8BJ2DtIf";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);