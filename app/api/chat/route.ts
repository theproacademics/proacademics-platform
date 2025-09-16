import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export async function POST(request: NextRequest) {
  try {
    // TODO: Add proper authentication
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    // }

    const { message, context } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      )
    }

    // Check if we have AI Gateway API key
    const aiGatewayApiKey = process.env.AI_GATEWAY_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY

    let response: string

    if (aiGatewayApiKey) {
      // Use Vercel AI Gateway
      console.log('Using Vercel AI Gateway for chat response')
      response = await generateAIGatewayChatResponse(message, context, aiGatewayApiKey)
    } else if (openaiApiKey) {
      // Use direct OpenAI API
      console.log('Using direct OpenAI API for chat response')
      response = await generateOpenAIChatResponse(message, context, openaiApiKey)
    } else {
      // Fallback to mock response
      console.log('No API keys found, using mock chat response')
      response = generateMockChatResponse(message, context)
    }

    return NextResponse.json({
      success: true,
      response: response
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateAIGatewayChatResponse(message: string, context: any, apiKey: string): Promise<string> {
  try {
    let systemPrompt = "You are Lex, a friendly and encouraging AI tutor. Always be supportive while providing accurate educational guidance. Help students learn without giving away direct answers."
    
    if (context?.type === 'homework' && context?.currentQuestion) {
      const question = context.currentQuestion
      systemPrompt += `\n\nCurrent homework context:
      - Subject: ${context.subject || 'General'}
      - Topic: ${question.topic || 'General'}
      - Subtopic: ${question.subtopic || 'Basic'}
      - Difficulty: ${question.level || 'medium'}
      - Question: ${question.question || 'No question provided'}
      
      Provide helpful guidance without giving the direct answer.`
    }

    const response = await fetch('https://gateway.vercel.com/v1/chat/completions', {
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`AI Gateway API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'I apologize, but I cannot generate a response at this time.'
  } catch (error) {
    console.error('AI Gateway chat error:', error)
    return generateMockChatResponse(message, context) // Fallback to mock
  }
}

async function generateOpenAIChatResponse(message: string, context: any, apiKey: string): Promise<string> {
  try {
    let systemPrompt = "You are Lex, a friendly and encouraging AI tutor. Always be supportive while providing accurate educational guidance. Help students learn without giving away direct answers."
    
    if (context?.type === 'homework' && context?.currentQuestion) {
      const question = context.currentQuestion
      systemPrompt += `\n\nCurrent homework context:
      - Subject: ${context.subject || 'General'}
      - Topic: ${question.topic || 'General'}
      - Subtopic: ${question.subtopic || 'Basic'}
      - Difficulty: ${question.level || 'medium'}
      - Question: ${question.question || 'No question provided'}
      
      Provide helpful guidance without giving the direct answer.`
    }

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'I apologize, but I cannot generate a response at this time.'
  } catch (error) {
    console.error('OpenAI chat error:', error)
    return generateMockChatResponse(message, context) // Fallback to mock
  }
}

function generateMockChatResponse(message: string, context: any): string {
  if (context?.type === 'homework' && context?.currentQuestion) {
    const question = context.currentQuestion
    
    // Generate contextual response based on the question
    if (message.toLowerCase().includes('hint')) {
      return `Here's a hint for this ${question.level} level question:\n\nFocus on the key concepts in ${question.topic} - ${question.subtopic}. The mark scheme suggests: ${question.markScheme.substring(0, 200)}...`
    } else if (message.toLowerCase().includes('explain') || message.toLowerCase().includes('how')) {
      return `Let me explain this ${question.subject} question:\n\nTopic: ${question.topic}\nSubtopic: ${question.subtopic}\nDifficulty: ${question.level}\n\nThe question is asking you to apply concepts from ${question.topic}. Start by identifying what type of problem this is and what formulas or methods might be relevant.`
    } else if (message.toLowerCase().includes('solution') || message.toLowerCase().includes('answer')) {
      return `I can't give you the direct answer, but I can guide you through the solution process:\n\n1. Read the question carefully\n2. Identify what's given and what you need to find\n3. Apply the appropriate ${question.topic} concepts\n4. Show your working step by step\n\nTry working through it step by step, and let me know if you get stuck!`
    } else {
      return `I'm here to help you with this ${question.subject} homework question. I can provide hints, explain concepts, or guide you through the solution process. What specific aspect would you like help with?\n\nQuestion context:\n- Topic: ${question.topic}\n- Subtopic: ${question.subtopic}\n- Level: ${question.level}`
    }
  } else {
    return `Hello! I'm your AI study assistant. I can help you with:\n\n• Explaining mathematical concepts\n• Providing hints for homework problems\n• Guiding you through solution steps\n• Clarifying topics and subtopics\n\nWhat would you like help with today?`
  }
}

// TODO: Implement actual ChatGPT API integration
// Example implementation:
/*
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, context } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      )
    }

    // Build context-aware prompt
    let systemPrompt = "You are a helpful AI tutor for students. Provide educational guidance, hints, and explanations without giving away direct answers."
    
    if (context?.type === 'homework' && context?.currentQuestion) {
      const question = context.currentQuestion
      systemPrompt += `\n\nCurrent homework context:
      - Subject: ${context.subject}
      - Topic: ${question.topic}
      - Subtopic: ${question.subtopic}
      - Difficulty: ${question.level}
      - Question: ${question.question}
      
      Provide helpful guidance without giving the direct answer.`
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response."

    return NextResponse.json({
      success: true,
      response: response
    })

  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return NextResponse.json(
      { success: false, message: 'AI service temporarily unavailable' },
      { status: 500 }
    )
  }
}
*/
