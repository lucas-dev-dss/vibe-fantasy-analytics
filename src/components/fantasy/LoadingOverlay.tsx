export const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="text-xl lg:text-2xl font-semibold text-foreground flex items-center justify-center gap-3">
          <span className="animate-pulse">🔄</span>
          Analyzing ESPN Data...
        </div>
        
        {/* Spinning loader */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent rounded-full animate-spin mx-auto" 
               style={{ animationDelay: '0.15s', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Loading steps */}
        <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            Processing player data...
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            Calculating contrarian opportunities...
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-fantasy-gold rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            Finding edge plays...
          </div>
        </div>
      </div>
    </div>
  );
};