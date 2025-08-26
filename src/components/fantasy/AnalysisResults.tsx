import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/fantasy/PlayerCard";
import { Gem, ArrowUpDown, Users, BarChart3 } from "lucide-react";
import type { LeagueData, AnalysisWeights, Player } from "@/pages/Index";
import { calculatePlayerScore, generateRecommendationReason, analyzeRosterComposition } from "@/lib/sleeperMath";

interface AnalysisResultsProps {
  leagueData: LeagueData;
  weights: AnalysisWeights;
}

export const AnalysisResults = ({ leagueData, weights }: AnalysisResultsProps) => {
  const [activeTab, setActiveTab] = useState("waiver");

  // Calculate recommendation scores using the simplified math model
  const scoredPlayers = leagueData.allPlayers.map(player => {
    const rosterAnalysis = analyzeRosterComposition(leagueData.myRoster);
    const score = calculatePlayerScore(player, rosterAnalysis, weights);
    const reason = generateRecommendationReason(player, rosterAnalysis, weights);
    
    return {
      ...player,
      score,
      reason
    };
  });

  // Filter and sort recommendations
  const waiverRecommendations = scoredPlayers
    .filter(p => p.score > 50)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 10);

  const tradeTargets = scoredPlayers
    .filter(p => p.score > 60)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 6);

  const rosterAnalysis = leagueData.myRoster.map(player => {
    const rosterComp = analyzeRosterComposition(leagueData.myRoster);
    const score = calculatePlayerScore(player, rosterComp, weights);
    const reason = generateRecommendationReason(player, rosterComp, weights);
    
    return {
      ...player,
      score,
      reason
    };
  }).sort((a, b) => (b.score || 0) - (a.score || 0));

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
              <span className="hidden sm:inline">💎 Available</span>
              <span className="sm:hidden">💎</span>
            </TabsTrigger>
            <TabsTrigger value="trades" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">🔄 Top Targets</span>
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
              <h3 className="text-lg font-semibold">Available Players</h3>
              <Badge className="bg-gradient-primary">
                {waiverRecommendations.length} Players
              </Badge>
            </div>
            <div className="space-y-4">
              {waiverRecommendations.map((player, index) => (
                <PlayerCard 
                  key={`${player.sleeper_player_id}-${index}`} 
                  player={player} 
                  rank={index + 1}
                  isWaiverWire={true}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trades" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Top Recommended Targets</h3>
              <Badge className="bg-gradient-accent">
                {tradeTargets.length} Targets
              </Badge>
            </div>
            <div className="space-y-4">
              {tradeTargets.map((player, index) => (
                <PlayerCard 
                  key={`${player.sleeper_player_id}-trade-${index}`} 
                  player={player} 
                  rank={index + 1}
                  isTradeTarget={true}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roster" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Current Roster</h3>
              <Badge className="bg-gradient-gold">
                {rosterAnalysis.length} Players
              </Badge>
            </div>
            <div className="space-y-4">
              {rosterAnalysis.map((player, index) => (
                <PlayerCard 
                  key={`${player.sleeper_player_id}-roster-${index}`} 
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