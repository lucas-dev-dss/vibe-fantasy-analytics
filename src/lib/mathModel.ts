import type { Player, AnalysisWeights, LeagueData } from "@/pages/Index";

// Enhanced Math Model Engine for Fantasy Football Analysis
// Location: src/lib/mathModel.ts

/**
 * POSITIONAL STRENGTH ANALYSIS
 * Analyzes user's roster to identify weaknesses by position
 */
export const analyzeRosterStrength = (roster: Player[]) => {
  const positionGroups = {
    QB: roster.filter(p => p.position === 'QB'),
    RB: roster.filter(p => p.position === 'RB'), 
    WR: roster.filter(p => p.position === 'WR'),
    TE: roster.filter(p => p.position === 'TE')
  };

  // Calculate average performance and depth for each position
  const positionAnalysis = Object.entries(positionGroups).map(([pos, players]) => {
    if (players.length === 0) return { position: pos, avgScore: 0, depth: 0, strength: 0 };
    
    const avgScore = players.reduce((sum, p) => sum + p.seasonAvg, 0) / players.length;
    const depth = players.length;
    const topPlayerScore = Math.max(...players.map(p => p.seasonAvg));
    
    // Strength = combination of top player quality + depth + consistency
    const strength = (topPlayerScore * 0.6) + (avgScore * 0.3) + (depth * 2); // Depth weighted by 2 points per player
    
    return { position: pos, avgScore, depth, strength };
  });

  return positionAnalysis;
};

/**
 * ROSTER HOLE MULTIPLIER
 * Boosts players in positions where user is weak
 */
export const getRosterHoleMultiplier = (playerPosition: string, rosterAnalysis: any[], rosterBalanceWeight: number) => {
  const positionStrength = rosterAnalysis.find(p => p.position === playerPosition)?.strength || 0;
  const avgStrength = rosterAnalysis.reduce((sum, p) => sum + p.strength, 0) / rosterAnalysis.length;
  
  // If position is weak (below average), boost recommendations
  const weaknessMultiplier = positionStrength < avgStrength ? 
    ((avgStrength - positionStrength) / avgStrength) * 2 : 0;
    
  // Weight based on user's roster balance preference (0 = prioritize holes, 100 = ignore holes)  
  const adjustedMultiplier = weaknessMultiplier * ((100 - rosterBalanceWeight) / 100);
  
  return 1 + adjustedMultiplier; // 1.0 = no boost, 2.0 = double points for weak positions
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
 * Main scoring algorithm that combines all factors
 */
export const calculateRecommendationScore = (
  player: Player, 
  weights: AnalysisWeights, 
  rosterAnalysis: any[]
) => {
  const metrics = calculateAdvancedMetrics(player);
  const rosterHoleMultiplier = getRosterHoleMultiplier(player.position, rosterAnalysis, weights.rosterBalance);
  
  // COMPONENT SCORES (0-100 scale)
  
  // 1. VALUE SCORE: Expert vs Advanced rank difference (contrarian value)
  const valueScore = Math.max(0, player.expertRank - player.advancedRank) * 2;
  
  // 2. OPPORTUNITY SCORE: Low ownership with high upside  
  const opportunityScore = (100 - player.ownership) * 0.5;
  
  // 3. PERFORMANCE SCORE: Recent trend + season performance
  const performanceScore = (player.seasonAvg * 2) + (metrics.trend * 50);
  
  // 4. RISK/CEILING SCORE: Based on user's risk tolerance
  const riskWeight = weights.risk / 100;
  const riskScore = (metrics.ceiling * riskWeight) + (metrics.floor * (1 - riskWeight));
  
  // 5. USAGE/OPPORTUNITY SCORE: Snap share + target share for skill positions
  const usageScore = player.position === 'QB' ? 
    player.snapShare * 0.3 : // QBs: just snap share
    (player.snapShare * 0.2 + player.targetShare * 100 + player.redZoneShares * 5); // Skill positions
  
  // COMBINE ALL SCORES
  let totalScore = (
    valueScore * 0.25 +           // 25% - Value vs consensus  
    opportunityScore * 0.20 +     // 20% - Low ownership opportunity
    performanceScore * 0.25 +     // 25% - Recent performance & trend
    riskScore * 0.20 +           // 20% - Risk-adjusted ceiling/floor
    usageScore * 0.10            // 10% - Usage opportunity
  );
  
  // Apply roster hole multiplier (1.0 to 2.0x boost for weak positions)
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