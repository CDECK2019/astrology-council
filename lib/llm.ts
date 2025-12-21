export interface ModelResponse {
    modelId: string;
    role: string;
    content: string;
}

export const COUNCIL_MEMBERS = [
    {
        id: 'mistralai/mistral-7b-instruct',
        name: 'The Sage of Wisdom',
        role: 'Psychological and Spiritual Insights',
        specialty: 'Deeper psychological patterns and spiritual growth.',
    },
    {
        id: 'qwen/qwen-2.5-7b-instruct',
        name: 'The Scholar of Tradition',
        role: 'Classical Vedic Interpretation',
        specialty: 'Traditional yogas, dashas, and nakshatra analysis.',
    },
    {
        id: 'meta-llama/llama-3.1-8b-instruct',
        name: 'The Architect of Life',
        role: 'Practical Application and Timing',
        specialty: 'Career, finance, and practical life advice.',
    },
];

// Council President uses Gemini for high-quality synthesis
const MASTER_MODEL = 'meta-llama/llama-3.1-8b-instruct';

const SCORING_CRITERIA = `
1. Auspiciousness (Overall Luck/Fortune)
2. Career (Professional success and reputation)
3. Love (Relationships and emotional fulfillment)
4. Supernatural abilities/capabilities (Intuition, spiritual depth, psychic potential)
5. Manifestation capability (Ability to bring desires into reality)
6. Presence of Mahapurusha Yogas or other material yogas.
`;

export async function getCouncilReviews(chartData: any) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    console.log('[LLM] OpenRouter API Key present:', !!apiKey);
    console.log('[LLM] OpenRouter API Key prefix:', apiKey?.substring(0, 15) + '...');

    if (!apiKey) {
        console.error('[LLM] ❌ OpenRouter API key is missing!');
        throw new Error('OpenRouter API key is missing');
    }

    const reviews = await Promise.all(
        COUNCIL_MEMBERS.map(async (member) => {
            console.log(`[LLM] Calling OpenRouter for ${member.name} using model: ${member.id}`);

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://astrologycouncil.app',
                    'X-Title': 'The Astrology Council',
                },
                body: JSON.stringify({
                    model: member.id,
                    messages: [
                        {
                            role: 'system',
                            content: `You are ${member.name}, an expert in ${member.role}. Focus on: ${member.specialty}.
              
YOUR TASK:
1. Review the provided Vedic Rasi chart data.
2. Provide a brief narrative summary highlighting the most important placements.
3. Score the following criteria on a scale of 1-10 using a simple list format (e.g., "Auspiciousness: 8/10"):
${SCORING_CRITERIA}

IMPORTANT: Do NOT use markdown tables. Use bullet points, numbered lists, or clear prose paragraphs for all output. Tables are difficult for humans to read.

Be concise, wise, and profound.`,
                        },
                        {
                            role: 'user',
                            content: `Vedic Birth Chart Data: ${JSON.stringify(chartData)}`,
                        },
                    ],
                }),
            });

            console.log(`[LLM] ${member.name} response status:`, response.status, response.statusText);

            const data = await response.json();

            if (data.error) {
                console.error(`[LLM] ❌ ${member.name} error:`, data.error);
                throw new Error(data.error.message);
            }

            console.log(`[LLM] ✅ ${member.name} responded successfully`);

            return {
                modelId: member.id,
                role: member.role,
                content: data.choices[0].message.content,
            };
        })
    );

    return reviews;
}

export async function getMasterSynthesis(reviews: ModelResponse[]) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    console.log('[LLM] Master Synthesis - Using model:', MASTER_MODEL);

    const prompt = `You are the Council President, a Master Vedic Astrologer. Review the collective wisdom of the 3 Council Members below. 
  
Each member has provided scores for: Auspiciousness, Career, Love, Supernatural, Manifestation, and Yogas.

YOUR TASK:
1. Synthesize their findings into a final, authoritative "Master Decree".
2. Present the final unified scores in a clean numbered list format (e.g., "1. Auspiciousness: 8/10 - brief explanation").
3. Speak directly to the native with eloquence and deep spiritual insight.

IMPORTANT: Do NOT use markdown tables (|---|---| format). Use bullet points, numbered lists, or clear prose paragraphs instead. Tables are difficult for humans to read.

Council Reviews:
${reviews.map(r => `--- ${r.role} (${r.modelId}) ---\n${r.content}`).join('\n\n')}

Final Decree:`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MASTER_MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        }),
    });

    console.log('[LLM] Master Synthesis response status:', response.status, response.statusText);

    const data = await response.json();

    if (data.error) {
        console.error('[LLM] ❌ Master Synthesis error:', data.error);
        throw new Error(data.error.message);
    }

    console.log('[LLM] ✅ Master Synthesis completed successfully');
    return data.choices[0].message.content;
}
