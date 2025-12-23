
import fs from 'fs';
import path from 'path';
import { getCouncilReviews } from '../lib/llm';

// Load env vars
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                process.env[match[1].trim()] = match[2].trim().replace(/^"(.*)"$/, '$1');
            }
        });
    }
} catch (e) { console.error(e); }

// TEST CASE: THE SEER (Psychic)
// Ascendant: Scorpio (Water) -> +1.5
// House 8 (Gemini): Moon + Ketu
//    - Planet in 8th -> +1
//    - Ketu in 8th -> +2
//    - Ketu conjunct Moon -> +2
//    - Water Moon (Scorpio)? No, Moon is in Gemini here, wait.
//    - Let's make Moon in Scorpio (House 1) for max points testing?
//    - User Scenario: Asc Scorpio. House 8 (Gemini) with Moon + Ketu. 
//      Wait, if Asc is Scorpio (8), then House 8 is Gemini (3)? No.
//      Asc Scorpio (8). House 1=Scorpio. House 8=Gemini.
//      Let's stick to the Design Doc:
//      Asc: Scorpio (+1.5). 
//      House 8 (Gemini): Moon + Ketu. (+1 Planet in 8th, +2 Ketu in 8th, +2 Ketu Conjunct Moon).
//      House 12 (Libra): Jupiter. (+1 Planet in 12th).
//      Total: 1 (Base) + 1.5 + 1 + 2 + 2 + 1 = 8.5. 

// Chart Data Construction
const seerChart = {
    avgSpeed: 1,
    houses: [
        { house: 1, sign: "Scorpio", planets: [] }, // Ascendant
        { house: 2, sign: "Sagittarius", planets: [] },
        { house: 3, sign: "Capricorn", planets: [] },
        { house: 4, sign: "Aquarius", planets: [] },
        { house: 5, sign: "Pisces", planets: [] },
        { house: 6, sign: "Aries", planets: [] },
        { house: 7, sign: "Taurus", planets: [] },
        {
            house: 8, sign: "Gemini", planets: [
                { name: "Moon", isRetro: false },
                { name: "Ketu", isRetro: true }
            ]
        },
        { house: 9, sign: "Cancer", planets: [] },
        { house: 10, sign: "Leo", planets: [] },
        { house: 11, sign: "Virgo", planets: [] },
        { house: 12, sign: "Libra", planets: [{ name: "Jupiter", isRetro: false }] }
    ]
};

async function runTest() {
    console.log("🔮 Starting Verification: Psychic/Supernatural Scoring (The Seer Case)...");
    try {
        const reviews = await getCouncilReviews(seerChart);

        // Output Analysis
        reviews.forEach(review => {
            console.log(`\n\n--- Model: ${review.modelId} ---`);
            // Extract the list part of the response usually at the end
            const scoreMatch = review.content.match(/Supernatural.*?:.*?(\d+)(?:\/10)?/i);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : "N/A";

            console.log(`Psychic Score: ${score}/10`);
            console.log(`Mentions Ketu/8th House? ${/Ketu|8th House|Occult/i.test(review.content) ? "YES" : "NO"}`);

            if (typeof score === 'number' && score >= 7) {
                console.log("✅ PASS: High Psychic Score recognized.");
            } else {
                console.log("⚠️ FAIL/WARN: Score lower than expected (Target: ~8-9).");
            }
        });

    } catch (e) { console.error(e); }
}

runTest();
