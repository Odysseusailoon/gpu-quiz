// Script to populate Chapter 1 with existing questions when using Supabase
require('dotenv').config();
const SupabaseStorage = require('./supabase');

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

async function populateChapter1() {
  const client = new SupabaseStorage();
  await client.connect();
  
  try {
    // Get chapters to find Chapter 1
    const chapters = await client.getChapters();
    const chapter1 = chapters.find(c => c.name.includes('Chapter 1'));
    
    if (!chapter1) {
      console.error('Chapter 1 not found');
      return;
    }
    
    // Convert questions to the format expected by addQuestionsToChapter
    const formattedQuestions = sampleQuestions.map(q => ({
      question_text: q.question,
      options: q.options,
      correct_answer: q.correct
    }));
    
    const result = await client.addQuestionsToChapter(chapter1.id, formattedQuestions);
    console.log(`Successfully added ${result.length} questions to Chapter 1`);
    
  } catch (error) {
    console.error('Error populating Chapter 1:', error);
  }
}

if (require.main === module) {
  populateChapter1();
}

module.exports = { populateChapter1 };