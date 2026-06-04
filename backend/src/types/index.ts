export interface MarketData {
  address: string;
  protocol: string;
  windowDuration: number;
  minStake: string;
  maxStake: string;
  insuranceBps: number;
  totalShort: string;
  totalLong: string;
  status: "Open" | "Expired" | "Exploited";
  riskScore: number;
  openingTime: string;
}

export interface PositionData {
  positionId: number;
  user: string;
  posType: "Short" | "Long";
  amount: string;
  entryPrice: string;
  openedAt: string;
  claimed: boolean;
}

export interface ExploitData {
  submissionId: number;
  researcher: string;
  market: string;
  ipfsCID: string;
  status: "Pending" | "Confirmed" | "Rejected";
  submittedAt: string;
  slashAmount: string;
}

export interface RiskPoint {
  score: number;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  verifiedFinds: number;
  totalEarned: string;
  winRate: number;
  openPositions: number;
}
