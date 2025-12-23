
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

// ----------------------------------------------------
// TEST CASE 1: THE CEO (Career)
// Sun in Aries (Exalted) in 10th. (+1 Planet, +1.5 Sun Strength).
// Mars in Aries (Own) in 10th. (Ruchaka +1 Planet, +1.5 Mars Strength - wait, Ruchaka is Tier 1 +5).
// Expected Career Score: ~9-10.
// ----------------------------------------------------
const ceoChart = {
    avgSpeed: 1,
    houses: [
        { house: 1, sign: "Cancer", planets: [] }, // Asc
        { house: 2, sign: "Leo", planets: [] },
        { house: 3, sign: "Virgo", planets: [] },
        { house: 4, sign: "Libra", planets: [] },
        { house: 5, sign: "Scorpio", planets: [] },
        { house: 6, sign: "Sagittarius", planets: [] },
        { house: 7, sign: "Capricorn", planets: [] },
        { house: 8, sign: "Aquarius", planets: [] },
        { house: 9, sign: "Pisces", planets: [] },
        {
            house: 10, sign: "Aries", planets: [
                { name: "Sun", isRetro: false },
                { name: "Mars", isRetro: false }
            ]
        },
        { house: 11, sign: "Taurus", planets: [] },
        { house: 12, sign: "Gemini", planets: [] }
    ]
};

// ----------------------------------------------------
// TEST CASE 2: THE ROMANTIC (Love)
// Asc: Virgo.
// House 7 (Pisces): Venus (Exalted). (+1.5 Benefic in 7th, +2 Venus Exalted).
// House 11 (Cancer): Jupiter (Exalted) Aspecting 7th. (+1 Aspect).
// Expected Love Score: ~9-10.
// ----------------------------------------------------
const romanticChart = {
    avgSpeed: 1,
    houses: [
        { house: 1, sign: "Virgo", planets: [] }, // Asc
        { house: 2, sign: "Libra", planets: [] },
        { house: 3, sign: "Scorpio", planets: [] },
        { house: 4, sign: "Sagittarius", planets: [] },
        { house: 5, sign: "Capricorn", planets: [] },
        { house: 6, sign: "Aquarius", planets: [] },
        { house: 7, sign: "Pisces", planets: [{ name: "Venus", isRetro: false }] },
        { house: 8, sign: "Aries", planets: [] },
        { house: 9, sign: "Taurus", planets: [] },
        { house: 10, sign: "Gemini", planets: [] },
        { house: 11, sign: "Cancer", planets: [{ name: "Jupiter", isRetro: false }] }, // Aspects 7th (5th, 7th, 9th glance) - wait, Jup aspects 5, 7, 9 houses away. From 11, aspects 3, 5, 7. House 11 -> 7 is 9 houses away. Yes.
        { house: 12, sign: "Leo", planets: [] }
    ]
};

// ----------------------------------------------------
// TEST CASE 3: THE MANIFESTER (Manifestation)
// Asc: Libra.
// House 3 (Sagittarius): Rahu (Malefic in 3rd). (+1.5).
// House 11 (Leo): Sun (Own) + Mars. (+2 Sun 11th Lord, +1 Planet, +1 Planet, +2 Mars Exalted? No Mars in Leo is friend).
// Let's refine for max score: 
// Asc: Libra. 
// House 3 (Sagittarius): Rahu. (+1.5).
// House 11 (Leo): Sun. (Lord of 11th in 11th - Own Sign). (+2).
// Expected Manifestation Score: ~8-10.
// ----------------------------------------------------
const manifesterChart = {
    avgSpeed: 1,
    houses: [
        { house: 1, sign: "Libra", planets: [] }, // Asc
        { house: 2, sign: "Scorpio", planets: [] },
        { house: 3, sign: "Sagittarius", planets: [{ name: "Rahu", isRetro: true }] },
        { house: 4, sign: "Capricorn", planets: [] },
        { house: 5, sign: "Aquarius", planets: [] },
        { house: 6, sign: "Pisces", planets: [] },
        { house: 7, sign: "Aries", planets: [] },
        { house: 8, sign: "Taurus", planets: [] },
        { house: 9, sign: "Gemini", planets: [] },
        { house: 10, sign: "Cancer", planets: [] },
        { house: 11, sign: "Leo", planets: [{ name: "Sun", isRetro: false }] },
        { house: 12, sign: "Virgo", planets: [] }
    ]
};

async function runTests() {
    console.log("🚀 Starting Comprehensive Verification...");

    // Test 1: Career
    console.log("\n👔 Testing Career Score (The CEO)...");
    const ceoReviews = await getCouncilReviews(ceoChart);
    analyzeScore(ceoReviews, "Career");

    // Test 2: Love
    console.log("\n❤️ Testing Love Score (The Romantic)...");
    const loveReviews = await getCouncilReviews(romanticChart);
    analyzeScore(loveReviews, "Love");

    // Test 3: Manifestation
    console.log("\n✨ Testing Manifestation Score (The Manifester)...");
    const manReviews = await getCouncilReviews(manifesterChart);
    analyzeScore(manReviews, "Manifestation");
}

function analyzeScore(reviews: any[], category: string) {
    reviews.forEach(review => {
        // Regex to find score for specific category
        // Matches "Career: 8/10" or "Career (Professional success...): 8"
        const regex = new RegExp(`${category}.*?:.*?(\\d+)(?:\\/10)?`, "i");
        const scoreMatch = review.content.match(regex);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : "N/A";

        console.log(`[${review.modelId}] ${category} Score: ${score}/10`);

        if (typeof score === 'number' && score >= 8) {
            console.log(`✅ PASS: High ${category} Score.`);
        } else {
            console.log(`⚠️ WARN: Check Logic.`);
        }
    });
}

runTests();
