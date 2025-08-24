# Environment Setup for Claude API

To enable advanced AI-powered card generation, you'll need to set up the Claude API:

## 1. Get Claude API Key
1. Visit: https://console.anthropic.com/
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key

## 2. Create Environment File
Create a file named `.env.local` in your project root with:

```bash
ANTHROPIC_API_KEY=your_actual_api_key_here
```

## 3. Restart Development Server
After adding the API key:
```bash
npm run dev
```

## What You Get with Claude API:
- **Understanding-focused cards**: Tests comprehension, not just memorization
- **Unlimited cards**: No artificial limits - creates as many as needed
- **Deep explanations**: Detailed answers with reasoning and mechanisms  
- **Better quality**: Much more relevant and educational content
- **Comprehensive coverage**: Analyzes entire PDF for all key concepts

## Without Claude API:
- App still works perfectly with rule-based generation
- Creates basic flashcards from text patterns
- Good for simple factual information

The application automatically detects if Claude API is available and uses it when possible, with seamless fallback to rule-based generation.
