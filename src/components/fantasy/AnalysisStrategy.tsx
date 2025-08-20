import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Settings, TrendingUp } from "lucide-react";
import type { AnalysisWeights } from "@/pages/Index";
import { generateDemoData } from "@/lib/demo-data";

interface AnalysisStrategyProps {
  weights: AnalysisWeights;
  onWeightsChange: (weights: AnalysisWeights) => void;
  currentModel: string;
  onModelChange: (model: string) => void;
  onAnalysisComplete: (data: any) => void;
  onLoadingStart: () => void;
}

export const AnalysisStrategy = ({ 
  weights, 
  onWeightsChange, 
  currentModel, 
  onModelChange, 
  onAnalysisComplete, 
  onLoadingStart 
}: AnalysisStrategyProps) => {
  
  const handleModelSelect = (model: string) => {
    onModelChange(model);
    switch (model) {
      case 'aggressive':
        onWeightsChange({ contrarian: 80, risk: 75 });
        break;
      case 'conservative':
        onWeightsChange({ contrarian: 30, risk: 25 });
        break;
      case 'custom':
        // Keep current weights
        break;
    }
  };

  const handleWeightChange = (type: 'contrarian' | 'risk', value: number[]) => {
    onWeightsChange({
      ...weights,
      [type]: value[0]
    });
  };

  const getStrategyDescription = () => {
    const { contrarian, risk } = weights;
    
    if (contrarian > 70 && risk > 70) {
      return { 
        text: "🔥 Maximum Edge Hunter - High contrarian, high ceiling plays", 
        color: "bg-gradient-to-r from-red-500 to-orange-500"
      };
    } else if (contrarian < 30 && risk < 30) {
      return { 
        text: "🛡️ Safe Floor Strategy - Consensus picks with guaranteed production", 
        color: "bg-gradient-to-r from-green-500 to-emerald-500"
      };
    } else if (contrarian > 60) {
      return { 
        text: "💎 Contrarian Value Hunter - Finding overlooked gems", 
        color: "bg-gradient-to-r from-blue-500 to-purple-500"
      };
    } else if (risk > 60) {
      return { 
        text: "🚀 Boom/Bust Specialist - Chasing league-winning upside", 
        color: "bg-gradient-to-r from-purple-500 to-pink-500"
      };
    } else {
      return { 
        text: "⚖️ Balanced Approach - Mix of safety and upside", 
        color: "bg-gradient-to-r from-blue-400 to-cyan-400"
      };
    }
  };

  const handleCompleteAnalysis = async () => {
    onLoadingStart();
    
    // Simulate analysis with demo data
    setTimeout(() => {
      const demoData = generateDemoData();
      onAnalysisComplete(demoData);
    }, 3000);
  };

  const strategyInfo = getStrategyDescription();

  return (
    <Card className="glass-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl lg:text-2xl">
          <TrendingUp className="h-6 w-6 text-primary" />
          Analysis Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Model Selection */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={currentModel === 'aggressive' ? 'default' : 'outline'}
              onClick={() => handleModelSelect('aggressive')}
              className={currentModel === 'aggressive' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              <Zap className="mr-2 h-4 w-4" />
              ⚡ Aggressive Model
            </Button>
            <Button
              variant={currentModel === 'conservative' ? 'default' : 'outline'}
              onClick={() => handleModelSelect('conservative')}
              className={currentModel === 'conservative' ? 'bg-accent hover:bg-accent/90' : ''}
            >
              <Shield className="mr-2 h-4 w-4" />
              🛡️ Conservative Model
            </Button>
            <Button
              variant={currentModel === 'custom' ? 'default' : 'outline'}
              onClick={() => handleModelSelect('custom')}
              className={currentModel === 'custom' ? 'bg-primary hover:bg-primary/90' : ''}
            >
              <Settings className="mr-2 h-4 w-4" />
              ⚙️ Custom Model
            </Button>
          </div>
          
          <div className={`p-4 rounded-lg text-white font-medium text-center ${strategyInfo.color}`}>
            {strategyInfo.text}
          </div>
        </div>

        {/* Advanced Controls */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Edge Detection Parameters</h3>
          <p className="text-muted-foreground text-sm lg:text-base">
            Adjust these sliders to customize your competitive advantage:
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contrarian Value */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-semibold">🎯 Contrarian Value Detection</Label>
                <Badge variant="secondary" className="font-bold">
                  {weights.contrarian}%
                </Badge>
              </div>
              <div className="px-2">
                <Slider
                  value={[weights.contrarian]}
                  onValueChange={(value) => handleWeightChange('contrarian', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                0 = Follow consensus rankings | 100 = Maximum contrarian targeting
              </p>
            </div>

            {/* Risk Tolerance */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-semibold">⚖️ Risk Tolerance (Floor ↔ Ceiling)</Label>
                <Badge variant="secondary" className="font-bold">
                  {weights.risk}%
                </Badge>
              </div>
              <div className="px-2">
                <Slider
                  value={[weights.risk]}
                  onValueChange={(value) => handleWeightChange('risk', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                0 = Consistent floor plays | 100 = High-ceiling boom/bust
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleCompleteAnalysis}
          size="lg"
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg py-6"
        >
          🔥 Generate Recommendations
        </Button>
      </CardContent>
    </Card>
  );
};
