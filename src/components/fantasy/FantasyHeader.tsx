export const FantasyHeader = () => {
  return (
    <header className="text-center mb-8 lg:mb-12">
      <div className="relative">
        <h1 className="hero-text mb-4">
          🏈 Fantasy Football Analyzer Pro
        </h1>
        <p className="text-lg lg:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          Advanced Edge Detection & Contrarian Value Analysis
        </p>
        
        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-primary rounded-full opacity-20 animate-float" 
             style={{ animationDelay: '0s' }} />
        <div className="absolute -top-2 -right-6 w-6 h-6 bg-gradient-accent rounded-full opacity-30 animate-float" 
             style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-2 left-1/3 w-4 h-4 bg-gradient-gold rounded-full opacity-25 animate-float" 
             style={{ animationDelay: '2s' }} />
      </div>
    </header>
  );
};