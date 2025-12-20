export interface ModelResponse {
    modelId: string;
    role: string;
    content: string;
}

export const COUNCIL_MEMBERS = [
    {
        id: 'openai/gpt-4o-mini',
        name: 'The Sage of Wisdom',
        role: 'Psychological and Spiritual Insights',
        specialty: 'Deeper psychological patterns and spiritual growth.',
    },
    {
        id: 'openai/gpt-4o-mini',
        name: 'The Scholar of Tradition',
        role: 'Classical Vedic Interpretation',
        specialty: 'Traditional yogas, dashas, and nakshatra analysis.',
    },
    {
        id: 'openai/gpt-4o',
        name: 'The Architect of Life',
        role: 'Practical Application and Timing',
        specialty: 'Career, finance, and practical life advice.',
    },
];

const MASTER_MODEL = 'openai/gpt-4o-mini';

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

    if (!apiKey) {
        throw new Error('OpenRouter API key is missing');
    }

    const reviews = await Promise.all(
        COUNCIL_MEMBERS.map(async (member) => {
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
2. Summarize the chart in a simple Markdown table.
3. Score the following criteria on a scale of 1-10:
${SCORING_CRITERIA}

Be concise, wise, and profound.`,
                        },
                        {
                            role: 'user',
                            content: `Vedic Birth Chart Data: ${JSON.stringify(chartData)}`,
                        },
                    ],
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

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

    const prompt = `You are the Council President, a Master Vedic Astrologer. Review the collective wisdom of the 3 Council Members below. 
  
Each member has provided scores and a table for: Auspiciousness, Career, Love, Supernatural, Manifestation, and Yogas.

YOUR TASK:
1. Synthesize their findings into a final, authoritative "Master Decree".
2. Provide a unified summary table of the scores (calculate an average if they differ, or choice the most insightful).
3. Speak directly to the native with eloquence and deep spiritual insight.

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

    const data = await response.json();
    return data.choices[0].message.content;
}
