const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Using fallback storage.');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

class SupabaseStorage {
  constructor() {
    this.client = supabase;
    this.fallback = require('./storage');
    this.fallbackClient = new this.fallback();
  }

  async connect() {
    if (!this.client) {
      console.log('Using fallback memory storage');
      return this.fallbackClient.connect();
    }
    console.log('Connected to Supabase');
  }

  on(event, callback) {
    if (!this.client) {
      return this.fallbackClient.on(event, callback);
    }
  }

  async createOrGetUser(username) {
    if (!this.client) {
      // Check if user exists in fallback
      const userIds = await this.fallbackClient.sMembers('users');
      for (const userId of userIds) {
        const userData = await this.fallbackClient.hGetAll(`user:${userId}`);
        if (userData.username === username) {
          return { id: userId, username: userData.username };
        }
      }
      
      // Create new user if not found
      const userId = require('uuid').v4();
      await this.fallbackClient.hSet(`user:${userId}`, {
        id: userId,
        username,
        totalScore: 0,
        quizzesCompleted: 0,
        createdAt: new Date().toISOString()
      });
      await this.fallbackClient.sAdd('users', userId);
      return { id: userId, username };
    }

    // Check if user exists in Supabase
    const { data: existingUser } = await this.client
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const { data, error } = await this.client
      .from('users')
      .insert([{ username }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUser(userId) {
    if (!this.client) {
      const userData = await this.fallbackClient.hGetAll(`user:${userId}`);
      return userData.username ? userData : null;
    }

    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getChapters() {
    if (!this.client) {
      return [{
        id: 'chapter1',
        name: 'Chapter 1: GPU Training Fundamentals',
        description: 'Basic concepts of GPU training, mixed precision, and parallelism strategies',
        order_index: 1,
        is_active: true
      }];
    }

    const { data, error } = await this.client
      .from('chapters')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (error) throw error;
    return data || [];
  }

  async getQuestionsByChapter(chapterId) {
    if (!this.client) {
      const sampleQuestions = require('./server').sampleQuestions || [];
      return sampleQuestions.map(q => ({
        id: q.id,
        question_text: q.question,
        options: q.options,
        correct_answer: q.correct,
        chapter_id: chapterId
      }));
    }

    const { data, error } = await this.client
      .from('questions')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('order_index');

    if (error) throw error;
    return data || [];
  }

  async submitQuiz(userId, chapterId, score, totalQuestions, answers) {
    if (!this.client) {
      const quizId = require('uuid').v4();
      await this.fallbackClient.hSet(`quiz:${quizId}`, {
        id: quizId,
        userId,
        chapterId,
        score,
        totalQuestions,
        answers: JSON.stringify(answers),
        completedAt: new Date().toISOString()
      });

      const userKey = `user:${userId}`;
      const currentScore = await this.fallbackClient.hGet(userKey, 'totalScore') || 0;
      const currentQuizzes = await this.fallbackClient.hGet(userKey, 'quizzesCompleted') || 0;
      
      await this.fallbackClient.hSet(userKey, {
        totalScore: parseInt(currentScore) + score,
        quizzesCompleted: parseInt(currentQuizzes) + 1
      });

      return { id: quizId };
    }

    const { data, error } = await this.client
      .from('quiz_attempts')
      .insert([{
        user_id: userId,
        chapter_id: chapterId,
        score,
        total_questions: totalQuestions,
        answers
      }])
      .select()
      .single();

    if (error) throw error;

    // Update user stats
    const { data: userData } = await this.client
      .from('users')
      .select('total_score, quizzes_completed')
      .eq('id', userId)
      .single();

    await this.client
      .from('users')
      .update({
        total_score: (userData?.total_score || 0) + score,
        quizzes_completed: (userData?.quizzes_completed || 0) + 1
      })
      .eq('id', userId);

    return data;
  }

  async getChapterLeaderboard(chapterId, limit = 10) {
    if (!this.client) {
      return this.fallbackClient.sMembers('users').then(async userIds => {
        const leaderboard = [];
        for (const userId of userIds) {
          const userData = await this.fallbackClient.hGetAll(`user:${userId}`);
          if (userData.username) {
            leaderboard.push({
              username: userData.username,
              total_score: parseInt(userData.totalScore) || 0,
              attempts_count: parseInt(userData.quizzesCompleted) || 0,
              average_percentage: userData.quizzesCompleted > 0 
                ? Math.round((userData.totalScore / userData.quizzesCompleted) * 100) / 100
                : 0
            });
          }
        }
        return leaderboard.sort((a, b) => b.total_score - a.total_score).slice(0, limit);
      });
    }

    const { data, error } = await this.client
      .from('chapter_leaderboards')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('total_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getGlobalLeaderboard(limit = 10) {
    if (!this.client) {
      return this.getChapterLeaderboard('chapter1', limit);
    }

    const { data, error } = await this.client
      .from('global_leaderboard')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async createChapter(name, description) {
    if (!this.client) {
      throw new Error('Chapter creation requires Supabase database');
    }

    const { data: maxOrder } = await this.client
      .from('chapters')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const { data, error } = await this.client
      .from('chapters')
      .insert([{
        name,
        description,
        order_index: (maxOrder?.order_index || 0) + 1
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addQuestionsToChapter(chapterId, questions) {
    if (!this.client) {
      throw new Error('Question upload requires Supabase database');
    }

    const questionsWithChapter = questions.map((q, index) => ({
      chapter_id: chapterId,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      order_index: index + 1
    }));

    const { data, error } = await this.client
      .from('questions')
      .insert(questionsWithChapter)
      .select();

    if (error) throw error;
    return data;
  }
}

module.exports = SupabaseStorage;