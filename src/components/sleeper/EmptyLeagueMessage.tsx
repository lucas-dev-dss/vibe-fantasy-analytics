import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Calendar, Users } from "lucide-react";

interface EmptyLeagueMessageProps {
  leagueName?: string;
  rosterCount?: number;
}

export const EmptyLeagueMessage = ({ leagueName, rosterCount }: EmptyLeagueMessageProps) => {
  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Empty League Detected</strong><br />
          This league hasn't had its draft yet. Player recommendations will be available after the draft is completed.
        </AlertDescription>
      </Alert>

      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            League Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">{leagueName || "Your League"}</div>
              <div className="text-sm text-muted-foreground">League Name</div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary flex items-center gap-2">
                <Users className="h-5 w-5" />
                {rosterCount || 12}
              </div>
              <div className="text-sm text-muted-foreground">Team Slots</div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">What happens next?</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Complete your league draft in the Sleeper app</li>
              <li>• Return to this tool after the draft</li>
              <li>• Get personalized waiver wire and trade recommendations</li>
              <li>• Analyze your roster strength and weaknesses</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};