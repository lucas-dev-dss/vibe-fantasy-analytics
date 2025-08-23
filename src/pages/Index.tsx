import { useState } from "react";
import { FantasyHeader } from "@/components/fantasy/FantasyHeader";
import { ESPNSetup } from "@/components/fantasy/ESPNSetup";
import { AnalysisStrategy } from "@/components/fantasy/AnalysisStrategy";
import { DeploymentInstructions } from "@/components/fantasy/DeploymentInstructions";
import { AnalysisResults } from "@/components/fantasy/AnalysisResults";
import { LoadingOverlay } from "@/components/fantasy/LoadingOverlay";
import { useToast } from "@/hooks/use-toast";

export interface AnalysisWeights {
  rosterBalance: number; // 0 = fill roster holes, 100 = best available regardless
  risk: number;
}

export interface LeagueData {
  teams: any[];
  availablePlayers: any[];
  myRoster: any[];
  allPlayers: any[];
}

export interface Player {
  name: string;
  position: string;
  seasonAvg: number;
  recentAvg: number;
  weeklyScores: number[];
  ownership: number;
  expertRank: number;
  advancedRank: number;
  targetShare: number;
  snapShare: number;
  redZoneShares: number;
  recommendationScore?: number;
  analysisReason?: string;
}

const Index = () => {
  const [analysisWeights, setAnalysisWeights] = useState<AnalysisWeights>({
    rosterBalance: 50,
    risk: 50
  });
  
  const [leagueData, setLeagueData] = useState<LeagueData>({
    teams: [],
    availablePlayers: [],
    myRoster: [],
    allPlayers: []
  });
  
  const [currentModel, setCurrentModel] = useState<string>('custom');
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [espnConfig, setEspnConfig] = useState({
    leagueId: '12345678',
    teamId: '1',
    espnCookies: ''
  });

  const { toast } = useToast();

  const handleAnalysisComplete = (results: any) => {
    setLeagueData(results);
    setShowResults(true);
    setIsLoading(false);
    toast({
      title: "Analysis Complete!",
      description: "Smart recommendations based on your roster needs",
    });
  };

  const handleLoadingStart = () => {
    setIsLoading(true);
    toast({
      title: "Analyzing...",
      description: "Processing team data with enhanced math models",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        <FantasyHeader />
        
        <div className="space-y-6 lg:space-y-8">
          <ESPNSetup 
            config={espnConfig}
            onConfigChange={setEspnConfig}
            onLoadingStart={handleLoadingStart}
            onAnalysisComplete={handleAnalysisComplete}
          />
          
          <AnalysisStrategy
            weights={analysisWeights}
            onWeightsChange={setAnalysisWeights}
            currentModel={currentModel}
            onModelChange={setCurrentModel}
            onAnalysisComplete={handleAnalysisComplete}
            onLoadingStart={handleLoadingStart}
          />
          
          <DeploymentInstructions />
          
          {showResults && (
            <AnalysisResults 
              leagueData={leagueData}
              weights={analysisWeights}
            />
          )}
        </div>
      </div>
      
      {isLoading && <LoadingOverlay />}
    </div>
  );
};

export default Index;