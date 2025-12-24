
export interface Planet {
    name: string;
    isRetro: boolean;
}

export interface House {
    house: number;
    sign: string;
    planets: Planet[];
}

export interface ChartData {
    ascendantSign: string;
    houses: House[];
}

export interface EvaluationResult {
    score: number;
    reasoning: string;
    keyFindings: string[];
}

export interface YogaEvaluationResult extends EvaluationResult {
    yogaCount: number;
    yogasIdentified: string[];
}

export interface CareerEvaluationResult extends EvaluationResult { }
export interface LoveEvaluationResult extends EvaluationResult { }
export interface ManifestationEvaluationResult extends EvaluationResult { }
export interface SupernaturalEvaluationResult extends EvaluationResult { }

export interface CouncilReport {
    auspiciousness: YogaEvaluationResult;
    career: EvaluationResult;
    manifestation: EvaluationResult;
    love: EvaluationResult;
    supernatural: EvaluationResult;
    synthesis: string;
}

export const COUNCIL_MEMBERS = [
    {
        id: 'yoga-evaluator',
        name: 'The Lawyer',
        role: 'Auspiciousness & Yogas',
        specialty: 'Strict Logic & Rules',
    },
    {
        id: 'career-evaluator',
        name: 'The Executive',
        role: 'Career & Status',
        specialty: 'Real World Authority',
    },
    {
        id: 'manifestation-evaluator',
        name: 'The Architect',
        role: 'Manifestation & Gains',
        specialty: 'Willpower & Action',
    },
    {
        id: 'love-evaluator',
        name: 'The Matchmaker',
        role: 'Love & Relationships',
        specialty: 'Emotional Harmony',
    },
    {
        id: 'spiritual-evaluator',
        name: 'The Mystic',
        role: 'Spirituality & Moksha',
        specialty: 'Deep Wisdom & Intuition',
    },
];
