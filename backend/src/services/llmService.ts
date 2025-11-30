import axios from 'axios';
import { Module, Question, Resource } from '../types';

interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class LLMService {
  private apiUrl: string;
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiUrl = process.env.AI_MODEL_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
    this.apiKey = process.env.AI_MODEL_API_KEY || '';
    this.modelName = process.env.AI_MODEL_NAME || 'gpt-3.5-turbo';

  console.log({
    URL: this.apiUrl,
    KEY: this.apiKey,
    MODEL: this.modelName
  })

  }


  private async callLLM(prompt: string): Promise<string> {
    try {
      const response = await axios.post<LLMResponse>(
        this.apiUrl,
        {
          model: this.modelName,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3009',
            'X-Title': 'SkillFoundry'
          }
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('LLM API Error:', error);
      throw new Error('Failed to generate content');
    }
  }

  async generateCurriculum(skill: string, level: string, timePerWeek: number, weeks: number = 12): Promise<{ modules: Module[], weeklyRoadmap: any[] }> {
    const prompt = `Create a comprehensive ${weeks}-week curriculum for learning "${skill}" at ${level} level with ${timePerWeek} hours per week.

Return a JSON object with:
1. "modules": Array of modules, each with:
   - id: unique string
   - title: module name
   - description: brief description
   - estimatedWeeks: number of weeks
   - topics: array of topics, each with:
     - id: unique string
     - title: topic name
     - description: brief description
     - difficulty: "beginner"|"intermediate"|"advanced"
     - subtopics: array with id, title, description, estimatedHours

2. "weeklyRoadmap": Array of exactly ${weeks} weekly plans with:
   - week: number (1 to ${weeks})
   - topics: array of topic IDs to cover
   - estimatedHours: total hours for the week
   - goals: array of learning goals

IMPORTANT: Create exactly ${weeks} weeks, no more, no less. Distribute all topics across these ${weeks} weeks.
Make it practical and progressive. Focus on hands-on learning.`;

    const response = await this.callLLM(prompt);
    try {
      return JSON.parse(response);
    } catch {
      // Fallback curriculum if parsing fails
      return this.getFallbackCurriculum(skill, level, weeks);
    }
  }

  async generateLesson(subtopicTitle: string, skill: string, level: string): Promise<any> {
    const prompt = `Create a lesson for "${subtopicTitle}" in ${skill} for ${level} level.

Return JSON with:
- title: lesson title
- objective: what student will learn
- content: detailed explanation (300-500 words)
- examples: array of 2-3 practical examples
- practiceTask: hands-on task for the student

Make it engaging and practical.`;

    const response = await this.callLLM(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return this.getFallbackLesson(subtopicTitle);
    }
  }

  async generateQuiz(lessonTitle: string, content: string): Promise<Question[]> {
    const prompt = `Create 5 multiple choice questions for a lesson titled "${lessonTitle}".

Return JSON array of questions, each with:
- id: unique string
- text: question text
- options: array of 4 answer choices
- correctAnswer: index (0-3) of correct answer
- explanation: why the answer is correct

Base questions on this content: ${content.substring(0, 500)}...`;

    const response = await this.callLLM(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return this.getFallbackQuiz(lessonTitle);
    }
  }

  async generateResources(topicTitle: string, skill: string, level: string): Promise<Resource[]> {
    const prompt = `Suggest 8-10 learning resources for "${topicTitle}" in ${skill} for ${level} level.

Return JSON array with mix of books, courses, articles, and videos. Each resource:
- type: "book"|"course"|"article"|"video"
- title: resource title
- authorOrSource: author or platform name
- level: "beginner"|"intermediate"|"advanced"
- estimatedTime: time to complete
- reason: why recommended (1 sentence)
- description: brief description
- url: valid URL or "#" if no valid URL available

IMPORTANT: Only provide real, valid URLs. If you don't have a valid URL, use "#" instead. Do not use placeholder URLs like example.com.
Include both free and paid options.`;

    const response = await this.callLLM(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return this.getFallbackResources(topicTitle);
    }
  }

  async generateProjects(moduleTitle: string, skill: string, level: string): Promise<any[]> {
    const prompt = `Create 2-3 project ideas for "${moduleTitle}" in ${skill} for ${level} level.

Return JSON array of projects, each with:
- title: project name
- description: what to build (2-3 sentences)
- requirements: array of key features
- techStack: array of technologies to use
- skillsDemonstrated: array of skills this project shows
- difficulty: "beginner"|"intermediate"|"advanced"

Make projects practical and portfolio-worthy.`;

    const response = await this.callLLM(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return this.getFallbackProjects(moduleTitle);
    }
  }

  // Fallback methods for when AI fails
  private getFallbackCurriculum(skill: string, level: string, weeks: number = 12): any {
    const weeklyRoadmap = [];
    for (let i = 1; i <= weeks; i++) {
      weeklyRoadmap.push({
        week: i,
        topics: ['topic-1'],
        estimatedHours: 5,
        goals: [`Week ${i}: Learn ${skill} concepts`]
      });
    }
    
    return {
      modules: [{
        id: 'module-1',
        title: `${skill} Fundamentals`,
        description: `Core concepts and basics of ${skill}`,
        estimatedWeeks: weeks,
        topics: [{
          id: 'topic-1',
          title: 'Introduction',
          description: `Getting started with ${skill}`,
          difficulty: level,
          subtopics: [{
            id: 'subtopic-1',
            title: 'Overview',
            description: `What is ${skill}?`,
            estimatedHours: 2
          }]
        }]
      }],
      weeklyRoadmap
    };
  }

  private getFallbackLesson(title: string): any {
    return {
      title,
      objective: `Learn about ${title}`,
      content: `This lesson covers the fundamentals of ${title}. You'll learn key concepts and practical applications.`,
      examples: [`Example 1: Basic ${title} usage`, `Example 2: Advanced ${title} techniques`],
      practiceTask: `Practice implementing ${title} concepts`
    };
  }

  private getFallbackQuiz(title: string): Question[] {
    return [{
      id: 'q1',
      text: `What is the main purpose of ${title}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'This is the correct answer because...'
    }];
  }

  private getFallbackResources(topic: string): Resource[] {
    return [{
      topicId: 'topic-1',
      type: 'article',
      title: `${topic} Guide`,
      level: 'beginner',
      reason: 'Comprehensive introduction',
      description: `Learn ${topic} fundamentals`,
      url: '#'
    } as any];
  }

  private getFallbackProjects(module: string): any[] {
    return [{
      title: `${module} Project`,
      description: `Build a practical project using ${module} concepts`,
      requirements: ['Feature 1', 'Feature 2'],
      techStack: ['Technology 1', 'Technology 2'],
      skillsDemonstrated: ['Skill 1', 'Skill 2'],
      difficulty: 'beginner'
    }];
  }
}

export default new LLMService();