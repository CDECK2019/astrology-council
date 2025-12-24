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
6. Mahapurusha Yoga Count (Integer 0-5)
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

            try {
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

** REFERENCE TABLE: PLANETARY DIGNITIES (ABSOLUTE TRUTH) **
Use this table to VALIDATE all Yoga claims. Do NOT deviate.
| Planet  | Own Sign(s)          | Exalted Sign    |
|---------|----------------------|-----------------|
| Mars    | Aries, Scorpio       | Capricorn       |
| Mercury | Gemini, Virgo        | Virgo           |
| Jupiter | Sagittarius, Pisces  | Cancer          |
| Venus   | Taurus, Libra        | Pisces          |
| Saturn  | Capricorn, Aquarius  | Libra           |
| Sun     | Leo                  | Aries           |
| Moon    | Cancer               | Taurus          |

** KNOWLEDGE CONTEXT: MAHAPURUSHA YOGAS **
You must strictly check for these 5 specific Yogas. A Yoga is present if and only if:
1. The Planet is in a **Kendra (Angular) House** (1, 4, 7, 10).
2. AND The Planet is in its **Own** or **Exalted** Sign (See Table above).

** WARNING: COMMON HALLUCINATIONS **
- Saturn in Gemini/Virgo is NOT Sasa Yoga (Friendly, but not Own/Exalted).
- Mars in Leo is NOT Ruchaka Yoga.
- Jupiter in Leo/Scorpio is NOT Hamsa Yoga.
- Moon in Kendra is NOT Mahapurusha Yoga (e.g., Malavya is VENUS only).

1. ** Ruchaka Yoga ** (Mars ONLY):
                    - Signs: Aries(Own), Scorpio(Own), Capricorn(Exalted).
   - Must be in House 1, 4, 7, or 10.
   - **CRITICAL**: SUN in Aries is NOT Ruchaka Yoga. Sun is Exalted but NOT Mahapurusha.
2. ** Bhadra Yoga ** (Mercury ONLY):
                    - Signs: Gemini(Own), Virgo(Own / Exalted).
   - Must be in House 1, 4, 7, or 10.
3. ** Hamsa Yoga ** (Jupiter ONLY):
                    - Signs: Sagittarius(Own), Pisces(Own), Cancer(Exalted).
   - Must be in House 1, 4, 7, or 10.
4. ** Malavya Yoga ** (Venus ONLY):
                    - Signs: Taurus(Own), Libra(Own), Pisces(Exalted).
   - Must be in House 1, 4, 7, or 10.
   - **CRITICAL**: MOON does not form this Yoga (or any Mahapurusha Yoga).
5. ** Sasa Yoga ** (Saturn):
                    - Signs: Capricorn(Own), Aquarius(Own), Libra(Exalted).
   - Must be in House 1, 4, 7, or 10.

**KNOWLEDGE CONTEXT: WEALTH & POWER YOGAS (SUPPLEMENTAL)**
Look for these specific combinations to boost the Auspiciousness score:
1. **Lakshmi Yoga** (Tier 2):
   - 9th Lord in Own/Exaltation sign AND placed in Kendra (1,4,7,10) or Trikona (1,5,9).
   - Lagna Lord must be strong (Kendra/Trikona/Own/Exalted).
   - Bonus: +2 to +3 points (Full +3 if both lords Exalted/Own).
2. **Viparita Raja Yoga** (Tier 2):
   - Lords of Dusthana (6,8,12) placed in OTHER Dusthana houses (e.g., 6th lord in 8th/12th).
   - Main types: Harsha, Sarala, Vimala. 
   - Bonus: +2 to +3 points (Unexpected rise).
3. **Parvata Yoga** (Tier 2):
   - Benefics in Kendras (1,4,7,10) AND 6th/8th houses empty or occupied by benefics.
   - Bonus: +2 to +3 points (Enduring status).
4. **Vasumati Yoga** (Tier 3 - Special):
   - Benefics (Jupiter, Venus, Mercury) in Upachaya houses (3,6,10,11).
   - Bonus: +0.5 per benefic (Max +1.5).
5. **Kahal Yoga** (Tier 3):
   - 4th Lord and 9th Lord in mutual Kendras; OR 4th Lord Exalted/Own aspected by 10th Lord.
   - Bonus: +1 point (Courage/Authority).

**KNOWLEDGE CONTEXT: MANIFESTATION YOGAS (SUPPLEMENTAL)**
Look for these combinations to boost the "Manifestation capability" score:
1. **Shakti Yoga** (Manifestation):
   - Mars (or Malefics) strong in 3rd House; OR Mars Exalted/Own aspecting 11th House.
   - Bonus: +1.5 to +2 points (Full +2 if Mars Exalted + 3rd House involvement).
2. **Saraswati Yoga** (Manifestation/Intellect):
   - Jupiter, Venus, Mercury in Kendra/Trikona or Strong (Exalted/Own).
   - Bonus: +1.5 to +2 points (Creation through wisdom/arts).

**KNOWLEDGE CONTEXT: PSYCHIC & SUPERNATURAL YOGAS (SUPPLEMENTAL)**
Look for these combinations to boost the "Supernatural abilities" score:
1. **Kala Sarpa Yoga** (Spiritual Variant):
   - All planets hemmed between Rahu and Ketu axis. Ketu in Moksha houses (4,8,12) enhances spiritual potential.
   - Bonus: +1 to +2 points (Higher for Moksha/8th/12th axis).
2. **Guru-Ketu Yoga** (Mystical):
   - Jupiter conjunct or aspecting Ketu; or in same Nakshatra.
   - Bonus: +1.5 to +2.5 points (Past-life wisdom).
3. **Chandra-Rahu/Ketu Yoga** (Node-Moon):
   - Moon conjunct or aspecting Rahu (intuition) or Ketu (psychic insight).
   - Bonus: +1 to +2 points.

**KNOWLEDGE CONTEXT: PSYCHIC & SUPERNATURAL ABILITY**
To score "Supernatural abilities", look for these indicators:
1. **Ketu Influence (The Mystic):**
   - Ketu in 1st, 8th, or 12th House (+2 points).
   - Ketu conjunct Moon (+2 points).
2. **Water Element (Intuition):**
   - Ascendant or Moon in Cancer, Scorpio, or Pisces (+1.5 points each).
3. **Moksha Houses (Hidden Realms):**
   - Planets in 12th House (+1 point).
   - Jupiter aspecting Moon/Asc (+1 point).
4. **Specific Yogas (Cumulative Bonuses):**
   - **Guru-Ketu Yoga:** +1.5 to +2.5.
   - **Kala Sarpa Yoga (Spiritual):** +1 to +2.
   - **Chandra-Rahu/Ketu:** +1 to +2.
   - **Penalty:** Moon severely afflicted (combust/debilitated without cancellation) (-1).
*Base Score: 1. Max Score: 10.*

**KNOWLEDGE CONTEXT: YOGA SCORING TIERS**
Score "Auspiciousness" based on the MAGNITUDE of Yogas.
- **Base Score:** 3. **Max Score:** 10.
- **TIER 1 (Great Man):** Mahapurusha Yogas (Sasa, Ruchaka, Bhadra, Hamsa, Malavya) = **+5 Points** (Min Total 8/10).
- **TIER 2 (Major):** Lakshmi, Viparita Raja, Parvata, Raja/Dhana Yogas = **+2 to +3 Points**.
- **TIER 3 (Common/Supportive):** Kahal (+1), Vasumati (scaled +0.5 to +1.5), Budhaditya/Adhi (+0.5).
- **CRITICAL CONDITION:** Planets must NOT be severely afflicted (combustion or debilitation without cancellation) to award full points.

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
   - **Shakti Yoga:** +1.5 to +2.
   - **Saraswati Yoga:** +1.5 to +2.
   - **Mars:** Exalted/Own (+2).
   - **Penalty:** Mars weak/afflicted (-1).

*Base Score: 2. Max Score: 10.*

YOUR TASK:
                    1. Review the provided Vedic Rasi chart data.
1. ** LIST KENDRA PLANETS **: First, list every planet in Houses 1, 4, 7, 10.
2. ** VERIFY DIGNITY **: For each Kendra planet, check the Reference Table. Is it in Own or Exalted Sign?
   - If YES -> Declare the Mahapurusha Yoga.
   - If NO -> Explicitly state "No [Yoga Name]".
3. ** SECONDARY CHECK **: Identify any **Wealth, Power, Manifestation, or Supernatural Yogas** defined in the context (Lakshmi, Shakti, etc.).
   - Explicitly name them if the criteria are met.
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

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();

                if (data.error) {
                    console.error(`[LLM] ❌ ${member.name} error: `, data.error);
                    throw new Error(data.error.message);
                }

                const content = data.choices?.[0]?.message?.content;

                if (!content || content.trim().length === 0) {
                    console.warn(`[LLM] ⚠️ ${member.name} returned empty content.`);
                    return {
                        modelId: member.id,
                        role: member.role,
                        content: `${member.name} is currently in deep meditation and could not provide a verbal response. (Review Unavailable)`,
                    };
                }

                console.log(`[LLM] ✅ ${member.name} responded successfully`);

                return {
                    modelId: member.id,
                    role: member.role,
                    content: content,
                };

            } catch (error: any) {
                console.error(`[LLM] 💥 Exception calling ${member.name}:`, error.message);
                // Return a graceful error placeholder so Promise.all doesn't fail globally
                return {
                    modelId: member.id,
                    role: member.role,
                    content: `${member.name} encountered a cosmic disturbance and could not complete the analysis. (Error: ${error.message})`,
                };
            }
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
3. Provide a FINAL RANKING of the responses from Best to Worst based on accuracy, depth, and adherence to your specialty(${member.role}).

** VERIFICATION STEP **:
Before ranking, CROSS-REFERENCE every Yoga claim with the Planetary Dignities Table.
- If a response claims "Saturn in Gemini is Sasa Yoga", check the table. Is Gemini Own/Exalted for Saturn? NO. -> Mark as Factual Error.
- If a response misses a clear Yoga (e.g., Jupiter in Pisces in Kendra), mark as Factual Error.

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
2. **HANDLING DISCREPANCIES & VERIFICATION**: 
   - **MANDATORY CHECK**: If a Member identifies a Yoga, you MUST verifying it against the **Planetary Dignities Table** (Internal Knowledge).
   - **Example**: Member says "Sasa Yoga (Saturn in Gemini)". You check: Saturn Own=Cap/Aqu, Exalted=Lib. Gemini is NOT matching. -> REJECT IT.
   - **Example**: Member says "Hamsa Yoga (Jupiter in Pisces)". You check: Jupiter Own=Sag/Pis. Match! -> ACCEPT IT.
   - If consensus is split, side with the **Technically Correct** analysis based on this check, not just the majority.
3. **SCORING**:
   - **CRITICAL SCORING RULE**: If verified **Mahapurusha Yoga Count >= 1**, you **MUST** award an **Auspiciousness Score of 8/10 or higher**.
   - **ABSOLUTELY FORBIDDEN**: Do NOT output 7/10 or lower if a Mahapurusha Yoga is present.
   - **Do NOT** "adjust" or "average down" for missing yogas. A Mahapurusha Yoga is a TRUMP CARD.
   - **Example**: Bhadra Yoga verifying = Score 8/10 (Minimum).
   - **Failure to follow this rule is a failure of analysis.**
   - Mention the consensus of the council (e.g., "The Council unanimously agrees...", "Despite some debate regarding...").
4. Present the final unified scores in a clean numbered list format.
   - **CRITICAL**: For 'Mahapurusha Yoga Count', output ONLY the integer count (e.g., "2" or "2/5"). Do NOT add bonus points here. This is a technical checksum.
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
