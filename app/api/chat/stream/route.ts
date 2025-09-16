export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    console.log('=== Chat Stream API ===')
    console.log('Messages:', messages)

    // Check for AI Gateway API key first, then fallback to other keys
    const aiGatewayKey = process.env.AI_GATEWAY_API_KEY
    const vercelToken = process.env.VERCEL_OIDC_TOKEN
    const openaiKey = process.env.OPENAI_API_KEY

    console.log('=== Environment Variables Check ===')
    console.log('AI_GATEWAY_API_KEY exists:', !!aiGatewayKey)
    console.log('VERCEL_OIDC_TOKEN exists:', !!vercelToken)
    console.log('OPENAI_API_KEY exists:', !!openaiKey)

    if (!aiGatewayKey && !vercelToken && !openaiKey) {
      return new Response('No AI API keys found', { status: 500 })
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || (lastMessage.role !== 'user' && lastMessage.type !== 'user')) {
      return new Response('No user message found', { status: 400 })
    }

    // Try to get AI response using available API keys
    let response = ''

    try {
      // Convert messages to the format expected by AI APIs
      const formattedMessages = messages.map((msg: any) => ({
        role: msg.role || (msg.type === 'user' ? 'user' : 'assistant'),
        content: msg.content
      }))

      if (aiGatewayKey) {
        console.log('Using AI Gateway API key for chat response')
        response = await generateAIGatewayChatResponse(formattedMessages, aiGatewayKey)
      } else if (vercelToken) {
        console.log('Using Vercel OIDC Token for chat response')
        response = await generateVercelOIDCChatResponse(formattedMessages, vercelToken)
      } else if (openaiKey) {
        console.log('Using OpenAI API for chat response')
        response = await generateOpenAIChatResponse(formattedMessages, openaiKey)
      } else {
        throw new Error('No AI API keys available')
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      return new Response(JSON.stringify({ 
        content: 'Sorry, I am unable to respond at the moment. Please try again later.',
        role: 'assistant'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      })
    }

    // Return a simple JSON response instead of streaming to avoid controller issues
    return new Response(JSON.stringify({ 
      content: response,
      role: 'assistant'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Chat stream error:', error)
    return new Response('Error', { status: 500 })
  }
}

async function generateVercelOIDCChatResponse(messages: any[], oidcToken: string): Promise<string> {
  try {
    console.log('Making request to Vercel AI Gateway with OIDC token...')
    
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
    
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
            content: 'You are Lex, a friendly and encouraging AI tutor. Always be supportive while providing accurate educational feedback. Keep responses concise and helpful.'
          },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Vercel OIDC chat error response:', errorText)
      throw new Error(`Vercel OIDC API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'I apologize, but I cannot respond at the moment.'
  } catch (error) {
    console.error('Vercel OIDC chat error:', error)
    throw error
  }
}

async function generateAIGatewayChatResponse(messages: any[], apiKey: string): Promise<string> {
  try {
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
            content: 'You are Lex, a friendly and encouraging AI tutor. Always be supportive while providing accurate educational feedback. Keep responses concise and helpful.'
          },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('AI Gateway chat error response:', errorText)
      throw new Error(`AI Gateway API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'I apologize, but I cannot respond at the moment.'
  } catch (error) {
    console.error('AI Gateway chat error:', error)
    throw error
  }
}

async function generateOpenAIChatResponse(messages: any[], apiKey: string): Promise<string> {
  try {
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
            content: 'You are Lex, a friendly and encouraging AI tutor. Always be supportive while providing accurate educational feedback. Keep responses concise and helpful.'
          },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('OpenAI chat error response:', errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'I apologize, but I cannot respond at the moment.'
  } catch (error) {
    console.error('OpenAI chat error:', error)
    throw error
  }
}

function generateMockChatResponse(userMessage: string): string {
  if (userMessage.toLowerCase().includes('hi') || userMessage.toLowerCase().includes('hello')) {
    return "Hello! I'm Lex, your AI tutor! 🤖✨ I'm here to help you with your homework. I can provide hints, explanations, and guidance for the questions. What would you like to know?"
  } else if (userMessage.toLowerCase().includes('hint')) {
    return "Here's a hint: Try breaking down the problem into smaller steps. Look for patterns and apply the concepts you've learned in class. What specific part are you struggling with?"
  } else if (userMessage.toLowerCase().includes('explain')) {
    return "I'd be happy to explain! Can you tell me which concept or part of the problem you'd like me to clarify? I can break it down step by step for you."
  } else if (userMessage.toLowerCase().includes('help')) {
    return "I'm here to help! I can:\n• Provide hints without giving away the answer\n• Explain concepts and methods\n• Guide you through problem-solving steps\n• Answer questions about the topic\n\nWhat would you like help with?"
  } else {
    return "I understand you're working on this problem. I can help you by providing hints, explaining concepts, or guiding you through the solution process. What specific aspect would you like assistance with?"
  }
}
