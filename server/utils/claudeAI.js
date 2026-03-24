/**
 * Claude AI Utility Functions
 * Uses Anthropic Claude API for GenAI features
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(prompt) {
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API Error:', errorData);
      throw new Error(`Claude API returned ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error.message);
    throw error;
  }
}

/**
 * 1. Analyze a citizen complaint
 * Returns: { severity, category, summary, recommendedAction }
 */
async function analyzeComplaint(description, imageDescription = '') {
  const prompt = `You are a civic complaint analyzer for a municipal garbage management system.
A citizen has reported the following issue:

Description: ${description}
${imageDescription ? `Image observation: ${imageDescription}` : ''}

Analyze this complaint and return a JSON object with:
- severity: one of "Low", "Medium", "High"
- category: one of "Open Dumping", "Missed Pickup", "Overflow", "Other"
- summary: a 1-2 sentence professional summary of the complaint
- recommendedAction: what the municipal authority should do (1-2 sentences)

Return ONLY valid JSON, no extra text, no markdown formatting, no code blocks.`;

  try {
    const result = await callClaude(prompt);
    // Clean any potential markdown formatting
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Error analyzing complaint:', error.message);
    // Return fallback analysis
    return {
      severity: 'Medium',
      category: 'Other',
      summary: description.substring(0, 100),
      recommendedAction: 'Municipal authority should investigate and address this complaint.',
    };
  }
}

/**
 * 2. Generate a smart notification for ward residents
 * Returns: notification text string
 */
async function generateSmartNotification(wardName, collectionTime, context = '') {
  const prompt = `You are a civic alert system for a Smart Garbage Collection platform.
Generate a polite, friendly, localized notification in simple English (maximum 2 sentences) to tell residents of ${wardName} that garbage collection will happen at ${collectionTime}.
${context ? `Additional context: ${context}` : ''}

Make it warm, motivating, and action-oriented. Encourage residents to keep their garbage ready.
Return ONLY the notification text, nothing else.`;

  try {
    const result = await callClaude(prompt);
    return result.trim();
  } catch (error) {
    console.error('Error generating notification:', error.message);
    return `Dear residents of ${wardName}, garbage collection is scheduled at ${collectionTime}. Please keep your waste bags ready for pickup.`;
  }
}

/**
 * 3. Summarize citizen feedback
 * Returns: { sentiment, keyIssues: [], recommendations: [] }
 */
async function summarizeFeedback(feedbackArray) {
  const feedbackText = feedbackArray.map((f, i) => `${i + 1}. ${f}`).join('\n');

  const prompt = `You are a civic data analyst for a municipal garbage management system.
Here is a list of citizen feedback and complaints about garbage collection service:

${feedbackText}

Analyze all the feedback and return a JSON object with:
- sentiment: overall sentiment as "Positive", "Neutral", or "Negative"
- keyIssues: an array of 3-5 key issues identified from the feedback
- recommendations: an array of 2-3 actionable recommendations for the municipal authority

Return ONLY valid JSON, no extra text, no markdown formatting, no code blocks.`;

  try {
    const result = await callClaude(prompt);
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Error summarizing feedback:', error.message);
    return {
      sentiment: 'Neutral',
      keyIssues: ['Unable to analyze feedback at this time'],
      recommendations: ['Please review individual complaints for details'],
    };
  }
}

module.exports = {
  analyzeComplaint,
  generateSmartNotification,
  summarizeFeedback,
};
