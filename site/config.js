// Supabase project for How to Be Cool. Both values are public by design: the publishable key only allows
// what the database rules in supabase/schema.sql allow (everyone reads non-private things; only the owner writes).
// Never put the secret / service_role key here.
window.HTBC_CONFIG = {
  SUPABASE_URL: "https://dtdyytsihugonklhjody.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_cxaL0feQdIXyjaHToLZUeQ_AuhGDU07",
  // Optional. Left empty so your email isn't published; sign-ups are off, so any signed-in account is you.
  OWNER_EMAIL: "",
};
