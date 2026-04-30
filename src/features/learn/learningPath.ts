import type { LearnItem } from '../../types/domain';

// Learning Path Configuration
export const LEARNING_PATH_CONFIG = {
  maxLevel: 50,
  videosPerLevel: 20,
  quizzesPerLevel: 400,
  articlesPerLevel: 200,
  totalVideos: 1000,
  totalQuizzes: 20000,
  totalArticles: 10000
};

// Content templates for generation
const VIDEO_TEMPLATES = [
  {
    title: "Understanding {topic} and Its Carbon Impact",
    summary: "Learn how {topic} affects our planet's carbon footprint and what you can do about it.",
    minutes: 5,
    points: 25,
    category: "Environmental Education",
    sourceName: "EcoArcade Academy",
    difficulty: 'easy' as const
  },
  {
    title: "Sustainable {topic}: Best Practices",
    summary: "Discover sustainable approaches to {topic} that reduce environmental impact.",
    minutes: 7,
    points: 35,
    category: "Sustainable Living",
    sourceName: "Green Living Network",
    difficulty: 'medium' as const
  },
  {
    title: "The Science Behind {topic} Emissions",
    summary: "Deep dive into the scientific principles of {topic} and carbon emissions.",
    minutes: 10,
    points: 50,
    category: "Climate Science",
    sourceName: "Climate Research Institute",
    difficulty: 'hard' as const
  }
];

const QUIZ_TEMPLATES = [
  {
    question: "What is the primary carbon impact of {topic}?",
    options: ["High emissions", "Low emissions", "No emissions", "Variable emissions"],
    correctIndex: 0,
    explanation: "{topic} typically produces significant carbon emissions due to {reason}.",
    points: 10,
    difficulty: 'easy' as const
  },
  {
    question: "Which sustainable practice reduces {topic} emissions by {percentage}%?",
    options: ["Practice A", "Practice B", "Practice C", "Practice D"],
    correctIndex: 1,
    explanation: "Practice B is most effective for reducing {topic} emissions.",
    points: 15,
    difficulty: 'medium' as const
  }
];

const ARTICLE_TEMPLATES = [
  {
    title: "{topic}: A Comprehensive Guide",
    summary: "Everything you need to know about {topic} and its environmental implications.",
    minutes: 8,
    points: 40,
    category: "Educational Content",
    author: "EcoArcade Experts",
    difficulty: 'medium' as const,
    sections: [
      {
        heading: "Introduction to {topic}",
        paragraphs: ["{topic} plays a crucial role in our daily lives and environmental impact."],
        bullets: ["Key fact 1", "Key fact 2", "Key fact 3"]
      },
      {
        heading: "Environmental Impact",
        paragraphs: ["The carbon footprint of {topic} is significant and growing."],
        bullets: ["Impact metric 1", "Impact metric 2"]
      }
    ]
  }
];

// Topic pools for content generation
const TOPICS = [
  "Digital Streaming", "Cloud Computing", "Data Centers", "Cryptocurrency Mining",
  "Electric Vehicles", "Renewable Energy", "Sustainable Agriculture", "Ocean Conservation",
  "Forest Preservation", "Waste Management", "Water Conservation", "Urban Planning",
  "Green Transportation", "Carbon Offsetting", "Sustainable Fashion", "Eco-Friendly Housing",
  "Biodiversity", "Climate Adaptation", "Green Technology", "Environmental Policy"
];

const REASONS = [
  "energy-intensive processes", "fossil fuel dependency", "inefficient infrastructure",
  "lack of optimization", "high resource consumption", "poor waste management"
];

const PERCENTAGES = ["20-30", "30-50", "50-70", "70-90"];

function getTopicsForLevel(level: number): string[] {
  const startIndex = (level - 1) * 2;
  return TOPICS.slice(startIndex, startIndex + 4) || TOPICS.slice(0, 4);
}

function generateId(kind: string, level: number, index: number): string {
  return `${kind}-level${level}-${index}`;
}

function fillTemplate(template: string, replacements: Record<string, string>): string {
  return template.replace(/{(\w+)}/g, (match, key) => replacements[key] || match);
}

export function generateVideosForLevel(level: number): LearnItem[] {
  const topics = getTopicsForLevel(level);
  const videos: LearnItem[] = [];
  const videosPerLevel = LEARNING_PATH_CONFIG.videosPerLevel;

  for (let i = 0; i < videosPerLevel; i++) {
    const templateIndex = i % VIDEO_TEMPLATES.length;
    const template = VIDEO_TEMPLATES[templateIndex];
    const topic = topics[i % topics.length];

    const replacements = {
      topic,
      reason: REASONS[i % REASONS.length]
    };

    videos.push({
      id: generateId('video', level, i),
      kind: 'video',
      title: fillTemplate(template.title, replacements),
      summary: fillTemplate(template.summary, replacements),
      minutes: template.minutes,
      points: template.points,
      completed: false,
      tags: ['#video', '#education', `#level${level}`],
      thumbnailTheme: ['shoreline', 'violet', 'forest', 'aurora'][i % 4] as any,
      mediaUrl: `https://www.youtube.com/watch?v=placeholder${level}${i}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/placeholder${level}${i}?rel=0&modestbranding=1`,
      sourceName: template.sourceName,
      difficulty: template.difficulty,
      category: template.category,
      author: template.sourceName,
      levelRequirement: level
    });
  }

  return videos;
}

export function generateQuizzesForLevel(level: number): LearnItem[] {
  const topics = getTopicsForLevel(level);
  const quizzes: LearnItem[] = [];
  const quizzesPerLevel = LEARNING_PATH_CONFIG.quizzesPerLevel;

  for (let i = 0; i < quizzesPerLevel; i++) {
    const templateIndex = i % QUIZ_TEMPLATES.length;
    const template = QUIZ_TEMPLATES[templateIndex];
    const topic = topics[i % topics.length];

    const replacements = {
      topic,
      reason: REASONS[i % REASONS.length],
      percentage: PERCENTAGES[i % PERCENTAGES.length]
    };

    quizzes.push({
      id: generateId('quiz', level, i),
      kind: 'quiz',
      title: `Quiz: ${topic} Knowledge Check`,
      summary: fillTemplate(template.question, replacements),
      minutes: 2,
      points: template.points,
      completed: false,
      tags: ['#quiz', '#assessment', `#level${level}`],
      thumbnailTheme: 'violet',
      difficulty: template.difficulty,
      category: 'Knowledge Assessment',
      question: fillTemplate(template.question, replacements),
      options: template.options.map(opt => fillTemplate(opt, replacements)),
      correctIndex: template.correctIndex,
      explanation: fillTemplate(template.explanation, replacements),
      levelRequirement: level
    });
  }

  return quizzes;
}

export function generateArticlesForLevel(level: number): LearnItem[] {
  const topics = getTopicsForLevel(level);
  const articles: LearnItem[] = [];
  const articlesPerLevel = LEARNING_PATH_CONFIG.articlesPerLevel;

  for (let i = 0; i < articlesPerLevel; i++) {
    const templateIndex = i % ARTICLE_TEMPLATES.length;
    const template = ARTICLE_TEMPLATES[templateIndex];
    const topic = topics[i % topics.length];

    const replacements = {
      topic
    };

    articles.push({
      id: generateId('article', level, i),
      kind: 'article',
      title: fillTemplate(template.title, replacements),
      summary: fillTemplate(template.summary, replacements),
      minutes: template.minutes,
      points: template.points,
      completed: false,
      tags: ['#article', '#education', `#level${level}`],
      thumbnailTheme: ['shoreline', 'violet', 'forest', 'aurora'][i % 4] as any,
      difficulty: template.difficulty,
      category: template.category,
      author: template.author,
      articleSections: template.sections.map(section => ({
        heading: fillTemplate(section.heading, replacements),
        paragraphs: section.paragraphs.map(p => fillTemplate(p, replacements)),
        bullets: section.bullets?.map(b => fillTemplate(b, replacements))
      })),
      levelRequirement: level
    });
  }

  return articles;
}

export function generateLearnCatalogForLevel(level: number): LearnItem[] {
  return [
    ...generateVideosForLevel(level),
    ...generateQuizzesForLevel(level),
    ...generateArticlesForLevel(level)
  ];
}

export function getTotalContentForLevel(level: number): { videos: number; quizzes: number; articles: number } {
  return {
    videos: LEARNING_PATH_CONFIG.videosPerLevel,
    quizzes: LEARNING_PATH_CONFIG.quizzesPerLevel,
    articles: LEARNING_PATH_CONFIG.articlesPerLevel
  };
}

export function getLearningPathProgress(level: number): {
  unlockedVideos: number;
  unlockedQuizzes: number;
  unlockedArticles: number;
  totalVideos: number;
  totalQuizzes: number;
  totalArticles: number;
} {
  const unlockedVideos = level * LEARNING_PATH_CONFIG.videosPerLevel;
  const unlockedQuizzes = level * LEARNING_PATH_CONFIG.quizzesPerLevel;
  const unlockedArticles = level * LEARNING_PATH_CONFIG.articlesPerLevel;

  return {
    unlockedVideos: Math.min(unlockedVideos, LEARNING_PATH_CONFIG.totalVideos),
    unlockedQuizzes: Math.min(unlockedQuizzes, LEARNING_PATH_CONFIG.totalQuizzes),
    unlockedArticles: Math.min(unlockedArticles, LEARNING_PATH_CONFIG.totalArticles),
    totalVideos: LEARNING_PATH_CONFIG.totalVideos,
    totalQuizzes: LEARNING_PATH_CONFIG.totalQuizzes,
    totalArticles: LEARNING_PATH_CONFIG.totalArticles
  };
}