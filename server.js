require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const SupabaseStorage = require('./supabase');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = new SupabaseStorage();

client.on('error', (err) => {
  console.error('Storage Client Error:', err);
});

client.connect();

const sampleQuestions = [
  {
    id: 1,
    question: "What is the primary benefit of using mixed precision (BF16/FP16) training compared to full precision (FP32)?",
    options: ["It reduces the total memory required for training", "It allows faster computation through optimized lower precision operations and reduces activation memory", "It eliminates the need for gradient accumulation", "It removes the requirement for optimizer states"],
    correct: 1
  },
  {
    id: 2,
    question: "In the context of distributed training, what does Tensor Parallelism (TP) shard across?",
    options: ["The batch dimension", "The sequence dimension", "The hidden dimension", "The model layers"],
    correct: 2
  },
  {
    id: 3,
    question: "Which ZeRO strategy shards optimizer states, gradients, AND parameters among data parallel replicas?",
    options: ["ZeRO-1", "ZeRO-2", "ZeRO-3", "ZeRO-4"],
    correct: 2
  },
  {
    id: 4,
    question: "What is a major limitation of Tensor Parallelism that affects its performance?",
    options: ["It cannot work with attention mechanisms", "The all-reduce communication cannot be fully hidden behind computation and adds to the critical path", "It requires double the memory of other parallelism methods", "It only works with models smaller than 1B parameters"],
    correct: 1
  },
  {
    id: 5,
    question: "When storing model parameters in mixed precision training, why might optimizer states still use FP32?",
    options: ["To save memory", "Because GPUs cannot process other formats", "Because BF16 is lossy for smaller values and stability is prioritized", "To speed up backward propagation"],
    correct: 2
  },
  {
    id: 6,
    question: "What memory requirement does storing FP32 parameters have compared to the number of parameters (N)?",
    options: ["2 * N bytes", "4 * N bytes", "8 * N bytes", "16 * N bytes"],
    correct: 1
  },
  {
    id: 7,
    question: "Which parallelism strategy operates along the model layers dimension?",
    options: ["Data Parallelism (DP)", "Tensor Parallelism (TP)", "Pipeline Parallelism (PP)", "Sequence Parallelism (SP)"],
    correct: 2
  },
  {
    id: 8,
    question: "What is a key characteristic of operations like LayerNorm in the context of Tensor Parallelism?",
    options: ["They can be fully parallelized across GPUs", "They require gathering full activations, limiting memory benefits", "They eliminate the need for communication between GPUs", "They double the computation speed"],
    correct: 1
  },
  {
    id: 9,
    question: "In distributed training, what does the \"critical path\" refer to?",
    options: ["The most memory-intensive operation", "The sequence of operations that determine the minimum time required to complete a pass", "The communication bandwidth between GPUs", "The path data takes through the network"],
    correct: 1
  },
  {
    id: 10,
    question: "According to the content, what technique do Megatron-LM and Nanotron implement to improve efficiency?",
    options: ["Complete elimination of all-gather operations", "Doubling the batch size automatically", "Partial overlapping of all-gather with FC1 computation", "Automatic conversion of all operations to FP8"],
    correct: 2
  },
  {
    id: 11,
    question: "What does Data Parallelism (DP) shard across?",
    options: ["The hidden dimension", "The batch dimension", "The sequence length", "The model depth"],
    correct: 1
  },
  {
    id: 12,
    question: "Which ZeRO level only shards optimizer states among DP replicas?",
    options: ["ZeRO-1", "ZeRO-2", "ZeRO-3", "ZeRO-0"],
    correct: 0
  },
  {
    id: 13,
    question: "What is Sequence Parallelism (SP) designed to shard?",
    options: ["The batch samples", "The model weights", "The sequence dimension", "The optimizer states"],
    correct: 2
  },
  {
    id: 14,
    question: "In mixed precision training, what happens to the total memory usage compared to full precision?",
    options: ["It decreases significantly", "It stays roughly the same, just distributed differently", "It doubles", "It reduces by exactly 50%"],
    correct: 1
  },
  {
    id: 15,
    question: "What is the memory requirement for storing BF16/FP16 parameters compared to the number of parameters (N)?",
    options: ["1 * N bytes", "2 * N bytes", "4 * N bytes", "8 * N bytes"],
    correct: 1
  },
  {
    id: 16,
    question: "Which communication pattern is most critical in Tensor Parallelism?",
    options: ["All-gather", "Broadcast", "All-reduce", "Point-to-point"],
    correct: 2
  },
  {
    id: 17,
    question: "What does ZeRO-2 shard among data parallel replicas?",
    options: ["Only optimizer states", "Optimizer states and gradients", "Only gradients", "Parameters and gradients"],
    correct: 1
  },
  {
    id: 18,
    question: "Why is FP8 training mentioned as potentially advantageous over BF16?",
    options: ["It's more stable", "It would further decrease memory usage", "It's faster to compute", "It's more accurate"],
    correct: 1
  },
  {
    id: 19,
    question: "What is Context Parallelism (CP) closely related to?",
    options: ["Data Parallelism", "Tensor Parallelism", "Sequence Parallelism", "Expert Parallelism"],
    correct: 2
  },
  {
    id: 20,
    question: "In Pipeline Parallelism, what is the main challenge that needs to be addressed?",
    options: ["Memory overflow", "Pipeline bubbles (idle time)", "Gradient explosion", "Communication bandwidth"],
    correct: 1
  },
  {
    id: 21,
    question: "What type of operations in neural networks benefit most from lower precision computation?",
    options: ["Activation functions", "Matrix multiplications", "Normalization layers", "Dropout layers"],
    correct: 1
  },
  {
    id: 22,
    question: "How many distinct parallelism strategies were mentioned for scaling model training?",
    options: ["3", "4", "5", "6"],
    correct: 2
  },
  {
    id: 23,
    question: "What is the primary memory component that mixed precision training helps reduce during the forward pass?",
    options: ["Parameter memory", "Optimizer state memory", "Activation memory", "Gradient memory"],
    correct: 2
  },
  {
    id: 24,
    question: "In distributed training, what determines whether communication can be \"hidden\" behind computation?",
    options: ["The size of the model", "Whether the communication time is less than computation time", "The type of optimizer used", "The batch size"],
    correct: 1
  },
  {
    id: 25,
    question: "What infrastructure factor is mentioned as heavily influencing Tensor Parallelism performance?",
    options: ["CPU speed", "Storage bandwidth", "Network infrastructure", "RAM capacity"],
    correct: 2
  },
  {
    id: 26,
    question: "Expert Parallelism (EP) is mentioned as a strategy. What is it likely to parallelize?",
    options: ["Different expert networks in mixture-of-experts models", "Different optimization algorithms", "Different loss functions", "Different data augmentation strategies"],
    correct: 0
  },
  {
    id: 27,
    question: "Why might gradients be accumulated in FP32 even when using BF16 for computations?",
    options: ["To reduce memory usage", "To maintain numerical stability", "To speed up communication", "To enable larger batch sizes"],
    correct: 1
  },
  {
    id: 28,
    question: "What is the relationship between the number of GPUs and communication overhead in Tensor Parallelism?",
    options: ["Communication overhead decreases with more GPUs", "Communication overhead increases with more GPUs", "They are unrelated", "Communication overhead stays constant"],
    correct: 1
  },
  {
    id: 29,
    question: "Which parallelism method is most suitable when you want to train a model that doesn't fit on a single GPU?",
    options: ["Only Data Parallelism", "A combination of multiple parallelism strategies", "Only Sequence Parallelism", "Only Expert Parallelism"],
    correct: 1
  },
  {
    id: 30,
    question: "What is the main trade-off when choosing between different parallelism strategies?",
    options: ["Model accuracy vs training speed", "Communication overhead vs memory efficiency", "Development time vs deployment cost", "Data quality vs model size"],
    correct: 1
  }
];

const advancedParallelismQuestions = [
  {
    id: 31,
    question: "When overlapping gradient synchronization with the backward pass, what determines the optimal time to start the all-reduce operation?",
    options: ["When all gradients are computed", "When the first layer's gradients are ready", "When enough gradients are accumulated to saturate network bandwidth", "At fixed time intervals"],
    correct: 2,
    explanation: "Starting all-reduce when enough gradients are ready to saturate network bandwidth maximizes overlap efficiency. Starting too early with few gradients underutilizes bandwidth, while waiting too long reduces overlap opportunity."
  },
  {
    id: 32,
    question: "In gradient bucketing, what is the primary trade-off when choosing bucket size?",
    options: ["Memory usage vs computation speed", "Communication latency vs bandwidth utilization", "Model accuracy vs training speed", "Forward pass time vs backward pass time"],
    correct: 1,
    explanation: "Smaller buckets reduce latency (can start sending earlier) but may underutilize bandwidth. Larger buckets better saturate bandwidth but increase waiting time before communication can start."
  },
  {
    id: 33,
    question: "How does gradient accumulation interact with the overlapping of gradient synchronization in data parallelism?",
    options: ["It prevents any overlap from occurring", "It allows synchronization to happen less frequently, reducing communication overhead", "It doubles the required bandwidth", "It requires synchronization after every micro-batch"],
    correct: 1,
    explanation: "Gradient accumulation means synchronization only happens after multiple micro-batches, reducing communication frequency and allowing better amortization of communication costs."
  },
  {
    id: 34,
    question: "When using gradient accumulation with data parallelism, what is the relationship between global batch size, micro-batch size, and gradient accumulation steps?",
    options: ["Global batch size = micro-batch size × gradient accumulation steps", "Global batch size = micro-batch size × gradient accumulation steps × number of GPUs", "Global batch size = micro-batch size × number of GPUs", "Global batch size = gradient accumulation steps × number of GPUs"],
    correct: 1,
    explanation: "Each GPU processes micro-batches, accumulates gradients over multiple steps, and this happens across all GPUs in parallel, so all three factors multiply together."
  },
  {
    id: 35,
    question: "In ZeRO-1, if you have 8 GPUs and optimizer states that normally take 48GB, how much optimizer memory does each GPU use?",
    options: ["48GB", "24GB", "12GB", "6GB"],
    correct: 3,
    explanation: "ZeRO-1 partitions optimizer states across all data parallel ranks. With 8 GPUs, each stores 1/8th of the optimizer states: 48GB ÷ 8 = 6GB."
  },
  {
    id: 36,
    question: "What additional communication is required in ZeRO-2 compared to ZeRO-1 during the backward pass?",
    options: ["All-gather of parameters", "Reduce-scatter of gradients", "All-reduce of gradients", "Broadcast of optimizer states"],
    correct: 1,
    explanation: "ZeRO-2 adds gradient partitioning, requiring reduce-scatter to sum gradients while distributing different portions to different GPUs, unlike standard DP which uses all-reduce."
  },
  {
    id: 37,
    question: "In ZeRO-3, when must parameters be gathered from other GPUs?",
    options: ["Only during the forward pass", "Only during the backward pass", "Both during forward and backward passes", "Only during optimizer step"],
    correct: 2,
    explanation: "ZeRO-3 partitions parameters, so each layer's parameters must be all-gathered before computing forward pass and again before computing gradients in backward pass."
  },
  {
    id: 38,
    question: "What is the key difference between ZeRO-3 and traditional model parallelism?",
    options: ["ZeRO-3 requires more memory", "ZeRO-3 maintains full model replicas while partitioning for memory efficiency", "ZeRO-3 cannot scale beyond 8 GPUs", "ZeRO-3 doesn't support gradient accumulation"],
    correct: 1,
    explanation: "ZeRO-3 logically maintains data parallelism (each GPU processes different data) while physically partitioning model components for memory efficiency, unlike model parallelism which assigns different model parts to different GPUs."
  },
  {
    id: 39,
    question: "In tensor parallelism for a transformer's attention mechanism, how is the QKV projection typically split?",
    options: ["Each GPU computes Q, K, or V entirely", "The hidden dimension is split across GPUs", "The sequence length is split across GPUs", "The batch dimension is split across GPUs"],
    correct: 1,
    explanation: "Tensor parallelism splits matrices along the hidden dimension, so each GPU computes a portion of Q, K, and V projections for all positions."
  },
  {
    id: 40,
    question: "What is the primary benefit of sequence parallelism when combined with tensor parallelism?",
    options: ["It eliminates all communication", "It reduces activation memory by partitioning along sequence length", "It increases model accuracy", "It speeds up the optimizer step"],
    correct: 1,
    explanation: "Sequence parallelism partitions activations along the sequence dimension between tensor-parallel ranks, reducing per-GPU activation memory requirements."
  },
  {
    id: 41,
    question: "In tensor parallelism, why must the MLP's two linear layers be partitioned differently (column-wise vs row-wise)?",
    options: ["To balance memory usage", "To maintain mathematical equivalence and avoid additional communication", "To improve numerical stability", "To support different activation functions"],
    correct: 1,
    explanation: "Column-wise partition of first layer and row-wise of second layer allows the intermediate results to remain distributed without requiring all-gather between them, maintaining correctness with minimal communication."
  },
  {
    id: 42,
    question: "In Ring Attention, what is the key insight that enables splitting attention computation across the sequence dimension?",
    options: ["Attention scores can be computed independently", "Causal masking prevents dependencies", "Blockwise computation with proper normalization maintains correctness", "Queries and keys are independent"],
    correct: 2,
    explanation: "Ring Attention works by computing attention in blocks and using the log-sum-exp trick to correctly normalize attention scores across blocks computed on different devices."
  },
  {
    id: 43,
    question: "What problem does Zig-Zag Ring Attention solve compared to standard Ring Attention?",
    options: ["Memory usage imbalance", "Computational load imbalance due to causal masking", "Communication overhead", "Gradient explosion"],
    correct: 1,
    explanation: "In causal attention with standard ring ordering, early GPUs process mostly masked positions (light computation) while later GPUs process full attention (heavy computation). Zig-Zag reorders to balance this."
  },
  {
    id: 44,
    question: "How does context parallelism differ from sequence parallelism in terms of implementation?",
    options: ["Context parallelism requires modifications to attention computation", "They are the same thing", "Context parallelism only works with causal models", "Sequence parallelism requires ring communication"],
    correct: 0,
    explanation: "Context parallelism requires specialized algorithms (like Ring Attention) to correctly compute attention across split sequences, while sequence parallelism simply partitions activations between existing tensor-parallel ranks."
  },
  {
    id: 45,
    question: "In GPipe-style pipeline parallelism, what is the main source of inefficiency?",
    options: ["Communication bandwidth", "Pipeline bubbles at the beginning and end of mini-batches", "Memory usage", "Gradient computation"],
    correct: 1,
    explanation: "Pipeline bubbles occur when GPUs wait for inputs from previous stages (startup) or when early stages finish and wait for backward pass (wind-down), creating idle time."
  },
  {
    id: 46,
    question: "How does the 1F1B (one forward, one backward) schedule improve upon GPipe?",
    options: ["It eliminates all pipeline bubbles", "It reduces memory usage by processing gradients immediately", "It increases communication speed", "It allows larger models"],
    correct: 1,
    explanation: "1F1B interleaves forward and backward passes, allowing gradients to be computed and potentially released earlier, reducing peak activation memory compared to all-forward-then-all-backward."
  },
  {
    id: 47,
    question: "What is the key innovation in Zero Bubble pipeline parallelism?",
    options: ["Eliminating communication between stages", "Overlapping computation with carefully scheduled warm-up and cool-down phases", "Using half precision for all computations", "Removing the need for gradient synchronization"],
    correct: 1,
    explanation: "Zero Bubble uses sophisticated scheduling with multiple backward pass types (B, B', W) to keep all GPUs busy throughout training, effectively eliminating idle time."
  },
  {
    id: 48,
    question: "In pipeline parallelism with interleaved stages, what is the primary benefit?",
    options: ["Reduced communication per GPU", "Better load balancing and reduced bubble ratio", "Simplified implementation", "Lower memory usage"],
    correct: 1,
    explanation: "Interleaving assigns multiple non-consecutive layers to each GPU, creating more pipeline stages with the same number of GPUs, reducing the relative impact of bubbles."
  },
  {
    id: 49,
    question: "In expert parallelism for Mixture of Experts (MoE) models, what determines which GPU processes which tokens?",
    options: ["Round-robin assignment", "The routing/gating network's output", "Static hash of token ID", "Random assignment"],
    correct: 1,
    explanation: "The routing network dynamically assigns tokens to experts based on the input, requiring all-to-all communication to send tokens to their assigned expert GPUs."
  },
  {
    id: 50,
    question: "What is the main challenge in achieving good performance with expert parallelism?",
    options: ["Memory bandwidth limitations", "Load balancing across experts", "Gradient computation complexity", "Parameter initialization"],
    correct: 1,
    explanation: "If the router sends too many tokens to some experts and few to others, some GPUs become overloaded while others idle, creating inefficiency. Load balancing losses help but don't fully solve this."
  },
  {
    id: 51,
    question: "In 5D parallelism, which two dimensions must be carefully coordinated to avoid conflicts?",
    options: ["Data and tensor parallelism", "Tensor and sequence parallelism", "Pipeline and expert parallelism", "Data and pipeline parallelism"],
    correct: 1,
    explanation: "Tensor and sequence parallelism both operate on the same tensor dimensions within a layer, requiring careful coordination to ensure they partition different aspects without conflict."
  },
  {
    id: 52,
    question: "When combining pipeline parallelism with tensor parallelism, what is the typical communication pattern?",
    options: ["Communication only within pipeline stages", "Communication only between pipeline stages", "High-bandwidth communication within TP groups at each PP stage", "All-to-all communication across all GPUs"],
    correct: 2,
    explanation: "Each pipeline stage typically forms a tensor parallel group requiring high-bandwidth all-reduce/all-gather, while pipeline communication between stages is point-to-point and less demanding."
  },
  {
    id: 53,
    question: "What is the memory saving formula when combining ZeRO-3 with tensor parallelism degree T and pipeline parallelism degree P?",
    options: ["Memory per GPU = Total memory ÷ T", "Memory per GPU = Total memory ÷ P", "Memory per GPU = Total memory ÷ (T × P)", "Memory per GPU = Total memory ÷ (T × P × DP_degree)"],
    correct: 3,
    explanation: "ZeRO-3 shards across data parallel dimension, while model is already divided by tensor and pipeline parallelism, so total reduction is the product of all three."
  },
  {
    id: 54,
    question: "In a cluster with limited inter-node bandwidth, which parallelism dimension should typically be within nodes?",
    options: ["Data parallelism", "Tensor parallelism", "Pipeline parallelism", "Expert parallelism"],
    correct: 1,
    explanation: "Tensor parallelism requires frequent all-reduce communication with tight synchronization, making it sensitive to latency and bandwidth, so it should use the fastest intra-node connections."
  },
  {
    id: 55,
    question: "When using gradient accumulation with pipeline parallelism, how does it affect the bubble overhead?",
    options: ["Reduces bubble overhead by amortizing it over more micro-batches", "Increases bubble overhead proportionally", "Has no effect on bubbles", "Eliminates bubbles entirely"],
    correct: 0,
    explanation: "With more micro-batches per gradient step, the fixed bubble time at batch boundaries becomes a smaller fraction of total compute time, improving efficiency."
  },
  {
    id: 56,
    question: "What is the optimal order for reducing gradients when combining ZeRO-2 with tensor parallelism?",
    options: ["Reduce within TP groups first, then reduce-scatter across DP groups", "Reduce-scatter across DP groups first, then within TP groups", "Only reduce within TP groups", "Simultaneous reduction in both dimensions"],
    correct: 0,
    explanation: "Reducing within TP groups first produces the complete gradient for each TP group, which can then be efficiently reduce-scattered across DP dimension for ZeRO-2 partitioning."
  },
  {
    id: 57,
    question: "In context parallelism with Ring Attention, what determines the optimal block size for attention computation?",
    options: ["Model dimension only", "Sequence length only", "Balance between computation granularity and communication frequency", "Number of attention heads"],
    correct: 2,
    explanation: "Smaller blocks mean more frequent communication but better load balancing, while larger blocks reduce communication but may cause imbalance and memory issues. The optimum balances these factors."
  },
  {
    id: 58,
    question: "When combining expert parallelism with data parallelism, how are gradients synchronized?",
    options: ["Only within expert parallel groups", "Only within data parallel groups", "First within EP groups for each expert, then across DP groups", "All-to-all across all dimensions simultaneously"],
    correct: 2,
    explanation: "Each expert's gradients must first be reduced within its EP group (across GPUs handling the same expert), then synchronized across DP groups like normal data parallelism."
  },
  {
    id: 59,
    question: "What is the relationship between pipeline depth and the optimal number of micro-batches in 1F1B schedule?",
    options: ["Micro-batches should equal pipeline depth", "Micro-batches should be at least 4× pipeline depth", "Micro-batches should be at most half pipeline depth", "They are independent"],
    correct: 1,
    explanation: "Having micro-batches ≥ 4× pipeline depth ensures the pipeline stays full during steady state, minimizing bubble overhead in the 1F1B schedule."
  },
  {
    id: 60,
    question: "In 5D parallelism, what is the most complex aspect of the implementation?",
    options: ["Memory allocation", "Coordinating communication patterns and collective operations across all dimensions", "Computing gradients", "Loading data"],
    correct: 1,
    explanation: "Each parallelism dimension has its own communication requirements and patterns. Coordinating these to avoid deadlocks, ensure correctness, and maintain efficiency while managing different process groups is the primary implementation challenge."
  }
];

// Export for external use
module.exports.sampleQuestions = sampleQuestions;
module.exports.advancedParallelismQuestions = advancedParallelismQuestions;

app.post('/api/register', async (req, res) => {
  const { username } = req.body;
  
  if (!username || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  try {
    const user = await client.createOrGetUser(username.trim());
    res.json({ userId: user.id, username: user.username });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/api/chapters', async (req, res) => {
  try {
    const chapters = await client.getChapters();
    res.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

app.get('/api/questions/:chapterId', async (req, res) => {
  const { chapterId } = req.params;
  
  try {
    const questions = await client.getQuestionsByChapter(chapterId);
    const questionsWithoutAnswers = questions.map(q => ({
      id: q.id,
      question: q.question_text,
      options: q.options
    }));
    
    res.json(questionsWithoutAnswers);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.post('/api/submit', async (req, res) => {
  const { userId, chapterId, answers } = req.body;
  
  if (!userId || !chapterId || !answers) {
    return res.status(400).json({ error: 'User ID, chapter ID, and answers are required' });
  }
  
  try {
    const user = await client.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const questions = await client.getQuestionsByChapter(chapterId);
    
    let score = 0;
    const results = [];
    
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correct_answer;
      if (isCorrect) score++;
      
      results.push({
        questionId: question.id,
        question: question.question_text,
        userAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation || null
      });
    });
    
    await client.submitQuiz(userId, chapterId, score, questions.length, answers);
    
    res.json({
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      results
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

app.get('/api/leaderboard/chapter/:chapterId', async (req, res) => {
  const { chapterId } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  
  try {
    const leaderboard = await client.getChapterLeaderboard(chapterId, limit);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching chapter leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch chapter leaderboard' });
  }
});

app.get('/api/leaderboard/global', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  try {
    const leaderboard = await client.getGlobalLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch global leaderboard' });
  }
});

// Legacy endpoint for backward compatibility
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await client.getGlobalLeaderboard(10);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.get('/api/user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await client.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      totalScore: user.total_score || 0,
      quizzesCompleted: user.quizzes_completed || 0
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Admin endpoints for creating chapters and uploading quizzes
const upload = multer({ 
  storage: multer.memoryStorage()
});

app.post('/api/admin/chapter', async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Chapter name is required' });
  }
  
  try {
    const chapter = await client.createChapter(name, description);
    res.json(chapter);
  } catch (error) {
    console.error('Error creating chapter:', error);
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

app.post('/api/admin/chapter/:chapterId/questions', upload.single('questionsFile'), async (req, res) => {
  const { chapterId } = req.params;
  let { questions } = req.body;
  
  try {
    // If file is uploaded, parse it
    if (req.file) {
      const fileContent = req.file.buffer.toString('utf8');
      questions = JSON.parse(fileContent);
    } else if (typeof questions === 'string') {
      questions = JSON.parse(questions);
    }
    
    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: 'Questions must be an array' });
    }
    
    const addedQuestions = await client.addQuestionsToChapter(chapterId, questions);
    res.json({ message: `Added ${addedQuestions.length} questions to chapter`, questions: addedQuestions });
  } catch (error) {
    console.error('Error adding questions:', error);
    res.status(500).json({ error: 'Failed to add questions to chapter' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Quiz system running at http://localhost:${port}`);
});

module.exports = app;