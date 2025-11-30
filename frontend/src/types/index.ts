export interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

export interface UserProfile {
  targetSkill: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  timePerWeek: number;
  goalType: 'job-ready' | 'exam' | 'hobby' | 'other';
  preferredStyle: 'text' | 'video' | 'mixed';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Curriculum {
  _id: string;
  userId: string;
  skill: string;
  modules: Module[];
  weeklyRoadmap: WeeklyPlan[];
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  estimatedWeeks: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  subtopics: Subtopic[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Subtopic {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
}

export interface WeeklyPlan {
  week: number;
  topics: string[];
  estimatedHours: number;
  goals: string[];
}

export interface Lesson {
  _id: string;
  subtopicId: string;
  title: string;
  objective: string;
  content: string;
  examples: string[];
  practiceTask: string;
  createdAt: string;
}

export interface Quiz {
  _id: string;
  lessonId: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface QuizResult {
  score: number;
  results: QuestionResult[];
  message: string;
}

export interface QuestionResult {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

export interface Resource {
  _id: string;
  topicId: string;
  type: 'book' | 'course' | 'article' | 'video';
  title: string;
  authorOrSource?: string;
  url?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  reason: string;
  description: string;
}

export interface Project {
  _id: string;
  moduleId: string;
  title: string;
  description: string;
  requirements: string[];
  techStack: string[];
  skillsDemonstrated: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Dashboard {
  overallProgress: number;
  currentWeek: number;
  completedLessons: number;
  completedQuizzes: number;
  completedWeeks: number[];
  totalWeeks: number;
  masteryScores: Record<string, number>;
  weeklyRoadmap: WeeklyPlan[];
}