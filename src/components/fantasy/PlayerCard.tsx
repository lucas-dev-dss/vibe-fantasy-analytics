import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Zap, Crown } from "lucide-react";
import type { Player } from "@/pages/Index";

interface PlayerCardProps {
  player: Player & { recommendationScore?: number };
  rank: number;
  isWaiverWire?: boolean;
  isTradeTarget?: boolean;
  isMyRoster?: boolean;
}

export const PlayerCard = ({ player, rank, isWaiverWire, isTradeTarget, isMyRoster }: PlayerCardProps) => {
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'QB': return 'bg-gradient-to-r from-purple-500 to-indigo-500';
      case 'RB': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'WR': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'TE': return 'bg-gradient-to-r from-orange-500 to-amber-500';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-fantasy-gold" />;
    if (rank === 2) return <span className="text-fantasy-silver">🥈</span>;
    if (rank === 3) return <span className="text-fantasy-bronze">🥉</span>;
    return <span className="font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRecommendationLevel = () => {
    const score = player.recommendationScore || 0;
    if (score >= 80) return { text: 'MUST ADD', color: 'bg-gradient-to-r from-red-500 to-pink-500' };
    if (score >= 60) return { text: 'STRONG BUY', color: 'bg-gradient-to-r from-orange-500 to-red-500' };
    if (score >= 40) return { text: 'CONSIDER', color: 'bg-gradient-to-r from-yellow-500 to-orange-500' };
    if (score >= 20) return { text: 'MONITOR', color: 'bg-gradient-to-r from-blue-500 to-indigo-500' };
    return { text: 'HOLD', color: 'bg-gradient-to-r from-gray-500 to-slate-500' };
  };

  const recommendation = getRecommendationLevel();
  const trendDirection = player.recentAvg > player.seasonAvg;
  const ownershipTier = player.ownership < 10 ? 'Hidden Gem' : 
                       player.ownership < 30 ? 'Low Owned' : 
                       player.ownership < 60 ? 'Moderate' : 'Highly Owned';

  return (
    <Card className="glass-card hover:shadow-glow transition-all duration-300 border-l-4 border-l-primary">
      <CardContent className="p-4 lg:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getRankIcon(rank)}
              <div>
                <h4 className="font-bold text-lg text-foreground">{player.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-white font-semibold ${getPositionColor(player.position)}`}>
                    {player.position}
                  </Badge>
                  {isWaiverWire && (
                    <Badge variant="outline" className="text-xs">
                      {ownershipTier}: {player.ownership}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {!isMyRoster && (
              <Badge className={`${recommendation.color} text-white font-bold px-3 py-1`}>
                {recommendation.text}
              </Badge>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">Season Avg</div>
              <div className="font-bold text-foreground">{player.seasonAvg.toFixed(1)}</div>
            </div>
            
            <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
              <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                Recent Avg
                {trendDirection ? (
                  <TrendingUp className="h-3 w-3 text-accent" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
              </div>
              <div className={`font-bold ${trendDirection ? 'text-accent' : 'text-destructive'}`}>
                {player.recentAvg.toFixed(1)}
              </div>
            </div>
            
            <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">Expert Rank</div>
              <div className="font-bold text-foreground">#{player.expertRank}</div>
            </div>
            
            <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">Our Rank</div>
              <div className="font-bold text-primary">#{player.advancedRank}</div>
            </div>
          </div>

          {/* Advanced Metrics */}
          <div className="space-y-3">
            {player.snapShare > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Snap Share</span>
                  <span className="font-medium">{player.snapShare.toFixed(1)}%</span>
                </div>
                <Progress value={player.snapShare} className="h-2" />
              </div>
            )}
            
            {player.targetShare > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Target Share
                  </span>
                  <span className="font-medium">{(player.targetShare * 100).toFixed(1)}%</span>
                </div>
                <Progress value={player.targetShare * 100} className="h-2" />
              </div>
            )}
            
            {player.redZoneShares > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-3 w-3 text-accent" />
                <span className="text-muted-foreground">Red Zone Opportunities:</span>
                <Badge variant="secondary">{player.redZoneShares}</Badge>
              </div>
            )}
          </div>

          {/* Recommendation Score */}
          {player.recommendationScore !== undefined && (
            <div className="pt-2 border-t border-border/50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Edge Score</span>
                <span className="font-bold text-primary">
                  {player.recommendationScore}/100
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};