export const ECHO_FACTORY_ABI = [
  "event MarketCreated(address indexed market, address indexed protocol, uint256 windowDuration, uint256 minStake, uint256 maxStake)",
  "function allMarkets(uint256) view returns (address)",
  "function marketCount() view returns (uint256)",
  "function marketByProtocol(address) view returns (address)",
  "function isOracleActive(address) view returns (bool)",
];

export const ECHO_MARKET_ABI = [
  "event PositionOpened(uint256 indexed positionId, address indexed user, uint8 posType, uint256 amount, uint256 entryPrice)",
  "event WindowClosed(uint256 totalShort, uint256 totalLong)",
  "event ExploitConfirmed(address indexed researcher, uint256 researcherBounty, uint256 insuranceAmount)",
  "event Claimed(uint256 indexed positionId, address indexed user, uint256 amount)",
  "function protocol() view returns (address)",
  "function windowDuration() view returns (uint256)",
  "function minStake() view returns (uint256)",
  "function maxStake() view returns (uint256)",
  "function insuranceBps() view returns (uint256)",
  "function totalShort() view returns (uint256)",
  "function totalLong() view returns (uint256)",
  "function status() view returns (uint8)",
  "function openingTime() view returns (uint256)",
  "function currentRiskScore() view returns (uint256)",
];

export const ECHO_ARBITRATION_ABI = [
  "event ExploitSubmitted(uint256 indexed submissionId, address indexed researcher, address indexed market, bytes32 ipfsCID)",
  "event ExploitConfirmed(uint256 indexed submissionId, address indexed researcher, uint256 payout)",
  "event ExploitRejected(uint256 indexed submissionId, address indexed researcher, uint256 slashAmount)",
  "event GuardianVoted(uint256 indexed submissionId, address indexed guardian, bool confirm)",
  "function submissions(uint256) view returns (address researcher, address market, bytes32 ipfsCID, bytes calldataPayload, uint256 submittedAt, uint8 status, uint256 slashAmount)",
];

export const ECHO_ORACLE_ABI = [
  "event RiskUpdated(address indexed protocol, uint256 riskScore, uint256 totalShort, uint256 totalLong)",
  "function getTWAP(address protocol) view returns (uint256)",
  "function latestRoundData(address protocol) view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
];
