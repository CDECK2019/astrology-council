export interface EvaluationResult {
    score: number; // 1-10
    reasoning: string; // Brief explanation of the score
    keyFindings: string[]; // Bullet points of main astrological factors
}

export interface YogaEvaluationResult extends EvaluationResult {
    yogaCount: number; // Specific count for Mahapurusha Yogas
    yogasIdentified: string[]; // Names of verified yogas (e.g. "Ruchaka Yoga")
}

export interface ChartData {
    houses: {
        house: number;
        sign: string;
        planets: {
            name: string;
            isRetro: boolean;
            speed?: number;
        }[];
    }[];
}

export interface CouncilReport {
    auspiciousness: YogaEvaluationResult;
    career: EvaluationResult;
    manifestation: EvaluationResult;
    love: EvaluationResult;
    spiritual: EvaluationResult;
    synthesis?: string; // The final Master Decree narrative
}
