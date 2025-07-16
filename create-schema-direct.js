require('dotenv').config();
const fetch = require('node-fetch');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

async function executeSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'apikey': supabaseKey
    },
    body: JSON.stringify({ sql })
  });
  
  const result = await response.text();
  return { success: response.ok, result, status: response.status };
}

async function createSchema() {
  console.log('Creating database schema via direct SQL execution...');
  
  // First, let's try a simple approach by creating tables directly
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Create chapters table using a workaround - try to insert, which will fail if table doesn't exist
    // But first let's check if we can access the database
    console.log('Testing database connection...');
    const { data, error } = await supabase.from('chapters').select('*').limit(1);
    
    if (error && error.code === '42P01') {
      console.log('Tables do not exist. You need to run the SQL schema manually.');
      console.log('\nPlease follow these steps:');
      console.log('1. Go to https://supabase.com/dashboard/project/kqlmyjeajcvlqvzupqos');
      console.log('2. Click on "SQL Editor" in the left sidebar');
      console.log('3. Copy and paste the contents of supabase-schema.sql');
      console.log('4. Click "Run" to execute the schema');
      console.log('5. Then run: node populate-chapter1.js');
      return;
    }
    
    console.log('Database connection successful!');
    if (data) {
      console.log('Tables already exist');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createSchema();