import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Rocket, Shield, Globe, Hash } from "lucide-react";
import { generateDemoData } from "@/lib/demo-data";

interface ESPNSetupProps {
  config: {
    leagueId: string;
    teamId: string;
    espnCookies: string;
  };
  onConfigChange: (config: any) => void;
  onLoadingStart: () => void;
  onAnalysisComplete: (data: any) => void;
}

export const ESPNSetup = ({ config, onConfigChange, onLoadingStart, onAnalysisComplete }: ESPNSetupProps) => {
  const handleInputChange = (field: string, value: string) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  const handleESPNLoad = async () => {
    onLoadingStart();
    
    // Simulate API call delay
    setTimeout(() => {
      const demoData = generateDemoData();
      onAnalysisComplete(demoData);
    }, 2000);
  };

  return (
    <>
      {/* Browser Limitation Warning */}
      <Alert className="border-warning/20 bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription className="text-warning-foreground">
          <strong>⚠️ Browser Limitation Notice:</strong><br />
          This standalone version uses demo data due to browser security restrictions. 
          For real ESPN data integration, use the GitHub Pages deployment method outlined below.
        </AlertDescription>
      </Alert>

      {/* ESPN Setup Card */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl lg:text-2xl">
            <Shield className="h-6 w-6 text-primary" />
            ESPN League Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-muted/30 rounded-lg p-4 lg:p-6 border border-border/50">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              🔧 For Real ESPN Data (GitHub Pages Required):
            </h4>
            <ol className="space-y-2 text-sm lg:text-base text-muted-foreground ml-4">
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary min-w-[20px]">1.</span>
                <span><strong>Deploy to GitHub Pages</strong> (instructions below)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary min-w-[20px]">2.</span>
                <span><strong>Private Leagues:</strong> Each user needs their ESPN cookies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary min-w-[20px]">3.</span>
                <span><strong>Public Leagues:</strong> Just need the League ID</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary min-w-[20px]">4.</span>
                <span><strong>Get League ID:</strong> Check your ESPN league URL</span>
              </li>
            </ol>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="leagueId" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                ESPN League ID
              </Label>
              <Input
                id="leagueId"
                placeholder="Example: 12345678"
                value={config.leagueId}
                onChange={(e) => handleInputChange('leagueId', e.target.value)}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Find this in your ESPN league URL</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamId" className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                Your Team ID
              </Label>
              <Input
                id="teamId"
                placeholder="Example: 1"
                value={config.teamId}
                onChange={(e) => handleInputChange('teamId', e.target.value)}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Your team number in the league</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="espnCookies">
              ESPN Cookies (Private Leagues Only)
            </Label>
            <Textarea
              id="espnCookies"
              rows={3}
              placeholder="Paste ESPN session cookies here for private leagues"
              value={config.espnCookies}
              onChange={(e) => handleInputChange('espnCookies', e.target.value)}
              className="bg-background/50 resize-none"
            />
            <p className="text-xs text-muted-foreground">Required only for private leagues</p>
          </div>

          <Button 
            onClick={handleESPNLoad}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            size="lg"
          >
            <Rocket className="mr-2 h-4 w-4" />
            🚀 Try ESPN Data (Will Use Demo)
          </Button>
        </CardContent>
      </Card>
    </>
  );
};