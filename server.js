const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const MemoryStorage = require('./storage');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = new MemoryStorage();

client.on('error', (err) => {
  console.error('Storage Client Error:', err);
});

client.connect();

const sampleQuestions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct: 2
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1
  },
  {
    id: 3,
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correct: 1
  },
  {
    id: 4,
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correct: 1
  },
  {
    id: 5,
    question: "What is the largest mammal in the world?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correct: 1
  }
];

app.post('/api/register', async (req, res) => {
  const { username } = req.body;
  
  if (!username || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  const userId = uuidv4();
  const userKey = `user:${userId}`;
  
  await client.hSet(userKey, {
    id: userId,
    username: username.trim(),
    totalScore: 0,
    quizzesCompleted: 0,
    createdAt: new Date().toISOString()
  });
  
  await client.sAdd('users', userId);
  
  res.json({ userId, username: username.trim() });
});

app.get('/api/questions', (req, res) => {
  const questionsWithoutAnswers = sampleQuestions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));
  
  res.json(questionsWithoutAnswers);
});

app.post('/api/submit', async (req, res) => {
  const { userId, answers } = req.body;
  
  if (!userId || !answers) {
    return res.status(400).json({ error: 'User ID and answers are required' });
  }
  
  const userKey = `user:${userId}`;
  const userExists = await client.exists(userKey);
  
  if (!userExists) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  let score = 0;
  const results = [];
  
  sampleQuestions.forEach(question => {
    const userAnswer = answers[question.id];
    const isCorrect = userAnswer === question.correct;
    if (isCorrect) score++;
    
    results.push({
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correct,
      isCorrect
    });
  });
  
  const quizId = uuidv4();
  const quizKey = `quiz:${quizId}`;
  
  await client.hSet(quizKey, {
    id: quizId,
    userId,
    score,
    totalQuestions: sampleQuestions.length,
    answers: JSON.stringify(answers),
    results: JSON.stringify(results),
    completedAt: new Date().toISOString()
  });
  
  const currentScore = await client.hGet(userKey, 'totalScore');
  const currentQuizzes = await client.hGet(userKey, 'quizzesCompleted');
  
  await client.hSet(userKey, {
    totalScore: parseInt(currentScore) + score,
    quizzesCompleted: parseInt(currentQuizzes) + 1
  });
  
  res.json({
    score,
    totalQuestions: sampleQuestions.length,
    percentage: Math.round((score / sampleQuestions.length) * 100),
    results
  });
});

app.get('/api/leaderboard', async (req, res) => {
  const userIds = await client.sMembers('users');
  const leaderboard = [];
  
  for (const userId of userIds) {
    const userKey = `user:${userId}`;
    const userData = await client.hGetAll(userKey);
    
    if (userData.username) {
      leaderboard.push({
        username: userData.username,
        totalScore: parseInt(userData.totalScore) || 0,
        quizzesCompleted: parseInt(userData.quizzesCompleted) || 0,
        averageScore: userData.quizzesCompleted > 0 
          ? Math.round((userData.totalScore / userData.quizzesCompleted) * 100) / 100
          : 0
      });
    }
  }
  
  leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  
  res.json(leaderboard);
});

app.get('/api/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const userKey = `user:${userId}`;
  
  const userData = await client.hGetAll(userKey);
  
  if (!userData.username) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: userData.id,
    username: userData.username,
    totalScore: parseInt(userData.totalScore) || 0,
    quizzesCompleted: parseInt(userData.quizzesCompleted) || 0
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Quiz system running at http://localhost:${port}`);
});

module.exports = app;