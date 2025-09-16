# Vercel AI Gateway Setup Guide

This guide will help you set up the Vercel AI Gateway to provide real AI responses when students submit homework answers.

## Prerequisites

1. A Vercel account
2. Your project deployed on Vercel (or linked to Vercel)

## Setup Steps

### 1. Access Vercel AI Gateway

1. Go to your Vercel dashboard: https://vercel.com/theproacademics-projects/~/ai
2. Navigate to the "AI Gateway" section
3. Click on "Quick Start" in the left sidebar

### 2. Create an API Key

1. In the "Set up Authentication" section, choose **Option A: API Key**
2. Click the "Create Key" button
3. Copy the generated API key

### 3. Configure Environment Variables

Create a `.env.local` file in your project root with the following content:

```bash
# Vercel AI Gateway Configuration
AI_GATEWAY_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you copied from step 2.

### 4. Alternative: Use OIDC Token (Recommended for Production)

If you prefer automatic token refresh, you can use OIDC instead:

1. In your project directory, run:
   ```bash
   vercel link
   vercel env pull
   ```

2. This will automatically pull the environment variables from Vercel, including the AI Gateway configuration.

## How It Works

### When a Student Submits an Answer

1. Student submits their answer in the homework interface
2. The system calls `/api/ai/evaluate-answer` with the question data
3. The API checks for `AI_GATEWAY_API_KEY` environment variable
4. If found, it uses the Vercel AI Gateway to generate a real AI evaluation
5. The AI response appears in the AI Assistant panel on the right side

### AI Response Features

- **Real AI Evaluation**: Uses GPT-4o through Vercel AI Gateway
- **Structured Feedback Format**: Provides responses in the exact format you specified:
  - "Good job, that's correct!" or "Oh no, you got this wrong!"
  - "Here's the correct way to do it:"
  - "{show markscheme}"
  - "___" (horizontal line)
  - "Here's a video you can watch to help you revise this topic: {link to topic video}"
- **Contextual Feedback**: Considers the question, student's answer, mark scheme, topic, and difficulty level
- **Educational Focus**: Provides constructive feedback without giving away answers
- **Fallback Support**: Falls back to mock responses if API keys are not configured

### Chat Integration

The AI Assistant chat also uses the same Vercel AI Gateway for:
- Providing hints
- Explaining concepts
- Guiding students through problems
- General educational support

## Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to a homework question
3. Submit an answer
4. Check the AI Assistant panel for the real AI response

## Troubleshooting

### No AI Response
- Check that `AI_GATEWAY_API_KEY` is set in your `.env.local` file
- Verify the API key is correct
- Check the browser console for any error messages

### Fallback to Mock Responses
- If no API key is found, the system will use mock responses
- This ensures the application continues to work even without AI configuration

### API Errors
- Check the Vercel AI Gateway dashboard for usage and error logs
- Ensure you have sufficient credits in your Vercel account
- Verify the API key has the correct permissions

## Cost Considerations

- Vercel AI Gateway provides $5 in free credits
- Monitor your usage in the Vercel dashboard
- Consider setting up billing alerts for production use

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Use environment variables in production deployments
