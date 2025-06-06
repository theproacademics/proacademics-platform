import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

// System prompt for generating educational questions
const QUESTION_GENERATION_PROMPT = `
You are an AI educational assistant that generates multiple-choice questions for students.

Create questions that are educational, clear, and appropriate for high school or early college students.
Each question should have:
1. A clear question text
2. Four possible answer options (labeled A, B, C, D)
3. The index of the correct answer (0 for A, 1 for B, 2 for C, 3 for D)
4. A difficulty level ("easy", "medium", or "hard")
5. A topic category
6. A detailed explanation of the correct answer
7. A helpful hint that guides the student without giving away the answer

Format your response as a valid JSON array of question objects with these properties:
- id: a unique string identifier
- text: the question text
- options: an array of 4 strings representing the possible answers
- correctAnswer: the index of the correct answer (0-3)
- difficulty: "easy", "medium", or "hard"
- topic: the subject area of the question
- explanation: a detailed explanation of why the correct answer is right
- hint: a helpful hint for students who are stuck

Example:
[
  {
    "id": "math-1",
    "text": "What is the solution to the equation 2x + 5 = 13?",
    "options": ["x = 4", "x = 6", "x = 8", "x = 9"],
    "correctAnswer": 0,
    "difficulty": "easy",
    "topic": "Algebra",
    "explanation": "To solve 2x + 5 = 13, subtract 5 from both sides to get 2x = 8, then divide both sides by 2 to get x = 4.",
    "hint": "Isolate the variable by first moving the constant to the right side."
  }
]
`

// Fallback questions when AI is not available
const fallbackQuestions = [
  {
    id: "fallback-math-1",
    text: "Solve for x: 3x + 7 = 22",
    options: ["x = 5", "x = 6", "x = 7", "x = 8"],
    correctAnswer: 0,
    difficulty: "easy",
    topic: "Algebra",
    explanation: "To solve 3x + 7 = 22, first subtract 7 from both sides: 3x = 15. Then divide both sides by 3: x = 5.",
    hint: "Remember to isolate the variable by performing inverse operations.",
  },
  {
    id: "fallback-math-2",
    text: "What is the derivative of f(x) = x² + 3x?",
    options: ["2x + 3", "x² + 3", "2x + 3x", "x + 3"],
    correctAnswer: 0,
    difficulty: "medium",
    topic: "Calculus",
    explanation: "Using the power rule: d/dx(x²) = 2x and d/dx(3x) = 3, so the derivative is 2x + 3.",
    hint: "Apply the power rule: d/dx(xⁿ) = nxⁿ⁻¹",
  },
  {
    id: "fallback-physics-1",
    text: "What is the unit of force in the SI system?",
    options: ["Joule", "Newton", "Watt", "Pascal"],
    correctAnswer: 1,
    difficulty: "easy",
    topic: "Physics Fundamentals",
    explanation: "The Newton (N) is the SI unit of force, named after Sir Isaac Newton. It's defined as kg⋅m/s².",
    hint: "Think about Newton's laws of motion and the scientist they're named after.",
  },
  {
    id: "fallback-chemistry-1",
    text: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Chemical Elements",
    explanation: "Gold's chemical symbol is Au, which comes from its Latin name 'aurum'.",
    hint: "The symbol comes from the Latin name for gold.",
  },
  {
    id: "fallback-biology-1",
    text: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Endoplasmic Reticulum"],
    correctAnswer: 2,
    difficulty: "easy",
    topic: "Cell Biology",
    explanation:
      "Mitochondria are called the powerhouse of the cell because they produce ATP, the cell's main energy currency.",
    hint: "Think about which organelle is responsible for energy production.",
  },
]

export async function POST(req: Request) {
  try {
    const { topics, difficulty, count = 5 } = await req.json()

    if (!topics || !Array.isArray(topics)) {
      return NextResponse.json({ error: "Invalid request. Topics array is required." }, { status: 400 })
    }

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.log("OpenAI API key not found, using fallback questions")

      // Return fallback questions
      const selectedQuestions = fallbackQuestions.slice(0, Math.min(count, fallbackQuestions.length))
      return NextResponse.json({
        questions: selectedQuestions,
        fallback: true,
      })
    }

    // Construct the prompt for question generation
    const prompt = `
      Generate ${count} multiple-choice questions with the following parameters:
      - Topics: ${topics.join(", ")}
      - Difficulty: ${difficulty || "mixed (include some easy, medium, and hard questions)"}
      
      Make sure the questions are challenging but fair, and provide detailed explanations.
    `

    // Generate questions using AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o", { apiKey }),
      system: QUESTION_GENERATION_PROMPT,
      prompt: prompt,
    })

    // Parse the response as JSON
    let questions
    try {
      questions = JSON.parse(text)
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", error)
      // Return fallback questions if parsing fails
      const selectedQuestions = fallbackQuestions.slice(0, Math.min(count, fallbackQuestions.length))
      return NextResponse.json({
        questions: selectedQuestions,
        fallback: true,
      })
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error in question generation API:", error)

    // Return fallback questions on any error
    const selectedQuestions = fallbackQuestions.slice(0, 5)
    return NextResponse.json({
      questions: selectedQuestions,
      fallback: true,
    })
  }
}
