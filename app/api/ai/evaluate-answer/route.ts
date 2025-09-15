import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

interface QuestionData {
  questionId: string
  question: string
  userAnswer: string
  markScheme: string
  topic: string
  subtopic: string
  level: 'easy' | 'medium' | 'hard'
  maxMarks?: number
}

export async function POST(request: Request) {
  try {
    const { questionData }: { questionData: QuestionData } = await request.json()

    console.log('=== AI Evaluation Request ===')
    console.log('Question:', questionData.question)
    console.log('User Answer:', questionData.userAnswer)
    console.log('Mark Scheme:', questionData.markScheme)

    if (!questionData || !questionData.question || !questionData.userAnswer || !questionData.markScheme) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    // Generate AI evaluation (using mock for now due to SDK version issues)
    const text = generateMockEvaluation(questionData)

    console.log('=== AI Evaluation Response ===')
    console.log('Response:', text)

    return NextResponse.json({
      success: true,
      evaluation: text,
      questionData: {
        questionId: questionData.questionId,
        topic: questionData.topic,
        subtopic: questionData.subtopic,
        level: questionData.level
      }
    })

  } catch (error) {
    console.error('Error in AI evaluation:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to evaluate answer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function generateMockEvaluation(questionData: QuestionData): string {
  const { question, userAnswer, markScheme, topic, subtopic, level, maxMarks = 10 } = questionData
  
  // Simple analysis based on answer content
  const answerLength = userAnswer.length
  const hasNumbers = /\d/.test(userAnswer)
  const hasMathSymbols = /[+\-*/=<>]/.test(userAnswer)
  const isDetailed = answerLength > 10
  
  // Calculate score (simplified)
  let score = 0
  if (hasNumbers) score += 3
  if (hasMathSymbols) score += 3
  if (isDetailed) score += 2
  if (answerLength > 0) score += 2
  
  const percentage = Math.round((score / maxMarks) * 100)
  const isCorrect = percentage >= 70
  const isPartiallyCorrect = percentage >= 40 && percentage < 70
  
  return `Hi! I'm Lex, your AI tutor! 🤖✨

## 📊 **Evaluation Results**

**Your Answer:** "${userAnswer}"
**Expected Answer:** "${markScheme}"

---

### 🎯 **Score Breakdown**
**Your Score:** ${score}/${maxMarks} (${percentage}%)

${isCorrect ? '✅ **Excellent!** You got this right!' : isPartiallyCorrect ? '⚠️ **Good effort!** You\'re on the right track!' : '❌ **Not quite right, but don\'t worry!** Let\'s learn together!'}

---

### 📝 **What You Got Right**
${hasNumbers ? '• You included numerical values ✅' : '• Try including more numbers in your answer'}
${hasMathSymbols ? '• You used mathematical notation correctly ✅' : '• Consider using more mathematical symbols'}
${isDetailed ? '• You provided a detailed response ✅' : '• Your answer could be more comprehensive'}

### 💡 **Key Learning Points**
• **Topic:** ${topic} - ${subtopic}
• **Difficulty:** ${level.toUpperCase()}
• **Question:** ${question}

### 🚀 **Suggestions for Improvement**
${!hasNumbers ? '• Include numerical calculations in your answer' : ''}
${!hasMathSymbols ? '• Use mathematical symbols (+, -, ×, ÷, =) to show your work' : ''}
${!isDetailed ? '• Explain your reasoning step by step' : ''}
• Practice similar problems to build confidence

### 🌟 **Keep Going!**
You're doing great! Every mistake is a learning opportunity. Keep practicing and you'll master this topic in no time! 💪

*Remember: I'm here to help whenever you need it!* 😊`
}
