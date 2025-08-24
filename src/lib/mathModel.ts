import type { Player, AnalysisWeights, LeagueData } from "@/pages/Index";

// Enhanced Math Model Engine for Fantasy Football Analysis with Statistical Distributions
// Location: src/lib/mathModel.ts
// 
// PHILOSOPHY: Balance Best Player Available (BPA) vs Positional Roster Holes
// Uses statistical distributions (floor, ceiling, std dev) for risk assessment
// Factors in bye weeks and roster construction for intelligent recommendations

/**
 * STATISTICAL DISTRIBUTION ANALYSIS
 * Calculates floor, ceiling, and risk metrics using projection distributions
 */
export const calculateStatisticalMetrics = (player: Player) => {
  const scores = player.weeklyScores;
  const recentScores = scores.slice(-4); // Last 4 weeks for trend analysis
  
  // Calculate mean and standard deviation
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Statistical floor/ceiling (10th/90th percentiles)
  const sortedScores = [...scores].sort((a, b) => a - b);
  const floor = sortedScores[Math.floor(sortedScores.length * 0.1)] || mean - stdDev;
  const ceiling = sortedScores[Math.floor(sortedScores.length * 0.9)] || mean + stdDev;
  
  // Risk coefficient (volatility relative to mean)
  const riskCoeff = stdDev / mean;
  
  // Recent trend vs season average
  const recentMean = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  const trendScore = (recentMean - mean) / mean;
  
  return { floor, ceiling, stdDev, riskCoeff, trendScore, mean };
};

/**
 * BYE WEEK CONFLICT DETECTION
 * Identifies potential roster holes during bye weeks
 */
export const assessByeWeekRisk = (roster: Player[], candidatePlayer: Player) => {
  const candidateByeWeek = candidatePlayer.byeWeek || 0;
  
  // Count position players sharing same bye week
  const samePositionByeConflicts = roster
    .filter(p => p.position === candidatePlayer.position && p.byeWeek === candidateByeWeek)
    .length;
  
  // Overall roster bye week distribution risk
  const byeWeekCounts = roster.reduce((acc, p) => {
    const bye = p.byeWeek || 0;
    acc[bye] = (acc[bye] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const maxByeWeekCount = Math.max(...Object.values(byeWeekCounts));
  const byeWeekRisk = samePositionByeConflicts > 1 ? 0.8 : 0; // Penalty for conflicts
  
  return { samePositionByeConflicts, byeWeekRisk, maxByeWeekCount };
};

/**
 * POSITIONAL STRENGTH ANALYSIS
 * Enhanced with statistical floor/ceiling analysis
 */
export const analyzeRosterStrength = (roster: Player[]) => {
  const positionGroups = {
    QB: roster.filter(p => p.position === 'QB'),
    RB: roster.filter(p => p.position === 'RB'), 
    WR: roster.filter(p => p.position === 'WR'),
    TE: roster.filter(p => p.position === 'TE')
  };

  // Enhanced analysis with statistical distributions
  const positionAnalysis = Object.entries(positionGroups).map(([pos, players]) => {
    if (players.length === 0) {
      return { 
        position: pos, 
        avgScore: 0, 
        depth: 0, 
        strength: 0,
        avgFloor: 0,
        avgCeiling: 0,
        riskProfile: 'unknown'
      };
    }
    
    const playerMetrics = players.map(p => calculateStatisticalMetrics(p));
    
    // Traditional metrics
    const avgScore = players.reduce((sum, p) => sum + p.seasonAvg, 0) / players.length;
    const depth = players.length;
    const topPlayerScore = Math.max(...players.map(p => p.seasonAvg));
    
    // Statistical distribution metrics
    const avgFloor = playerMetrics.reduce((sum, m) => sum + m.floor, 0) / playerMetrics.length;
    const avgCeiling = playerMetrics.reduce((sum, m) => sum + m.ceiling, 0) / playerMetrics.length;
    const avgRisk = playerMetrics.reduce((sum, m) => sum + m.riskCoeff, 0) / playerMetrics.length;
    
    // Risk profile classification
    const riskProfile = avgRisk < 0.15 ? 'safe' : avgRisk > 0.3 ? 'volatile' : 'balanced';
    
    // Enhanced strength calculation factoring in floor stability
    const strength = (topPlayerScore * 0.4) + (avgFloor * 0.3) + (avgScore * 0.2) + (depth * 2);
    
    return { 
      position: pos, 
      avgScore, 
      depth, 
      strength,
      avgFloor,
      avgCeiling,
      riskProfile,
      avgRisk
    };
  });

  return positionAnalysis;
};

/**
 * ROSTER COMPOSITION ANALYSIS
 * Advanced BPA vs Roster Holes decision engine
 */
export const getRosterHoleMultiplier = (
  playerPosition: string, 
  rosterAnalysis: any[], 
  rosterBalanceWeight: number,
  candidatePlayer: Player,
  roster: Player[]
) => {
  const positionAnalysis = rosterAnalysis.find(p => p.position === playerPosition);
  const candidateMetrics = calculateStatisticalMetrics(candidatePlayer);
  const byeWeekAnalysis = assessByeWeekRisk(roster, candidatePlayer);
  
  if (!positionAnalysis) return 1.0;
  
  const avgStrength = rosterAnalysis.reduce((sum, p) => sum + p.strength, 0) / rosterAnalysis.length;
  const strengthGap = Math.max(0, avgStrength - positionAnalysis.strength);
  
  // Base roster hole multiplier
  let multiplier = 1.0;
  
  // ROSTER HOLE LOGIC (when rosterBalanceWeight is LOW - prioritize holes)
  if (rosterBalanceWeight < 50) {
    // Boost for weak positions
    const holeBoost = (strengthGap / avgStrength) * 2;
    
    // Extra boost for complementary risk profiles
    let riskComplementBoost = 0;
    if (positionAnalysis.riskProfile === 'safe' && candidateMetrics.riskCoeff > 0.25) {
      riskComplementBoost = 0.3; // Add upside to safe position
    } else if (positionAnalysis.riskProfile === 'volatile' && candidateMetrics.riskCoeff < 0.15) {
      riskComplementBoost = 0.4; // Add stability to volatile position
    }
    
    multiplier += holeBoost + riskComplementBoost;
  }
  
  // BEST PLAYER AVAILABLE LOGIC (when rosterBalanceWeight is HIGH - ignore holes)
  else {
    // Minimal position consideration, focus on pure talent
    const minimalHoleBoost = Math.min(0.1, strengthGap / avgStrength);
    multiplier += minimalHoleBoost;
  }
  
  // Bye week penalty (always applies)
  multiplier -= byeWeekAnalysis.byeWeekRisk;
  
  // Apply user preference weighting
  const preferenceAdjustment = ((100 - rosterBalanceWeight) / 100);
  multiplier = 1.0 + ((multiplier - 1.0) * preferenceAdjustment);
  
  return Math.max(0.5, multiplier); // Never go below 0.5x
};

/**
 * ADVANCED PLAYER METRICS
 * Calculates ceiling, floor, and volatility for risk assessment
 */
export const calculateAdvancedMetrics = (player: Player) => {
  const scores = player.weeklyScores;
  const recentScores = scores.slice(-4); // Last 4 weeks
  
  // Ceiling = 90th percentile of weekly scores
  const sortedScores = [...scores].sort((a, b) => b - a);
  const ceiling = sortedScores[Math.floor(sortedScores.length * 0.1)] || player.seasonAvg;
  
  // Floor = 10th percentile of weekly scores  
  const floor = sortedScores[Math.floor(sortedScores.length * 0.9)] || player.seasonAvg;
  
  // Volatility = coefficient of variation
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const volatility = Math.sqrt(variance) / mean;
  
  // Trend = recent performance vs season average
  const trendScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  const trend = (trendScore - player.seasonAvg) / player.seasonAvg;
  
  return { ceiling, floor, volatility, trend };
};

/**
 * ENHANCED RECOMMENDATION SCORE CALCULATION
 * Main scoring algorithm that combines statistical distributions with BPA vs Roster Holes logic
 */
export const calculateRecommendationScore = (
  player: Player, 
  weights: AnalysisWeights, 
  rosterAnalysis: any[],
  roster: Player[]
) => {
  const metrics = calculateStatisticalMetrics(player);
  const rosterHoleMultiplier = getRosterHoleMultiplier(
    player.position, 
    rosterAnalysis, 
    weights.rosterBalance,
    player,
    roster
  );
  
  // COMPONENT SCORES (0-100 scale)
  
  // 1. VALUE SCORE: Expert vs Advanced rank difference (contrarian value)
  const valueScore = Math.max(0, player.expertRank - player.advancedRank) * 2;
  
  // 2. OPPORTUNITY SCORE: Low ownership with high upside  
  const opportunityScore = (100 - player.ownership) * 0.5;
  
  // 3. PERFORMANCE SCORE: Recent trend + season performance
  const performanceScore = (player.seasonAvg * 2) + (metrics.trendScore * 50);
  
  // 4. STATISTICAL DISTRIBUTION SCORE: Floor/ceiling based on risk tolerance
  const riskWeight = weights.risk / 100;
  const floorWeight = 1 - riskWeight;
  const distributionScore = (metrics.floor * floorWeight * 15) + (metrics.ceiling * riskWeight * 10);
  
  // 5. USAGE/OPPORTUNITY SCORE: Snap share + target share for skill positions
  const usageScore = player.position === 'QB' ? 
    player.snapShare * 0.3 : // QBs: just snap share
    (player.snapShare * 0.2 + player.targetShare * 100 + player.redZoneShares * 5); // Skill positions
  
  // COMBINE ALL SCORES
  let totalScore = (
    valueScore * 0.20 +           // 20% - Value vs consensus  
    opportunityScore * 0.15 +     // 15% - Low ownership opportunity
    performanceScore * 0.25 +     // 25% - Recent performance & trend
    distributionScore * 0.25 +    // 25% - Statistical floor/ceiling analysis
    usageScore * 0.15            // 15% - Usage opportunity
  );
  
  // Apply roster hole multiplier (0.5 to 2.0x boost based on BPA vs Holes preference)
  totalScore *= rosterHoleMultiplier;
  
  return Math.round(totalScore);
};

/**
 * RECOMMENDATION EXPLANATION GENERATOR
 * Creates simple 1-2 line explanations for each recommendation
 */
export const generateRecommendationReason = (
  player: Player, 
  score: number, 
  rosterAnalysis: any[], 
  weights: AnalysisWeights
) => {
  const metrics = calculateAdvancedMetrics(player);
  const positionStrength = rosterAnalysis.find(p => p.position === player.position)?.strength || 0;
  const avgStrength = rosterAnalysis.reduce((sum, p) => sum + p.strength, 0) / rosterAnalysis.length;
  
  const reasons = [];
  
  // Position need
  if (positionStrength < avgStrength && weights.rosterBalance < 60) {
    reasons.push(`Fills ${player.position} roster hole`);
  }
  
  // Value opportunity  
  if (player.expertRank - player.advancedRank > 5) {
    reasons.push(`Expert rank #${player.expertRank} vs advanced #${player.advancedRank}`);
  }
  
  // Low ownership
  if (player.ownership < 15) {
    reasons.push(`Only ${player.ownership}% owned`);
  }
  
  // Trending up
  if (metrics.trend > 0.15) {
    reasons.push(`Recent form trending up`);
  }
  
  // High ceiling for risk takers
  if (weights.risk > 60 && metrics.ceiling > player.seasonAvg * 1.3) {
    reasons.push(`High ceiling upside play`);
  }
  
  // Safe floor for conservative
  if (weights.risk < 40 && metrics.volatility < 0.3) {
    reasons.push(`Consistent floor play`);
  }
  
  return reasons.slice(0, 2).join(". ") || "Strong overall metrics";
};