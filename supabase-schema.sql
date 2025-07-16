-- Supabase database schema for multi-chapter quiz system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chapters table
CREATE TABLE chapters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table (now belongs to chapters)
CREATE TABLE questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of options
    correct_answer INTEGER NOT NULL, -- Index of correct option
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    total_score INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers JSONB NOT NULL, -- Store user answers
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapter leaderboards (materialized view for performance)
CREATE VIEW chapter_leaderboards AS
SELECT 
    chapter_id,
    user_id,
    username,
    SUM(score) as total_score,
    COUNT(*) as attempts_count,
    AVG(score::decimal / total_questions::decimal * 100) as average_percentage,
    MAX(completed_at) as last_attempt
FROM quiz_attempts qa
JOIN users u ON qa.user_id = u.id
GROUP BY chapter_id, user_id, username;

-- Global leaderboard view
CREATE VIEW global_leaderboard AS
SELECT 
    user_id,
    username,
    SUM(score) as total_score,
    COUNT(*) as total_attempts,
    COUNT(DISTINCT chapter_id) as chapters_completed,
    AVG(score::decimal / total_questions::decimal * 100) as overall_average
FROM quiz_attempts qa
JOIN users u ON qa.user_id = u.id
GROUP BY user_id, username;

-- Indexes for better performance
CREATE INDEX idx_questions_chapter_id ON questions(chapter_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_chapter_id ON quiz_attempts(chapter_id);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);

-- Insert default chapter (Chapter 1) with existing questions
INSERT INTO chapters (name, description, order_index) VALUES 
('Chapter 1: GPU Training Fundamentals', 'Basic concepts of GPU training, mixed precision, and parallelism strategies', 1);