
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

// TEST CASE: THE EMPEROR (Tier 1 + Tier 2 Yogas)
// Ascendant: Aries
// House 1 (Aries): Sun (Exalted). 
// House 4 (Cancer): Jupiter (Exalted) + Moon.
//    - Jupiter Exalted in Kendra (4th) = Hamsa Yoga (Tier 1, +5).
//    - Jupiter + Moon in Kendra = Gaja Kesari Yoga (Tier 2, +2).
//    - Sun Exalted in 1st (Raja Yoga effect).
// Expected Score: 8-10.

const emperorChart = {
    avgSpeed: 1,
    houses: [
        { house: 1, sign: "Aries", planets: [{ name: "Sun", isRetro: false }] },
        { house: 2, sign: "Taurus", planets: [] },
        { house: 3, sign: "Gemini", planets: [] },
        {
            house: 4, sign: "Cancer", planets: [
                { name: "Jupiter", isRetro: false },
                { name: "Moon", isRetro: false }
            ]
        },
        { house: 5, sign: "Leo", planets: [] },
        { house: 6, sign: "Virgo", planets: [] },
        { house: 7, sign: "Libra", planets: [] },
        { house: 8, sign: "Scorpio", planets: [] },
        { house: 9, sign: "Sagittarius", planets: [] },
        { house: 10, sign: "Capricorn", planets: [] },
        { house: 11, sign: "Aquarius", planets: [] },
        { house: 12, sign: "Pisces", planets: [] }
    ]
};

async function runTest() {
    console.log("👑 Starting Verification: Tiered Yoga Scoring (The Emperor Case)...");
    try {
        const reviews = await getCouncilReviews(emperorChart);

        reviews.forEach(review => {
            console.log(`\n\n--- Model: ${review.modelId} ---`);
            // Look for Auspiciousness score
            const scoreMatch = review.content.match(/Auspiciousness.*?:.*?(\d+)(?:\/10)?/i);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : "N/A";

            console.log(`Auspiciousness Score: ${score}/10`);
            console.log(`Mentions Hamsa? ${/Hamsa/i.test(review.content) ? "YES" : "NO"}`);
            // Gaja Kesari might be spelled variously, check broadly
            console.log(`Mentions Gaja Kesari? ${/Gaja|Kesari/i.test(review.content) ? "YES" : "NO"}`);

            if (typeof score === 'number' && score >= 8) {
                console.log("✅ PASS: High Tier 1 Score recognized.");
            } else {
                console.log("⚠️ FAIL/WARN: Score lower than expected (Target: 8-10).");
            }
        });

    } catch (e) { console.error(e); }
}

runTest();
