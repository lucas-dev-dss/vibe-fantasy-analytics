import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Github, Globe, Zap } from "lucide-react";

export const DeploymentInstructions = () => {
  return (
    <Card className="glass-card shadow-card border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl lg:text-2xl">
          <Rocket className="h-6 w-6 text-accent" />
          🚀 Deploy for Real ESPN Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-accent text-accent-foreground">
              <Zap className="mr-1 h-3 w-3" />
              Quick Setup
            </Badge>
            <span className="text-sm text-muted-foreground">
              Get your live app in 5 minutes
            </span>
          </div>
          
          <h4 className="font-semibold text-accent flex items-center gap-2">
            <Github className="h-4 w-4" />
            Quick Deployment Steps:
          </h4>
          
          <ol className="space-y-3 ml-4">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <div>
                <span className="font-semibold">Create GitHub account</span>
                <span className="text-muted-foreground"> (if you don't have one)</span>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <div>
                <span className="font-semibold">Create new repository:</span>
                <code className="ml-2 px-2 py-1 bg-muted rounded text-sm">
                  "fantasy-football-analyzer"
                </code>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <div>
                <span className="font-semibold">Upload this HTML file</span>
                <span className="text-muted-foreground"> as "index.html"</span>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                4
              </span>
              <div>
                <span className="font-semibold">Enable GitHub Pages</span>
                <span className="text-muted-foreground"> in repository settings</span>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                5
              </span>
              <div>
                <span className="font-semibold">Add serverless function</span>
                <span className="text-muted-foreground"> for ESPN API (I'll provide code)</span>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                6
              </span>
              <div>
                <span className="font-semibold">Share your live URL</span>
                <span className="text-muted-foreground"> with league mates!</span>
              </div>
            </li>
          </ol>
          
          <div className="mt-6 p-4 bg-accent/5 border border-accent/10 rounded-lg">
            <div className="flex items-center gap-2 text-accent font-semibold mb-2">
              <Globe className="h-4 w-4" />
              Result:
            </div>
            <p className="text-sm">
              Full working app at{" "}
              <code className="px-2 py-1 bg-muted rounded text-xs">
                yourname.github.io/fantasy-football-analyzer
              </code>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};