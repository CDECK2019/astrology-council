// Native https is used below.
// const fetch = require('node-fetch');

// If running in an environment without native fetch (older Node), uncomment line above if you have node-fetch installed.
// However, the user is on Mac and likely has a recent Node version. I'll use native fetch.
// If native fetch fails, I'll fallback or ask for 'node-fetch'.
// But for this standalone script, let's assume native 'fetch' is available or use https.

const https = require('https');

const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
    console.error("❌ Error: OPENROUTER_API_KEY environment variable is not set.");
    process.exit(1);
}

const MODELS = [
    // --- Current Council ---
    "mistralai/mistral-7b-instruct",
    "qwen/qwen-2.5-7b-instruct",
    "meta-llama/llama-3.1-8b-instruct",

    // --- High Intelligence ---
    "google/gemini-pro-1.5",
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o",
    "meta-llama/llama-3.1-405b-instruct",

    // --- Mid/Economy ---
    "google/gemini-flash-1.5",
    "openai/gpt-4o-mini",
    "deepseek/deepseek-chat",
    "microsoft/wizardlm-2-8x22b",

    // --- Others / Experimental ---
    "mistralai/mixtral-8x7b-instruct",
    "nousresearch/hermes-3-llama-3.1-405b",
    "phind/phind-codellama-34b",
    "openchat/openchat-7",
    "x-ai/grok-2-1212",
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "cohere/command-r-plus-08-2024"
];

const CHART_DATA = `1, Libra, Ascendant Saturn
2, Scorpio, ketu and Jupiter
3, Sagitarius, none
4, Capricorn, none
5, Aquarius, none
6, Pisces, none
7, Aries, none
8, Taurus, Rahu
9, Gemini, none
10, Cancer, Mars
11, Leo, Venus and Sun
12, Virgo, Moon, Mercury`;

const PROMPT = `According to vedic astrology concepts; does the rasi chart table contain any Mahapurusha Yogas? If no, why not. If yes, which yogas?

The information below is formatted by house number, astrological sign and planetary activity in the house number.

${CHART_DATA}`;

async function queryModel(model) {
    return new Promise((resolve) => {
        const req = https.request('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': 'https://astrologycouncil.app', // Optional
                'X-Title': 'Astrology Benchmark', // Optional
            },
            timeout: 25000 // 25s timeout
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    resolve({ model, error: `Status ${res.statusCode}: ${data.substring(0, 50)}...` });
                    return;
                }
                try {
                    const json = JSON.parse(data);
                    const content = json.choices?.[0]?.message?.content || "No content returned";
                    resolve({ model, response: content });
                } catch (e) {
                    resolve({ model, error: "JSON Parse Error" });
                }
            });
        });

        req.on('error', (e) => resolve({ model, error: e.message }));
        req.on('timeout', () => {
            req.destroy();
            resolve({ model, error: "Timeout" });
        });

        req.write(JSON.stringify({
            model: model,
            messages: [
                { role: "system", content: "You are an expert Vedic Astrologer." },
                { role: "user", content: PROMPT }
            ]
        }));
        req.end();
    });
}

async function runBenchmark() {
    console.log(`🚀 Starting Benchmark on ${MODELS.length} models...`);
    console.log("---------------------------------------------------");

    // Run in parallel chunks of 5 to avoid rapid rate limits but keep it fast
    const results = [];
    const chunkSize = 5;

    for (let i = 0; i < MODELS.length; i += chunkSize) {
        const chunk = MODELS.slice(i, i + chunkSize);
        console.log(`Processing batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(MODELS.length / chunkSize)}...`);
        const promises = chunk.map(m => queryModel(m));
        const chunkResults = await Promise.all(promises);
        results.push(...chunkResults);
    }

    console.log("\n\n=== BENCHMARK RESULTS ===\n");
    console.log("| Model | Detected Yogas | Response Snippet |");
    console.log("|---|---|---|");

    results.forEach(r => {
        if (r.error) {
            console.log(`| ${r.model} | ❌ Error | ${r.error} |`);
        } else {
            // Simple heuristic to detect if they found it
            const content = r.response.toLowerCase();
            let detection = "No";
            if (content.includes("sasa") || content.includes("shasha")) detection = "✅ SASA";
            if (content.includes("ruchaka") || content.includes("mars")) detection += " / ❓ Ruchaka?";

            // Clean snippet
            const snippet = r.response.replace(/\n/g, " ").substring(0, 150) + "...";
            console.log(`| ${r.model} | ${detection} | ${snippet} |`);
        }
    });
    console.log("\n=========================\n");
}

runBenchmark();
