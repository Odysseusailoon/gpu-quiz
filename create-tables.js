require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('Creating database tables...');
  
  try {
    // Create chapters table
    console.log('Creating chapters table...');
    const { error: chaptersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chapters (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          order_index INTEGER NOT NULL DEFAULT 1,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (chaptersError) {
      console.error('Error creating chapters table:', chaptersError);
    } else {
      console.log('✓ Chapters table created');
    }

    // Create users table
    console.log('Creating users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          total_score INTEGER DEFAULT 0,
          quizzes_completed INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('✓ Users table created');
    }

    // Create questions table
    console.log('Creating questions table...');
    const { error: questionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS questions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
          question_text TEXT NOT NULL,
          options JSONB NOT NULL,
          correct_answer INTEGER NOT NULL,
          order_index INTEGER DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (questionsError) {
      console.error('Error creating questions table:', questionsError);
    } else {
      console.log('✓ Questions table created');
    }

    // Create quiz_attempts table
    console.log('Creating quiz_attempts table...');
    const { error: attemptsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS quiz_attempts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
          score INTEGER NOT NULL,
          total_questions INTEGER NOT NULL,
          answers JSONB NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (attemptsError) {
      console.error('Error creating quiz_attempts table:', attemptsError);
    } else {
      console.log('✓ Quiz attempts table created');
    }

    // Insert default chapter
    console.log('Creating default chapter...');
    const { error: insertError } = await supabase
      .from('chapters')
      .insert([{
        name: 'Chapter 1: GPU Training Fundamentals',
        description: 'Basic concepts of GPU training, mixed precision, and parallelism strategies',
        order_index: 1
      }]);
    
    if (insertError) {
      console.error('Error creating default chapter:', insertError);
    } else {
      console.log('✓ Default chapter created');
    }

    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

createTables();