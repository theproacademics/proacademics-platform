import { openai } from '@ai-sdk/openai'
import { generateText, streamText } from 'ai'
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

// Function to clean up AI response and ensure it matches the exact format
function cleanAIResponse(rawResponse: string, questionData: QuestionData): string {
  console.log('=== Cleaning AI Response ===')
  console.log('Raw response:', rawResponse)
  
  // Remove any markdown formatting
  let cleaned = rawResponse.replace(/\*\*(.*?)\*\*/g, '$1')
  
  // Remove any question details that might have been included (but keep the intelligent feedback)
  const questionPatterns = [
    /Question:\s*.*?$/gm,
    /Student's Answer:\s*.*?$/gm,
    /Expected Answer:\s*.*?$/gm,
    /Mark Scheme:\s*.*?$/gm,
    /Topic:\s*.*?$/gm,
    /Difficulty Level:\s*.*?$/gm,
    /Maximum Marks:\s*.*?$/gm,
    /\*\*Question:\*\*\s*.*?$/gm,
    /\*\*Student's Answer:\*\*\s*.*?$/gm,
    /\*\*Mark Scheme\/Expected Answer:\*\*\s*.*?$/gm,
    /\*\*Topic:\*\*\s*.*?$/gm,
    /\*\*Difficulty Level:\*\*\s*.*?$/gm,
    /\*\*Maximum Marks:\*\*\s*.*?$/gm,
    /Mark Scheme\/Expected Answer:\s*.*?$/gm,
    /INSTRUCTIONS:.*?$/gm,
    /RESPONSE FORMAT:.*?$/gm
  ]
  
  questionPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })
  
  // Clean up extra whitespace and newlines
  cleaned = cleaned.replace(/\n\s*\n/g, '\n').trim()
  
  // Remove any leading/trailing whitespace from each line
  cleaned = cleaned.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n')
  
  // Only ensure the response has the basic structure if it's completely missing
  if (!cleaned.includes('Good job,') && !cleaned.includes('Oh no,') && !cleaned.includes('Here\'s the correct way')) {
    // If the response doesn't have the expected format, create a basic one
    cleaned = 'Oh no, you got this wrong!\nHere\'s the correct way to do it:\n{show markscheme}\n___\nHere\'s a video you can watch to help you revise this topic: {link to topic video}'
  }
  
  // Ensure the response ends with the video link if it's missing
  if (!cleaned.includes('Here\'s a video you can watch to help you revise this topic:')) {
    if (cleaned.includes('___')) {
      cleaned = cleaned.replace(/___/, '___\nHere\'s a video you can watch to help you revise this topic: {link to topic video}')
    } else {
      cleaned += '\n___\nHere\'s a video you can watch to help you revise this topic: {link to topic video}'
    }
  }
  
  console.log('Cleaned response:', cleaned)
  return cleaned
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

    // Check for AI Gateway API key first, then fallback to other keys
    const aiGatewayApiKey = process.env.AI_GATEWAY_API_KEY
    const vercelToken = process.env.VERCEL_OIDC_TOKEN
    const openaiApiKey = process.env.OPENAI_API_KEY

    console.log('=== Environment Variables Check ===')
    console.log('AI_GATEWAY_API_KEY exists:', !!aiGatewayApiKey)
    console.log('VERCEL_OIDC_TOKEN exists:', !!vercelToken)
    console.log('OPENAI_API_KEY exists:', !!openaiApiKey)
    if (aiGatewayApiKey) console.log('AI_GATEWAY_API_KEY starts with:', aiGatewayApiKey.substring(0, 10) + '...')
    if (vercelToken) console.log('VERCEL_OIDC_TOKEN starts with:', vercelToken.substring(0, 20) + '...')
    if (openaiApiKey) console.log('OPENAI_API_KEY starts with:', openaiApiKey.substring(0, 10) + '...')

    let evaluation: string

    if (aiGatewayApiKey) {
      console.log('Using Vercel AI Gateway API key for evaluation')
      evaluation = await generateAIGatewayEvaluation(questionData, aiGatewayApiKey)
    } else if (vercelToken) {
      console.log('Using Vercel OIDC Token for AI Gateway evaluation')
      evaluation = await generateVercelOIDCEvaluation(questionData, vercelToken)
    } else if (openaiApiKey) {
      console.log('Using OpenAI API for evaluation')
      evaluation = await generateOpenAIEvaluation(questionData, openaiApiKey)
    } else {
      console.log('No AI API keys available - returning error')
      return NextResponse.json({
        success: false,
        error: 'No AI API keys configured'
      }, { status: 500 })
    }

    console.log('=== AI Evaluation Response ===')
    console.log('Response:', evaluation)

    return NextResponse.json({
      success: true,
      evaluation: evaluation,
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

async function generateVercelOIDCEvaluation(questionData: QuestionData, oidcToken: string): Promise<string> {
  try {
    console.log('=== Vercel OIDC Evaluation Start ===')
    console.log('OIDC Token starts with:', oidcToken.substring(0, 20) + '...')
    
    const { question, userAnswer, markScheme, topic, subtopic, level, maxMarks = 10 } = questionData

    const prompt = `You are Lex, an AI tutor. Analyze this student's answer and provide detailed feedback.

Question: ${question}
Student's Answer: ${userAnswer}
Mark Scheme/Expected Answer: ${markScheme}
Topic: ${topic} - ${subtopic}
Difficulty Level: ${level}
Maximum Marks: ${maxMarks}

INSTRUCTIONS:
1. First, analyze if the student's answer is correct, partially correct, or wrong
2. If correct/partially correct: Start with "Good job, that's correct!" (or "Good job, you're on the right track!" for partial)
3. If wrong: Start with "Oh no, you got this wrong!"
4. Then provide specific feedback about what they did wrong or what they did right
5. Show the correct approach using the mark scheme
6. End with the video link

RESPONSE FORMAT:
[Correctness assessment]
[Specific feedback about their answer]
Here's the correct way to do it:
[Detailed explanation using the mark scheme]
___
Here's a video you can watch to help you revise this topic: {link to topic video}

Be specific about what the student did wrong and how to improve. Use the mark scheme to show the correct method.`

    console.log('Making request to Vercel AI Gateway with OIDC token...')
    
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${oidcToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are Lex, a friendly and encouraging AI tutor. Always be supportive while providing accurate educational feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    console.log('Vercel OIDC response status:', response.status)
    console.log('Vercel OIDC response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Vercel OIDC error response:', errorText)
      throw new Error(`Vercel OIDC API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Vercel OIDC response data:', data)
    const rawResponse = data.choices[0]?.message?.content || 'Unable to generate evaluation at this time.'
    
    // Clean up the response to ensure it matches the exact format
    return cleanAIResponse(rawResponse, questionData)
  } catch (error) {
    console.error('Vercel OIDC evaluation error:', error)
    throw error // Re-throw to be handled by the main function
  }
}

async function generateAIGatewayEvaluation(questionData: QuestionData, apiKey: string): Promise<string> {
  try {
    console.log('=== AI Gateway Evaluation Start ===')
    console.log('API Key starts with:', apiKey.substring(0, 10) + '...')
    
    const { question, userAnswer, markScheme, topic, subtopic, level, maxMarks = 10 } = questionData

    const prompt = `You are Lex, an AI tutor. Analyze this student's answer and provide detailed feedback.

Question: ${question}
Student's Answer: ${userAnswer}
Mark Scheme/Expected Answer: ${markScheme}
Topic: ${topic} - ${subtopic}
Difficulty Level: ${level}
Maximum Marks: ${maxMarks}

INSTRUCTIONS:
1. First, analyze if the student's answer is correct, partially correct, or wrong
2. If correct/partially correct: Start with "Good job, that's correct!" (or "Good job, you're on the right track!" for partial)
3. If wrong: Start with "Oh no, you got this wrong!"
4. Then provide specific feedback about what they did wrong or what they did right
5. Show the correct approach using the mark scheme
6. End with the video link

RESPONSE FORMAT:
[Correctness assessment]
[Specific feedback about their answer]
Here's the correct way to do it:
[Detailed explanation using the mark scheme]
___
Here's a video you can watch to help you revise this topic: {link to topic video}

Be specific about what the student did wrong and how to improve. Use the mark scheme to show the correct method.`

    console.log('Making request to Vercel AI Gateway...')
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are Lex, a friendly and encouraging AI tutor. Always be supportive while providing accurate educational feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    console.log('AI Gateway response status:', response.status)
    console.log('AI Gateway response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('AI Gateway error response:', errorText)
      throw new Error(`AI Gateway API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('AI Gateway response data:', data)
    const rawResponse = data.choices[0]?.message?.content || 'Unable to generate evaluation at this time.'
    
    // Clean up the response to ensure it matches the exact format
    return cleanAIResponse(rawResponse, questionData)
  } catch (error) {
    console.error('AI Gateway evaluation error:', error)
    throw error // Re-throw to be handled by the main function
  }
}

async function generateOpenAIEvaluation(questionData: QuestionData, apiKey: string): Promise<string> {
  try {
    console.log('=== OpenAI Evaluation Start ===')
    console.log('API Key starts with:', apiKey.substring(0, 10) + '...')
    
    const { question, userAnswer, markScheme, topic, subtopic, level, maxMarks = 10 } = questionData

    console.log('Making request to OpenAI API...')
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are Lex, a friendly and encouraging AI tutor. Always be supportive while providing accurate educational feedback.'
          },
          {
            role: 'user',
            content: `You are Lex, an AI tutor. Analyze this student's answer and provide detailed feedback.

Question: ${question}
Student's Answer: ${userAnswer}
Mark Scheme/Expected Answer: ${markScheme}
Topic: ${topic} - ${subtopic}
Difficulty Level: ${level}
Maximum Marks: ${maxMarks}

INSTRUCTIONS:
1. First, analyze if the student's answer is correct, partially correct, or wrong
2. If correct/partially correct: Start with "Good job, that's correct!" (or "Good job, you're on the right track!" for partial)
3. If wrong: Start with "Oh no, you got this wrong!"
4. Then provide specific feedback about what they did wrong or what they did right
5. Show the correct approach using the mark scheme
6. End with the video link

RESPONSE FORMAT:
[Correctness assessment]
[Specific feedback about their answer]
Here's the correct way to do it:
[Detailed explanation using the mark scheme]
___
Here's a video you can watch to help you revise this topic: {link to topic video}

Be specific about what the student did wrong and how to improve. Use the mark scheme to show the correct method.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    console.log('OpenAI response status:', response.status)
    console.log('OpenAI response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('OpenAI error response:', errorText)
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('OpenAI response data:', data)
    const rawResponse = data.choices[0]?.message?.content || 'Unable to generate evaluation at this time.'
    
    // Clean up the response to ensure it matches the exact format
    return cleanAIResponse(rawResponse, questionData)
  } catch (error) {
    console.error('OpenAI evaluation error:', error)
    throw error // Re-throw to be handled by the main function
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
  
  if (isCorrect) {
    return `Good job, that's correct!

Here's the correct way to do it:

{show markscheme}

___

Here's a video you can watch to help you revise this topic:

{link to topic video}`
  } else {
    return `Oh no, you got this wrong!

Here's the correct way to do it:

{show markscheme}

___

Here's a video you can watch to help you revise this topic:

{link to topic video}`
  }
}
