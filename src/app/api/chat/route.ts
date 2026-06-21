import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import codebaseSnapshot from '@/data/codebase-snapshot.json';

export const maxDuration = 30;

// In-memory rate limiter for single-instance Node.js hosts (e.g. EC2 / Vercel Edge Cache)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per hour per IP

function isRateLimited(ip: string): boolean {
  const r = rateLimitMap.get(ip) || { count: 0, timestamp: Date.now() };
  if (Date.now() - r.timestamp > RATE_LIMIT_WINDOW_MS) r.count = 0;
  if (r.count >= MAX_REQUESTS_PER_WINDOW) return true;
  rateLimitMap.set(ip, { count: r.count + 1, timestamp: r.count === 0 ? Date.now() : r.timestamp });
  return false;
}

export async function POST(req: Request) {
  try {
    // 1. IP-Based Rate Limiting Security
    const forwardedFor = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    if (ip !== 'unknown' && isRateLimited(ip)) {
      return new Response('Rate limit exceeded. Please try again later.', { status: 429 });
    }

    const { messages = [] }: { messages: UIMessage[] } = await req.json();

    // 2. Payload Sanitization Security
    // Truncate history to the last 15 messages to prevent context window explosion
    const truncatedMessages = Array.isArray(messages) ? messages.slice(-15) : [];
    
    // Validate the latest message size (Max 500 characters)
    const latestMessage = truncatedMessages[truncatedMessages.length - 1] as any;
    if (latestMessage?.role === 'user' && typeof latestMessage?.content === 'string' && latestMessage.content.length > 500) {
      return new Response('Payload too large. Maximum 500 characters allowed.', { status: 413 });
    }

    const SYSTEM_PROMPT = `
# IDENTITY & OBJECTIVE
You are the "Core SRE & Technical Portfolio Query Engine" embedded inside Parinya Sawatdee's (Toey) software engineering portfolio site (toey-sawatdee.me). Your strict, deterministic mission is to audit, validate, and showcase Toey's technical qualifications, cloud architecture skills, and deployment automation pipelines to technical recruiters, Tech Leads, and CTOs.

# CONSTRAINTS & COMPLIANCE RULES (CRITICAL)
1. DETERMINISTIC AND FACTUAL ONLY: You must answer queries strictly based on the dynamic # VERIFIED KNOWLEDGE ANCHORS injected into this context from the CI/CD pipeline.
2. NO HALLUCINATION: If a user asks about a skill, tool, or project not defined in the anchors, reply cleanly: "That metric or asset is not configured within Toey's verified infrastructure blueprint."
3. SECURITY SANITIZATION: Never expose real private contact details like phone numbers or explicit emails.
4. OUT-OF-SCOPE REJECTION: Politely reject non-engineering or generic assistant queries.
5. FORMATTING COMPLIANCE: Use precise Markdown formatting. Prioritize code blocks for commands, text diagrams for deployment pipelines, and structured tables for technical comparisons. Avoid visual clutter or generic emoji noise.

# VERIFIED KNOWLEDGE ANCHORS (CI/CD DYNAMIC INGESTION)
The following data was automatically extracted and injected by the GitHub Actions pipeline during the build phase:

\`\`\`json
${JSON.stringify(codebaseSnapshot, null, 2)}
\`\`\`

# RESPONSE OUTPUT STYLE
- Adopt a calm, analytical, and highly technical tone (acting as an SRE Principal).
- Breakdown the requested metrics using the injected JSON context. Relate technical decisions (like using Next.js or AWS SSM) to modern enterprise best practices.
`;

    const modelMessages = await convertToModelMessages(truncatedMessages);
    const result = streamText({
      model: google('gemini-3.1-flash-lite'),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(error?.message || 'Internal Server Error', { status: 500 });
  }
}
