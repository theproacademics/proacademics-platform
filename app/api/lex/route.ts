import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

// System prompt that guides the AI to act as an educational assistant
const LEX_SYSTEM_PROMPT = `
You are Lex, an AI educational assistant for the ProAcademics platform.

Your primary goal is to help students learn and understand academic concepts across various subjects including Mathematics, Physics, Chemistry, and Biology.

Guidelines:
- Provide clear, accurate explanations tailored to the student's academic level
- Break down complex concepts into understandable parts
- Use examples to illustrate concepts when helpful
- When explaining mathematical concepts, use clear notation and step-by-step solutions
- Encourage critical thinking rather than just providing answers
- Be encouraging and supportive, using a friendly but professional tone
- If you don't know something, admit it rather than providing incorrect information
- Format your responses with markdown for clarity (use ** for bold, * for italics, etc.)
- For mathematical equations, use proper notation

Remember that you're helping students learn, so focus on explanations that build understanding rather than just giving answers.
`

// Fallback responses for when AI is not available
const fallbackResponses = {
  math: "I'd be happy to help with your math question! For quadratic equations, remember the standard form is ax² + bx + c = 0. You can solve using factoring, completing the square, or the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a. What specific part would you like me to explain further?",
  physics:
    "Great physics question! I'm here to help you understand the concepts. Physics is all about understanding how things move and interact. Whether it's forces, energy, waves, or electricity, breaking down problems step by step is key. What specific physics topic are you working on?",
  chemistry:
    "Chemistry can be fascinating! Remember that chemistry is about understanding how atoms and molecules interact. Whether you're looking at chemical reactions, bonding, or molecular structures, I can help break down the concepts. What chemistry topic would you like to explore?",
  biology:
    "Biology is the study of life and living organisms! From cells to ecosystems, there's so much to discover. Whether you're studying genetics, evolution, anatomy, or ecology, I'm here to help explain the concepts clearly. What biology topic interests you?",
  general:
    "I'm Lex, your AI learning assistant! I'm here to help you with any academic questions you have. Whether it's math, science, or any other subject, I'll do my best to explain concepts clearly and help you understand. What would you like to learn about today?",
}

function getTopicFromMessage(message: string): keyof typeof fallbackResponses {
  const lowerMessage = message.toLowerCase()
  if (
    lowerMessage.includes("math") ||
    lowerMessage.includes("equation") ||
    lowerMessage.includes("algebra") ||
    lowerMessage.includes("calculus")
  ) {
    return "math"
  }
  if (
    lowerMessage.includes("physics") ||
    lowerMessage.includes("force") ||
    lowerMessage.includes("motion") ||
    lowerMessage.includes("wave")
  ) {
    return "physics"
  }
  if (
    lowerMessage.includes("chemistry") ||
    lowerMessage.includes("chemical") ||
    lowerMessage.includes("reaction") ||
    lowerMessage.includes("molecule")
  ) {
    return "chemistry"
  }
  if (
    lowerMessage.includes("biology") ||
    lowerMessage.includes("cell") ||
    lowerMessage.includes("organism") ||
    lowerMessage.includes("dna")
  ) {
    return "biology"
  }
  return "general"
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid request. Messages array is required." }, { status: 400 })
    }

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.log("OpenAI API key not found, using fallback response")

      // Get the latest user message to determine topic
      const latestMessage = messages[messages.length - 1]
      const topic = getTopicFromMessage(latestMessage.content)

      // Return a contextual fallback response
      return NextResponse.json({
        response: fallbackResponses[topic],
        fallback: true,
      })
    }

    // Extract the latest user message
    const latestMessage = messages[messages.length - 1]

    // Construct the conversation history for context
    let prompt = ""
    for (let i = 0; i < messages.length; i++) {
      const role = messages[i].sender === "user" ? "User" : "Lex"
      prompt += `${role}: ${messages[i].content}\n\n`
    }

    // Generate response using AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o", { apiKey }),
      system: LEX_SYSTEM_PROMPT,
      prompt: prompt,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error in Lex AI API:", error)

    // If it's an API key error, provide a helpful fallback
    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json({
        response:
          "I'm currently experiencing some technical difficulties, but I'm still here to help! While my AI capabilities are temporarily limited, I can still provide general guidance on your studies. What subject would you like to work on?",
        fallback: true,
      })
    }

    return NextResponse.json({ error: "Failed to generate response. Please try again." }, { status: 500 })
  }
}
