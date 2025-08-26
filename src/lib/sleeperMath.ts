// Simplified Math Model for Sleeper Fantasy Football Analysis
// Focuses on roster composition and positional needs

export interface SleeperPlayer {
  sleeper_player_id: string;
  player_name: string;
  position: string;
  nfl_team?: string;
  score?: number;
  reasoning?: string;
}

export interface AnalysisWeights {
  rosterBalance: number; // 0-100: 0=prioritize holes, 100=best available
  risk: number; // 0-100: 0=safe floor, 100=high ceiling
}

/**
 * Analyze roster composition by position
 */
export const analyzeRosterComposition = (roster: SleeperPlayer[]) => {
  const composition = {
    QB: roster.filter(p => p.position === 'QB').length,
    RB: roster.filter(p => p.position === 'RB').length,
    WR: roster.filter(p => p.position === 'WR').length,
    TE: roster.filter(p => p.position === 'TE').length,
    K: roster.filter(p => p.position === 'K').length,
    DEF: roster.filter(p => p.position === 'DEF').length,
  };

  // Identify needs based on typical roster construction
  const needs = {
    QB: composition.QB < 2,
    RB: composition.RB < 4, 
    WR: composition.WR < 5,
    TE: composition.TE < 2,
    K: composition.K < 1,
    DEF: composition.DEF < 1,
  };

  return { composition, needs };
};

/**
 * Calculate player recommendation score
 */
export const calculatePlayerScore = (
  player: SleeperPlayer,
  rosterAnalysis: any,
  weights: AnalysisWeights
): number => {
  let score = 50; // Base score

  // Position need multiplier
  const hasPositionNeed = rosterAnalysis.needs[player.position as keyof typeof rosterAnalysis.needs];
  
  if (hasPositionNeed && weights.rosterBalance < 50) {
    score += 25; // Boost for filling roster holes
  }
  
  if (!hasPositionNeed && weights.rosterBalance > 50) {
    score += 15; // Boost for best available when no needs
  }

  // Add position-specific scoring
  switch (player.position) {
    case 'QB':
      score += 10; // QBs are valuable
      break;
    case 'RB':
      score += 15; // RBs are premium
      break;
    case 'WR':
      score += 12; // WRs have good value
      break;
    case 'TE':
      score += 8; // TEs have moderate value
      break;
  }

  // Add some variance for realistic scoring
  const variance = (Math.random() - 0.5) * 20;
  score += variance;

  return Math.max(10, Math.min(100, Math.round(score)));
};

/**
 * Generate simple recommendation reasons
 */
export const generateRecommendationReason = (
  player: SleeperPlayer,
  rosterAnalysis: any,
  weights: AnalysisWeights
): string => {
  const hasNeed = rosterAnalysis.needs[player.position as keyof typeof rosterAnalysis.needs];
  
  if (hasNeed) {
    return `Fills ${player.position} need`;
  }
  
  if (weights.rosterBalance > 60) {
    return `Best available talent`;
  }
  
  return `Good depth option`;
};