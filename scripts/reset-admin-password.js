const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const username = process.argv[2];
const newPassword = process.argv[3];

if (!username || !newPassword) {
  console.log('Usage: node reset-admin-password.js <username> <newPassword>');
  console.log('Example: node reset-admin-password.js admin mynewpassword123');
  process.exit(1);
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function resetPassword() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const passwordHash = await hashPassword(newPassword);

  const { data, error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('username', username.toLowerCase())
    .select('id, username, role');

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  if (data.length === 0) {
    console.error('User not found:', username);
    process.exit(1);
  }

  console.log('✓ Password updated for user:', data[0].username);
  console.log('✓ Role:', data[0].role);
}

resetPassword();
