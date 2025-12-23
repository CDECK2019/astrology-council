export interface ModelResponse {
    modelId: string;
    role: string;
    content: string;
}

export interface PeerReview {
    reviewerId: string;
    reviewerName: string;
    rankings: string;
}

export const COUNCIL_MEMBERS = [
    {
        id: 'meta-llama/llama-3.1-405b-instruct',
        name: 'The Sage',
        role: 'Psychological and Spiritual Insights',
        specialty: 'Deeper psychological patterns and spiritual growth.',
    },
    {
        id: 'meta-llama/llama-3.1-70b-instruct',
        name: 'The Scholar',
        role: 'Classical Vedic Interpretation',
        specialty: 'Traditional yogas, dashas, and nakshatra analysis.',
    },
    {
        id: 'openai/gpt-4o-mini',
        name: 'The Architect',
        role: 'Practical Application and Timing',
        specialty: 'Career, finance, and practical life advice.',
    },
];

// Council President uses Gemini for high-quality synthesis
const MASTER_MODEL = 'nvidia/llama-3.1-nemotron-70b-instruct';

const SCORING_CRITERIA = `
1. Auspiciousness (Overall Luck/Fortune)
2. Career (Professional success and reputation)
3. Love (Relationships and emotional fulfillment)
4. Supernatural abilities/capabilities (Intuition, spiritual depth, psychic potential)
5. Manifestation capability (Ability to bring desires into reality)
6. Presence of Mahapurusha Yogas (Technical Check: Sasa, Ruchaka, Bhadra, Hamsa, Malavya)
`;

function formatChartDataForLLM(chartData: any): string {
    console.log("[LLM] Formatting chart data:", JSON.stringify(chartData, null, 2));
    if (!chartData || !chartData.houses) {
        console.error("[LLM] ❌ Invalid Chart Data structure in formatter");
        return "Invalid Chart Data";
    }

    let output = `**CHART SUMMARY**\nASCENDANT SIGN: ${chartData.houses[0].sign}\n\n**DETAILED POSITIONS**\nHouse, Sign, Planets\n`;
    const planetSentences: string[] = [];

    chartData.houses.forEach((h: any) => {
        const planets = h.planets && h.planets.length > 0
            ? h.planets.map((p: any) => p.name + (p.isRetro ? " (R)" : "")).join(", ")
            : "none";

        if (h.planets && h.planets.length > 0) {
            h.planets.forEach((p: any) => {
                planetSentences.push(`${p.name} is in ${h.sign} (House ${h.house})`);
            });
        }

        output += `${h.house}, ${h.sign}, ${planets}\n`;
    });

    output += `\n**EXPLICIT PLANET LIST (Use this for Yogas)**\n` + planetSentences.join('\n');

    return output;
}

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

** KNOWLEDGE CONTEXT: MAHAPURUSHA YOGAS **
                        You must strictly check for these 5 specific Yogas.A Yoga is present if the planet is ** Exalted ** OR in its ** Own Sign ** AND placed in a ** Kendra(Angular) House ** (1, 4, 7, 10).

1. ** Ruchaka Yoga ** (Mars):
                    - Signs: Aries(Own), Scorpio(Own), Capricorn(Exalted).
   - Must be in House 1, 4, 7, or 10.
2. ** Bhadra Yoga ** (Mercury):
                    - Signs: Gemini(Own), Virgo(Own / Exalted).
   - Must be in House 1, 4, 7, or 10.
3. ** Hamsa Yoga ** (Jupiter):
                    - Signs: Sagittarius(Own), Pisces(Own), Cancer(Exalted).
   - Must be in House 1, 4, 7, or 10.
4. ** Malavya Yoga ** (Venus):
                    - Signs: Taurus(Own), Libra(Own), Pisces(Exalted).
   - Must be in House 1, 4, 7, or 10.
5. ** Sasa Yoga ** (Saturn):
                    - Signs: Capricorn(Own), Aquarius(Own), Libra(Exalted).
   - Must be in House 1, 4, 7, or 10.

**KNOWLEDGE CONTEXT: PSYCHIC & SUPERNATURAL ABILITY**
To score "Supernatural abilities", look for these indicators:
1. **Ketu Influence (The Mystic):**
   - Ketu in 1st, 8th, or 12th House (+2 points).
   - Ketu conjunct Moon (+2 points).
2. **Water Element (Intuition):**
   - Ascendant or Moon in Cancer, Scorpio, or Pisces (+1.5 points each).
3. **Moksha Houses (Hidden Realms):**
   - Planets in 8th House (+1 point).
   - Planets in 12th House (+1 point).
   - Jupiter aspecting Moon/Asc (+1 point).
*Base Score: 1. Max Score: 10.*

**KNOWLEDGE CONTEXT: YOGA SCORING TIERS**
Score "Auspiciousness" based on the MAGNITUDE of Yogas, not just quantity.
- **TIER 1 (Great Man):** Any Mahapurusha Yoga (Sasa, Ruchaka, Bhadra, Hamsa, Malavya) = **+5 Points** (Minimum Score 8/10).
- **TIER 2 (Major):** Raja Yogas (Kendra+Trikona Lord connection), Dhana Yogas (Wealth), or Gaja Kesari (Jupiter in Kendra from Moon) = **+2 Points**.
- **TIER 3 (Common):** Budhaditya, Chandra-Mangala, Adhi Yoga = **+0.5 Points**.
*Base Score: 3. Max Score: 10.*

**KNOWLEDGE CONTEXT: CAREER (10th House)**
Score "Professional success" based on Authority and Karma.
- **Strength:** Planets in 10th House (+1 each). Lord of 10th in Kendra/Trikona (+2).
- **Amala Yoga:** Benefic (Jup, Ven, Mer) in 10th (+2).
- **Sun/Saturn:** Exalted or Own Sign (+1.5).
*Base Score: 3. Max Score: 10.*

**KNOWLEDGE CONTEXT: LOVE (7th House)**
Score "Relationships" based on Harmony vs. Discord.
- **Strength:** Benefics (Ven, Jup, Moon) in 7th (+1.5). Lord of 7th in Kendra/Trikona (+1.5).
- **Venus:** Exalted/Own (+2). Conjunct Mars (+1).
- **Penalty:** Malefics (Mars, Sat, Rahu) in 7th (-1). Venus Debilitated (-1.5).
*Base Score: 4. Max Score: 10.*

**KNOWLEDGE CONTEXT: MANIFESTATION (3rd & 11th House)**
Score "Ability to bring desires into reality" based on Willpower (3rd) and Gains (11th).
- **Gains:** Planets in 11th (+1 each). Lord of 11th Strong (+2).
- **Willpower:** Malefics (Mars, Sat, Rahu) in 3rd (+1.5). Lord of 3rd Strong (+1).
- **Mars:** Exalted/Own (+2).
*Base Score: 2. Max Score: 10.*

YOUR TASK:
                    1. Review the provided Vedic Rasi chart data.
2. ** CRITICAL FIRST STEP **: Perform a strict technical check for ** Mahapurusha Yogas** (Planets Exalted or in Own Sign in Kendra / Angular houses 1, 4, 7, 10).
   - If found, you MUST explicitly name them (e.g., "Sasa Yoga present due to Saturn Exalted in 1st House").
   - If not found, explicitly state "No Mahapurusha Yogas".
3. Provide a brief narrative summary highlighting the most important placements.
4. Score the following criteria on a scale of 1 - 10 using a simple list format (e.g., "Auspiciousness: 8/10"):
${SCORING_CRITERIA}

            IMPORTANT: Do NOT use markdown tables.Use bullet points, numbered lists, or clear prose paragraphs for all output.Tables are difficult for humans to read.

Be concise, wise, and profound.`,
                        },
                        {
                            role: 'user',
                            content: `Vedic Birth Chart Data: \n${formatChartDataForLLM(chartData)} `,
                        },

                    ],
                }),
            });

            console.log(`[LLM] ${member.name} response status: `, response.status, response.statusText);

            const data = await response.json();

            if (data.error) {
                console.error(`[LLM] ❌ ${member.name} error: `, data.error);
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

export async function getPeerRankings(reviews: ModelResponse[]) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Anonymize responses for the review
    const anonymizedReviews = reviews.map((r, i) => {
        const label = String.fromCharCode(65 + i); // A, B, C...
        return {
            label,
            content: r.content,
            originalModelId: r.modelId
        };
    });

    const reviewsText = anonymizedReviews.map(r =>
        `RESPONSE ${r.label}: \n${r.content} \n------------------- `
    ).join('\n\n');

    console.log('[LLM] Starting Peer Review Stage...');

    const peerReviews = await Promise.all(
        COUNCIL_MEMBERS.map(async (member) => {
            console.log(`[LLM] Peer Review - ${member.name} reviewing others...`);

            const prompt = `You are ${member.name}, an expert in ${member.role}.
            
You are acting as a Peer Reviewer for the Astrology Council. 
Below are anonymized responses from other Council Members regarding a native's chart.

YOUR TASK:
    1. Review each response critically.
2. For EACH response, answer: "Is this output >85% factually true based on Vedic principles?"(Yes / No and brief reason).
3. Provide a FINAL RANKING of the responses from Best to Worst based on accuracy, depth, and adherence to your specialty(${member.role
                }).

        FORMAT:
    - Use clear headings for each response critique.
- End with a section titled "FINAL RANKING:" listing the order(e.g., 1. Response B, 2. Response A...).

ANONYMIZED RESPONSES:
${reviewsText}
    `;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey} `,
                    'HTTP-Referer': 'https://astrologycouncil.app',
                    'X-Title': 'The Astrology Council',
                },
                body: JSON.stringify({
                    model: member.id,
                    messages: [{ role: 'user', content: prompt }],
                }),
            });

            const data = await response.json();

            if (data.error) {
                console.error(`[LLM] ❌ Peer Review error from ${member.name}: `, data.error);
                // Return a skeletal error response to utilize partial success if possible, 
                // or just log it. For now, throw to keep it simple or return error text.
                return {
                    reviewerId: member.id,
                    reviewerName: member.name,
                    rankings: "Error in peer review generation."
                };
            }

            return {
                reviewerId: member.id,
                reviewerName: member.name,
                rankings: data.choices[0].message.content
            };
        })
    );

    return peerReviews;
}

export async function getMasterSynthesis(reviews: ModelResponse[], peerReviews: PeerReview[]) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    console.log('[LLM] Master Synthesis - Using model:', MASTER_MODEL);

    const messages = [
        {
            role: 'system',
            content: `You are the Council President, a Master Vedic Astrologer. 
You are presiding over a Council of 3 expert astrologers.

        CONTEXT:
Three Council Members have provided their analysis of a birth chart.
        Then, they conducted a Peer Review, critiquing each other's accuracy and ranking the responses.

YOUR TASK:
    1. Synthesize the initial findings into a final, authoritative "Master Decree".
2. **HANDLING DISCREPANCIES**: 
   - If *ANY* Council Member identifies a Mahapurusha Yoga or Major Yoga, checks out the data yourself. If plausible, INCLUDE IT.
   - If consensus is split, side with the member who identified specific Yogas over those who found "nothing".
3. **SCORING**:
   - Scores must follow the "Magnitude > Quantity" philosophy. 
   - A single Mahapurusha Yoga automatically justifies an Auspiciousness score of 8/10 or higher.
   - Do not dilute the score just because *other* yogas are missing.
   - Mention the consensus of the council (e.g., "The Council unanimously agrees...", "Despite some debate regarding...").
4. Present the final unified scores in a clean numbered list format.
5. Speak directly to the native with eloquence and deep spiritual insight.

        IMPORTANT: Do NOT use markdown tables.Use bullet points or lists.`
        },
        {
            role: 'user',
            content: `ORIGINAL COUNCIL REVIEWS:
${reviews.map(r => `--- ${r.role} (${r.modelId}) ---\n${r.content}`).join('\n\n')}

PEER REVIEWS & RANKINGS:
${peerReviews.map(pr => `--- Review by ${pr.reviewerName} ---\n${pr.rankings}`).join('\n\n')}

Please deliver the Final Decree now.`
        }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey} `,
        },
        body: JSON.stringify({
            model: MASTER_MODEL,
            messages,
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
