import type { Player, LeagueData } from "@/pages/Index";

// Coefficient of variation benchmarks based on ESPN data research
export const cvBenchmarks = {
  QB: 0.42,
  RB: 0.52,
  WR: 0.60,
  TE: 0.48
};

// Demo data with realistic fantasy football metrics
export const generateDemoData = (): LeagueData => {
  const availablePlayers: Player[] = [
    { 
      name: "Gus Edwards", 
      position: "RB", 
      seasonAvg: 12.4, 
      recentAvg: 15.8, 
      weeklyScores: [8.2, 14.7, 11.3, 9.8, 13.5, 14.2, 16.4, 15.2, 15.8, 16.1],
      ownership: 12.3,
      expertRank: 28,
      advancedRank: 18,
      targetShare: 0.0,
      snapShare: 45.2,
      redZoneShares: 3
    },
    { 
      name: "Romeo Doubs", 
      position: "WR", 
      seasonAvg: 8.9, 
      recentAvg: 12.4, 
      weeklyScores: [6.2, 4.8, 11.3, 7.5, 9.8, 8.1, 12.8, 11.9, 12.4, 12.5],
      ownership: 8.7,
      expertRank: 45,
      advancedRank: 32,
      targetShare: 0.18,
      snapShare: 72.1,
      redZoneShares: 2
    },
    { 
      name: "Tucker Kraft", 
      position: "TE", 
      seasonAvg: 7.2, 
      recentAvg: 9.8, 
      weeklyScores: [5.4, 8.9, 6.7, 7.8, 6.2, 7.5, 9.1, 9.8, 10.2, 9.5],
      ownership: 5.2,
      expertRank: 18,
      advancedRank: 12,
      targetShare: 0.12,
      snapShare: 68.4,
      redZoneShares: 4
    },
    { 
      name: "Jaylen Warren", 
      position: "RB", 
      seasonAvg: 9.8, 
      recentAvg: 11.2, 
      weeklyScores: [11.2, 8.4, 9.7, 10.1, 8.9, 9.5, 11.8, 10.9, 11.4, 11.1],
      ownership: 15.8,
      expertRank: 35,
      advancedRank: 29,
      targetShare: 0.08,
      snapShare: 38.7,
      redZoneShares: 2
    },
    { 
      name: "Darnell Mooney", 
      position: "WR", 
      seasonAvg: 11.1, 
      recentAvg: 13.2, 
      weeklyScores: [9.8, 12.4, 10.7, 11.5, 9.9, 11.8, 13.8, 12.7, 13.1, 13.1],
      ownership: 22.4,
      expertRank: 38,
      advancedRank: 25,
      targetShare: 0.22,
      snapShare: 89.3,
      redZoneShares: 1
    },
    {
      name: "Chuba Hubbard",
      position: "RB",
      seasonAvg: 10.5,
      recentAvg: 14.3,
      weeklyScores: [7.8, 9.2, 11.4, 8.9, 12.7, 13.1, 15.8, 13.9, 14.2, 14.8],
      ownership: 18.6,
      expertRank: 42,
      advancedRank: 31,
      targetShare: 0.05,
      snapShare: 52.3,
      redZoneShares: 3
    },
    {
      name: "Quentin Johnston",
      position: "WR",
      seasonAvg: 6.8,
      recentAvg: 10.2,
      weeklyScores: [4.2, 5.8, 6.1, 8.9, 7.2, 8.5, 10.8, 9.6, 10.2, 10.5],
      ownership: 3.7,
      expertRank: 62,
      advancedRank: 41,
      targetShare: 0.15,
      snapShare: 65.4,
      redZoneShares: 2
    },
    {
      name: "Jalen Tolbert",
      position: "WR",
      seasonAvg: 8.3,
      recentAvg: 11.8,
      weeklyScores: [5.9, 7.2, 8.8, 6.4, 9.1, 10.2, 12.4, 11.1, 11.8, 12.0],
      ownership: 9.2,
      expertRank: 51,
      advancedRank: 38,
      targetShare: 0.19,
      snapShare: 78.6,
      redZoneShares: 1
    }
  ];

  const myRoster: Player[] = [
    {
      name: "Josh Allen",
      position: "QB",
      seasonAvg: 24.8,
      recentAvg: 26.2,
      weeklyScores: [22.4, 26.7, 23.1, 19.8, 25.5, 24.2, 28.4, 25.2, 26.2, 27.1],
      ownership: 95.3,
      expertRank: 3,
      advancedRank: 2,
      targetShare: 0.0,
      snapShare: 100.0,
      redZoneShares: 8
    },
    {
      name: "Christian McCaffrey",
      position: "RB",
      seasonAvg: 21.7,
      recentAvg: 18.9,
      weeklyScores: [18.2, 24.7, 21.3, 16.8, 19.5, 20.2, 17.4, 19.2, 18.9, 18.1],
      ownership: 98.7,
      expertRank: 1,
      advancedRank: 4,
      targetShare: 0.12,
      snapShare: 82.1,
      redZoneShares: 6
    }
  ];

  return {
    teams: [],
    availablePlayers,
    myRoster,
    allPlayers: [...availablePlayers, ...myRoster]
  };
};