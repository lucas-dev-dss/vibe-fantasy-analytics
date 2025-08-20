import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/fantasy/PlayerCard";
import { Gem, ArrowUpDown, Users, BarChart3 } from "lucide-react";
import type { LeagueData, AnalysisWeights, Player } from "@/pages/Index";

interface AnalysisResultsProps {
  leagueData: LeagueData;
  weights: AnalysisWeights;
}

export const AnalysisResults = ({ leagueData, weights }: AnalysisResultsProps) => {
  const [activeTab, setActiveTab] = useState("waiver");

  // Calculate recommendation scores based on weights
  const calculateRecommendationScore = (player: Player) => {
    const contrarianScore = (100 - player.ownership) * (weights.contrarian / 100);
    const expertDiff = Math.max(0, player.expertRank - player.advancedRank);
    const riskScore = (player.recentAvg / player.seasonAvg - 1) * 100 * (weights.risk / 100);
    
    return Math.round(contrarianScore + expertDiff + riskScore);
  };

  // Sort players by recommendation score
  const getSortedRecommendations = (players: Player[]) => {
    return players
      .map(player => ({
        ...player,
        recommendationScore: calculateRecommendationScore(player)
      }))
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
  };

  const waiverRecommendations = getSortedRecommendations(leagueData.availablePlayers);
  const tradeTargets = waiverRecommendations.filter(p => p.ownership > 50);
  const rosterAnalysis = getSortedRecommendations(leagueData.myRoster);

  return (
    <Card className="glass-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl lg:text-2xl">
          <BarChart3 className="h-6 w-6 text-primary" />
          📊 Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 mb-6">
            <TabsTrigger value="waiver" className="flex items-center gap-2">
              <Gem className="h-4 w-4" />
              <span className="hidden sm:inline">💎 Waiver Wire</span>
              <span className="sm:hidden">💎</span>
            </TabsTrigger>
            <TabsTrigger value="trades" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">🔄 Trade Targets</span>
              <span className="sm:hidden">🔄</span>
            </TabsTrigger>
            <TabsTrigger value="roster" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">👥 My Roster</span>
              <span className="sm:hidden">👥</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="waiver" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Top Waiver Wire Recommendations</h3>
              <Badge className="bg-gradient-primary">
                {waiverRecommendations.length} Players Found
              </Badge>
            </div>
            <div className="space-y-4">
              {waiverRecommendations.slice(0, 8).map((player, index) => (
                <PlayerCard 
                  key={`${player.name}-${index}`} 
                  player={player} 
                  rank={index + 1}
                  isWaiverWire={true}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trades" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recommended Trade Targets</h3>
              <Badge className="bg-gradient-accent">
                {tradeTargets.length} Targets
              </Badge>
            </div>
            <div className="space-y-4">
              {tradeTargets.slice(0, 6).map((player, index) => (
                <PlayerCard 
                  key={`${player.name}-trade-${index}`} 
                  player={player} 
                  rank={index + 1}
                  isTradeTarget={true}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roster" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Current Roster Analysis</h3>
              <Badge className="bg-gradient-gold">
                {rosterAnalysis.length} Players
              </Badge>
            </div>
            <div className="space-y-4">
              {rosterAnalysis.map((player, index) => (
                <PlayerCard 
                  key={`${player.name}-roster-${index}`} 
                  player={player} 
                  rank={index + 1}
                  isMyRoster={true}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};