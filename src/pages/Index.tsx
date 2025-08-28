import { useState } from 'react';
import { FantasyHeader } from '@/components/fantasy/FantasyHeader';
import { SleeperSetup } from '@/components/sleeper/SleeperSetup';
import { AnalysisResults } from '@/components/fantasy/AnalysisResults';
import { EmptyLeagueMessage } from '@/components/sleeper/EmptyLeagueMessage';

export interface Player {
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

export interface LeagueData {
  teams: any[];
  availablePlayers: Player[];
  myRoster: Player[];
  allPlayers: Player[];
  isEmpty?: boolean;
  leagueName?: string;
}

const Index = () => {
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weights, setWeights] = useState<AnalysisWeights>({
    rosterBalance: 50,
    risk: 50,
  });

  const [config, setConfig] = useState({
    leagueId: '',
    rosterId: '',
  });

  const handleAnalysisComplete = (data: LeagueData) => {
    setLeagueData(data);
    setIsLoading(false);
  };

  const handleLoadingStart = () => {
    setIsLoading(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        <FantasyHeader />
        
        <div className="space-y-6 lg:space-y-8">
          {!leagueData && !isLoading && (
            <SleeperSetup
              config={config}
              onConfigChange={setConfig}
              onLoadingStart={handleLoadingStart}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading Sleeper data...</p>
              </div>
            </div>
          )}
          
          {leagueData && !leagueData.isEmpty && (
            <AnalysisResults 
              leagueData={leagueData}
              weights={weights}
            />
          )}

          {leagueData && leagueData.isEmpty && (
            <EmptyLeagueMessage 
              leagueName={leagueData.leagueName}
              rosterCount={12}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;