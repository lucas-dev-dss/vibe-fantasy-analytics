import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Hash, Users, Database, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SleeperService } from "@/services/sleeperService";

interface SleeperSetupProps {
  config: {
    leagueId: string;
    rosterId: string;
  };
  onConfigChange: (config: any) => void;
  onLoadingStart: () => void;
  onAnalysisComplete: (data: any) => void;
}

export const SleeperSetup = ({ config, onConfigChange, onLoadingStart, onAnalysisComplete }: SleeperSetupProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  const handleSleeperLoad = async () => {
    if (!config.leagueId.trim()) {
      toast({
        title: "Missing League ID", 
        description: "Please enter your Sleeper League ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    onLoadingStart();

    try {
      // Step 1: Fetch Sleeper data and store in Supabase
      toast({
        title: "Loading Sleeper Data",
        description: "Fetching league information from Sleeper..."
      });

      const fetchResult = await SleeperService.fetchSleeperLeague({
        leagueId: config.leagueId
      });

      toast({
        title: "Sleeper Data Loaded",
        description: `Successfully loaded ${fetchResult.rosters_count} rosters and ${fetchResult.players_count} players`
      });

      // Step 2: Generate recommendations if roster ID provided
      if (config.rosterId.trim()) {
        toast({
          title: "Analyzing Roster",
          description: "Generating personalized recommendations..."
        });

        const analysisResult = await SleeperService.generateRecommendations(
          fetchResult.league_id,
          config.rosterId,
          { rosterBalance: 50, risk: 50 } // Default weights
        );

        const transformedData = SleeperService.transformToLeagueData(
          analysisResult.userRoster || [],
          analysisResult.recommendations || []
        );

        onAnalysisComplete(transformedData);
        
        toast({
          title: "Analysis Complete!",
          description: `Generated ${analysisResult.recommendations?.length || 0} recommendations using Sleeper data`
        });

      } else {
        // Show success but need roster ID for recommendations
        toast({
          title: "Data Loaded Successfully",
          description: "Add your Roster ID for personalized recommendations"
        });
        
        // Show basic data without recommendations
        onAnalysisComplete({
          teams: [],
          availablePlayers: [],
          myRoster: [],
          allPlayers: []
        });
      }

    } catch (error: any) {
      console.error('Sleeper loading error:', error);
      let errorMessage = "Failed to fetch league data. Please check your League ID and try again.";
      
      if (error.message?.includes('non-2xx status code')) {
        errorMessage = "Unable to connect to Sleeper API. Please verify your League ID is correct.";
      }
      
      toast({
        title: "Error loading Sleeper data", 
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Alert className="border-primary/20 bg-primary/5">
        <Zap className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary-foreground">
          <strong>✨ Sleeper Integration:</strong><br />
          Connect your Sleeper league for real-time roster analysis and player recommendations.
        </AlertDescription>
      </Alert>

      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl lg:text-2xl">
            <Database className="h-6 w-6 text-primary" />
            Sleeper League Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How to find your IDs:</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                <strong>League ID:</strong> Visit your Sleeper league in a web browser. 
                The League ID is the 18-digit number at the end of the URL (like 123456789012345678).
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Roster ID:</strong> Usually 1-12 based on your team's position in the league. 
                Try 1 if unsure, or check the league roster page.
              </p>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="leagueId" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Sleeper League ID
              </Label>
              <Input
                id="leagueId"
                placeholder="123456789012345678 (18 digits)"
                value={config.leagueId}
                onChange={(e) => handleInputChange('leagueId', e.target.value)}
                className="bg-background/50"
                pattern="[0-9]{18}"
                title="League ID must be exactly 18 digits"
              />
              <p className="text-xs text-muted-foreground">18-digit number from your Sleeper league URL</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rosterId" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Your Roster ID
              </Label>
              <Input
                id="rosterId"
                placeholder="Example: 1"
                value={config.rosterId}
                onChange={(e) => handleInputChange('rosterId', e.target.value)}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Your roster number in the league</p>
            </div>
          </div>

          <Button 
            onClick={handleSleeperLoad}
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            size="lg"
          >
            <Database className="mr-2 h-4 w-4" />
            {isLoading ? 'Loading...' : '🚀 Load Sleeper Data'}
          </Button>
        </CardContent>
      </Card>
    </>
  );
};