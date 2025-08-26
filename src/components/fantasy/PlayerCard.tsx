import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Users, 
  Trophy,
  Zap,
  Award,
  Star
} from "lucide-react";
import type { Player } from "@/pages/Index";

interface PlayerCardProps {
  player: Player & { 
    score?: number;
    reason?: string;
  };
  rank: number;
  isWaiverWire?: boolean;
  isTradeTarget?: boolean;
  isMyRoster?: boolean;
}

export const PlayerCard = ({ 
  player, 
  rank, 
  isWaiverWire, 
  isTradeTarget, 
  isMyRoster 
}: PlayerCardProps) => {
  
  // Get position color
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'QB': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'RB': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'WR': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'TE': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'K': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'DEF': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Get card type icon and styling
  const getCardType = () => {
    if (isWaiverWire) return { 
      icon: <Target className="h-4 w-4" />, 
      label: "Available",
      color: "text-green-400"
    };
    if (isTradeTarget) return { 
      icon: <Users className="h-4 w-4" />, 
      label: "Target", 
      color: "text-blue-400"
    };
    if (isMyRoster) return { 
      icon: <Trophy className="h-4 w-4" />, 
      label: "Rostered", 
      color: "text-gold"
    };
    return { icon: <Star className="h-4 w-4" />, label: "Player", color: "text-muted-foreground" };
  };

  const cardType = getCardType();
  const recommendationScore = player.score || 0;

  return (
    <Card className="glass-card hover:shadow-glow transition-all duration-300 group border border-border/50">
      <CardContent className="p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          
          {/* Rank Badge */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Badge 
                variant="outline" 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-primary border-primary/30"
              >
                {rank}
              </Badge>
            </div>

            {/* Player Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground truncate">
                  {player.player_name}
                </h4>
                <Badge 
                  className={`text-xs px-2 py-1 border ${getPositionColor(player.position)}`}
                >
                  {player.position}
                </Badge>
                {player.nfl_team && (
                  <span className="text-xs text-muted-foreground">
                    {player.nfl_team}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                {cardType.icon}
                <span className={cardType.color}>{cardType.label}</span>
              </div>
            </div>
          </div>

          {/* Score Section */}
          <div className="flex-shrink-0 lg:ml-auto">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Score</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {Math.round(recommendationScore)}
              </div>
              <Progress 
                value={recommendationScore} 
                className="w-16 h-2 mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Recommendation Reason */}
        {player.reason && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-start gap-2">
              <Award className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {player.reason}
              </p>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};