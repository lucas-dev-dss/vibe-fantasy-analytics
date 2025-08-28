/**
 * Sleeper API Validation Utilities
 * Provides validation functions for Sleeper league and roster data
 */

export interface SleeperLeagueValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SleeperConfig {
  leagueId: string;
  rosterId?: string;
}

/**
 * Validate Sleeper League ID format and structure
 */
export const validateSleeperLeagueId = (leagueId: string): SleeperLeagueValidation => {
  const result: SleeperLeagueValidation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!leagueId || leagueId.trim().length === 0) {
    result.isValid = false;
    result.errors.push('League ID is required');
    return result;
  }

  const cleanId = leagueId.trim();
  
  // Validate format: 18-19 digit numeric string
  if (!/^\d{18,19}$/.test(cleanId)) {
    result.isValid = false;
    result.errors.push(`Invalid League ID format. Must be 18-19 digits. Provided: ${cleanId} (${cleanId.length} digits)`);
    return result;
  }

  return result;
};

/**
 * Validate Sleeper Roster ID
 */
export const validateSleeperRosterId = (rosterId: string, maxRosters: number = 12): SleeperLeagueValidation => {
  const result: SleeperLeagueValidation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!rosterId || rosterId.trim().length === 0) {
    result.warnings.push('Roster ID not provided - will load league data only');
    return result;
  }

  const rosterNum = parseInt(rosterId.trim());
  
  if (isNaN(rosterNum)) {
    result.isValid = false;
    result.errors.push('Roster ID must be a number');
    return result;
  }

  if (rosterNum < 1 || rosterNum > maxRosters) {
    result.isValid = false;
    result.errors.push(`Roster ID must be between 1 and ${maxRosters}`);
    return result;
  }

  return result;
};

/**
 * Validate complete Sleeper configuration
 */
export const validateSleeperConfig = (config: SleeperConfig): SleeperLeagueValidation => {
  const result: SleeperLeagueValidation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Validate League ID
  const leagueValidation = validateSleeperLeagueId(config.leagueId);
  result.errors.push(...leagueValidation.errors);
  result.warnings.push(...leagueValidation.warnings);
  
  if (!leagueValidation.isValid) {
    result.isValid = false;
  }

  // Validate Roster ID if provided
  if (config.rosterId) {
    const rosterValidation = validateSleeperRosterId(config.rosterId);
    result.errors.push(...rosterValidation.errors);
    result.warnings.push(...rosterValidation.warnings);
    
    if (!rosterValidation.isValid) {
      result.isValid = false;
    }
  }

  return result;
};

/**
 * Check if league data indicates an empty/new league
 */
export const isEmptyLeague = (rosters: any[]): boolean => {
  if (!rosters || rosters.length === 0) return true;
  
  // Check if any roster has actual players (not just "0" placeholders)
  const hasActualPlayers = rosters.some(roster => {
    return roster.players && 
           roster.players.length > 0 && 
           roster.players.some((playerId: string) => playerId !== "0");
  });
  
  return !hasActualPlayers;
};