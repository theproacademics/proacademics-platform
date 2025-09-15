export interface QuestionData {
  questionId: string
  question: string
  userAnswer: string
  markScheme: string
  topic: string
  subtopic: string
  level: 'easy' | 'medium' | 'hard'
  maxMarks?: number
}

export interface AIEvaluationResponse {
  success: boolean
  evaluation?: string
  error?: string
  questionData?: {
    questionId: string
    topic: string
    subtopic: string
    level: string
  }
}

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

class AIService {
  async evaluateAnswer(questionData: QuestionData): Promise<AIEvaluationResponse> {
    try {
      console.log('=== AI Service: Evaluating answer ===')
      console.log('Question data:', questionData)

      const response = await fetch('/api/ai/evaluate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionData }),
      })

      const result = await response.json()
      console.log('=== AI Service: Evaluation result ===')
      console.log('Result:', result)

      return result
    } catch (error) {
      console.error('Error in AI service:', error)
      return {
        success: false,
        error: 'Failed to evaluate answer'
      }
    }
  }

  createWelcomeMessage(homeworkName: string): ChatMessage {
    return {
      id: `welcome-${Date.now()}`,
      type: 'assistant',
      content: `Hello! I'm Lex, your AI tutor! 🤖✨ I'm here to help you with your "${homeworkName}" homework. I can provide hints, explanations, and guidance for the questions. What would you like to know?`,
      timestamp: new Date()
    }
  }

  createEvaluationMessage(evaluation: string): ChatMessage {
    return {
      id: `evaluation-${Date.now()}`,
      type: 'assistant',
      content: evaluation,
      timestamp: new Date()
    }
  }

  createLoadingMessage(): ChatMessage {
    return {
      id: `loading-${Date.now()}`,
      type: 'assistant',
      content: '🤔 Let me analyze your answer... This will just take a moment!',
      timestamp: new Date()
    }
  }

  createErrorMessage(error: string): ChatMessage {
    return {
      id: `error-${Date.now()}`,
      type: 'assistant',
      content: `Oops! I encountered an issue: ${error}. Please try again! 😅`,
      timestamp: new Date()
    }
  }

  createUserMessage(content: string): ChatMessage {
    return {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    }
  }
}

export const aiService = new AIService()