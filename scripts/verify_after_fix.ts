
import fs from 'fs';
import path from 'path';
import { getCouncilReviews } from '../lib/llm';

// Load env vars manually since we are running a standalone script
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
} catch (e) {
    console.error("Error loading .env.local", e);
}

// Test Data: Sasa Yoga (Saturn Exalted in House 1)
// Ascendant: Libra (Sign 7)
// House 1: Libra + Saturn
const sasaYogaChart = {
    avgSpeed: 1,
    houses: [
        { house: 1, sign: "Libra", planets: [{ name: "Saturn", isRetro: false }] },
        { house: 2, sign: "Scorpio", planets: [] },
        { house: 3, sign: "Sagittarius", planets: [] },
        { house: 4, sign: "Capricorn", planets: [] },
        { house: 5, sign: "Aquarius", planets: [] },
        { house: 6, sign: "Pisces", planets: [] },
        { house: 7, sign: "Aries", planets: [] },
        { house: 8, sign: "Taurus", planets: [] },
        { house: 9, sign: "Gemini", planets: [] },
        { house: 10, sign: "Cancer", planets: [] },
        { house: 11, sign: "Leo", planets: [] },
        { house: 12, sign: "Virgo", planets: [] }
    ]
};

async function runTest() {
    console.log("Starting Verification Test for Mahapurusha Yoga (Sasa Yoga prediction)...");

    try {
        const reviews = await getCouncilReviews(sasaYogaChart);

        console.log("\n--- Reviews Received ---\n");

        let successCount = 0;

        reviews.forEach(review => {
            console.log(`\nModel: ${review.modelId} (${review.role})`);
            console.log("------------------------------------------");

            const content = review.content;
            const hasSasa = /Sasa Yoga/i.test(content);
            const hasLibra = /Libra/i.test(content);
            const hasSaturn = /Saturn/i.test(content);

            console.log(`Mentioned Sasa Yoga: ${hasSasa ? "✅ YES" : "❌ NO"}`);
            // console.log(`Snippet: ${content.substring(0, 200)}...`); 

            if (hasSasa) successCount++;
        });

        console.log(`\n\nSUMMARY: ${successCount}/${reviews.length} models detected Sasa Yoga.`);

        if (successCount === reviews.length) {
            console.log("✅ VERIFICATION PASSED: All models detected the yoga.");
        } else if (successCount > 0) {
            console.log("⚠️ VERIFICATION PARTIAL: Some models failed.");
        } else {
            console.log("❌ VERIFICATION FAILED: No models detected the yoga.");
        }

    } catch (error) {
        console.error("Test Failed with Error:", error);
    }
}

runTest();
