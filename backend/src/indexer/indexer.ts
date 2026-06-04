import { ethers } from "ethers";
import { prisma } from "../db/client";
import {
  ECHO_FACTORY_ABI,
  ECHO_MARKET_ABI,
  ECHO_ARBITRATION_ABI,
  ECHO_ORACLE_ABI,
} from "../utils/abis";

export class EchoIndexer {
  private provider: ethers.Provider;
  private factory: ethers.Contract;
  private arbitration: ethers.Contract;
  private oracle: ethers.Contract;
  private factoryAddress: string;
  private arbitrationAddress: string;
  private oracleAddress: string;

  constructor(
    rpcUrl: string,
    factoryAddress: string,
    arbitrationAddress: string,
    oracleAddress: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.factoryAddress = factoryAddress;
    this.arbitrationAddress = arbitrationAddress;
    this.oracleAddress = oracleAddress;

    this.factory = new ethers.Contract(
      factoryAddress,
      ECHO_FACTORY_ABI,
      this.provider
    );
    this.arbitration = new ethers.Contract(
      arbitrationAddress,
      ECHO_ARBITRATION_ABI,
      this.provider
    );
    this.oracle = new ethers.Contract(
      oracleAddress,
      ECHO_ORACLE_ABI,
      this.provider
    );
  }

  async start() {
    console.log("[Indexer] Starting Echo indexer...");
    await this.indexHistoricalEvents();
    this.subscribeToEvents();
  }

  private async indexHistoricalEvents() {
    const currentBlock = await this.provider.getBlockNumber();
    // For fresh deployments, only index last ~100 blocks.
    // For production, store lastIndexedBlock in DB and resume from there.
    const fromBlock = Math.max(0, currentBlock - 100);

    await this.indexFactoryEvents(fromBlock, currentBlock);
    await this.indexArbitrationEvents(fromBlock, currentBlock);
    await this.indexOracleEvents(fromBlock, currentBlock);
  }

  /**
   * Alchemy free tier limits eth_getLogs to 10 blocks per request.
   * We chunk large ranges into 10-block batches.
   */
  private async queryFilterBatched(
    contract: ethers.Contract,
    eventName: string,
    fromBlock: number,
    toBlock: number
  ): Promise<ethers.EventLog[]> {
    const BATCH_SIZE = 10;
    const allEvents: ethers.EventLog[] = [];

    for (let start = fromBlock; start <= toBlock; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE - 1, toBlock);
      const batch = await contract.queryFilter(
        contract.getEvent(eventName),
        start,
        end
      );
      allEvents.push(...(batch as ethers.EventLog[]));
    }

    return allEvents;
  }

  private async indexFactoryEvents(fromBlock: number, toBlock: number) {
    const events = await this.queryFilterBatched(
      this.factory,
      "MarketCreated",
      fromBlock,
      toBlock
    );

    for (const event of events) {
      await this.handleMarketCreated(event);
    }
  }

  private async indexArbitrationEvents(fromBlock: number, toBlock: number) {
    const events = await this.queryFilterBatched(
      this.arbitration,
      "ExploitSubmitted",
      fromBlock,
      toBlock
    );

    for (const event of events) {
      await this.handleExploitSubmitted(event);
    }
  }

  private async indexOracleEvents(fromBlock: number, toBlock: number) {
    const events = await this.queryFilterBatched(
      this.oracle,
      "RiskUpdated",
      fromBlock,
      toBlock
    );

    for (const event of events) {
      await this.handleRiskUpdated(event);
    }
  }

  private subscribeToEvents() {
    this.factory.on("MarketCreated", async (market, protocol, ...args) => {
      const event = args[args.length - 1];
      await this.handleMarketCreated(event);
    });

    this.arbitration.on(
      "ExploitSubmitted",
      async (submissionId, researcher, market, ipfsCID, event) => {
        await this.handleExploitSubmitted(event);
      }
    );

    this.arbitration.on(
      "ExploitConfirmed",
      async (submissionId, researcher, payout, event) => {
        await this.handleExploitConfirmed(event);
      }
    );

    this.arbitration.on(
      "ExploitRejected",
      async (submissionId, researcher, slashAmount, event) => {
        await this.handleExploitRejected(event);
      }
    );

    this.oracle.on(
      "RiskUpdated",
      async (protocol, riskScore, totalShort, totalLong, event) => {
        await this.handleRiskUpdated(event);
      }
    );
  }

  private async handleMarketCreated(event: ethers.EventLog) {
    const { market, protocol, windowDuration, minStake, maxStake } =
      event.args as any;

    const existing = await prisma.market.findUnique({
      where: { address: market },
    });
    if (existing) return;

    const contract = new ethers.Contract(
      market,
      ECHO_MARKET_ABI,
      this.provider
    );
    const [insuranceBps, openingTime, totalShort, totalLong, status] =
      await Promise.all([
        contract.insuranceBps(),
        contract.openingTime(),
        contract.totalShort(),
        contract.totalLong(),
        contract.status(),
      ]);

    await prisma.market.create({
      data: {
        address: market,
        protocol,
        windowDuration: Number(windowDuration),
        minStake: minStake.toString(),
        maxStake: maxStake.toString(),
        insuranceBps: Number(insuranceBps),
        totalShort: totalShort.toString(),
        totalLong: totalLong.toString(),
        status: ["Open", "Expired", "Exploited"][Number(status)],
        openingTime: new Date(Number(openingTime) * 1000),
      },
    });

    this.subscribeToMarketEvents(market);
    console.log(`[Indexer] Market indexed: ${market}`);
  }

  private subscribeToMarketEvents(marketAddress: string) {
    const contract = new ethers.Contract(
      marketAddress,
      ECHO_MARKET_ABI,
      this.provider
    );

    contract.on(
      "PositionOpened",
      async (positionId, user, posType, amount, entryPrice, event) => {
        const market = await prisma.market.findUnique({
          where: { address: marketAddress },
        });
        if (!market) return;

        await prisma.position.upsert({
          where: { marketId_positionId: { marketId: market.id, positionId: Number(positionId) } },
          update: {},
          create: {
            marketId: market.id,
            positionId: Number(positionId),
            user,
            posType: posType === 0 ? "Short" : "Long",
            amount: amount.toString(),
            entryPrice: entryPrice.toString(),
            openedAt: new Date(),
          },
        });

        await prisma.market.update({
          where: { id: market.id },
          data: {
            totalShort: (await contract.totalShort()).toString(),
            totalLong: (await contract.totalLong()).toString(),
          },
        });
      }
    );

    contract.on("WindowClosed", async (totalShort, totalLong, event) => {
      const market = await prisma.market.findUnique({
        where: { address: marketAddress },
      });
      if (!market) return;

      await prisma.market.update({
        where: { id: market.id },
        data: {
          status: "Expired",
          totalShort: totalShort.toString(),
          totalLong: totalLong.toString(),
        },
      });
    });

    contract.on(
      "ExploitConfirmed",
      async (researcher, researcherBounty, insuranceAmount, event) => {
        const market = await prisma.market.findUnique({
          where: { address: marketAddress },
        });
        if (!market) return;

        await prisma.market.update({
          where: { id: market.id },
          data: { status: "Exploited" },
        });
      }
    );
  }

  private async handleExploitSubmitted(event: ethers.EventLog) {
    const { submissionId, researcher, market, ipfsCID } = event.args as any;

    const dbMarket = await prisma.market.findUnique({
      where: { address: market },
    });
    if (!dbMarket) return;

    await prisma.exploit.upsert({
      where: {
        submissionId_marketId: {
          submissionId: Number(submissionId),
          marketId: dbMarket.id,
        },
      },
      update: {},
      create: {
        submissionId: Number(submissionId),
        marketId: dbMarket.id,
        researcher,
        ipfsCID,
        status: "Pending",
        submittedAt: new Date(),
      },
    });
  }

  private async handleExploitConfirmed(event: ethers.EventLog) {
    const { submissionId } = event.args as any;
    const sub = await this.arbitration.submissions(submissionId);

    const dbMarket = await prisma.market.findUnique({
      where: { address: sub.market },
    });
    if (!dbMarket) return;

    await prisma.exploit.updateMany({
      where: { submissionId: Number(submissionId), marketId: dbMarket.id },
      data: { status: "Confirmed", resolvedAt: new Date() },
    });

    await prisma.researcher.upsert({
      where: { address: sub.researcher },
      update: {
        verifiedFinds: { increment: 1 },
        totalEarned: { increment: Number(sub.slashAmount) },
      },
      create: {
        address: sub.researcher,
        verifiedFinds: 1,
        totalEarned: sub.slashAmount.toString(),
      },
    });
  }

  private async handleExploitRejected(event: ethers.EventLog) {
    const { submissionId } = event.args as any;
    const sub = await this.arbitration.submissions(submissionId);

    const dbMarket = await prisma.market.findUnique({
      where: { address: sub.market },
    });
    if (!dbMarket) return;

    await prisma.exploit.updateMany({
      where: { submissionId: Number(submissionId), marketId: dbMarket.id },
      data: { status: "Rejected", resolvedAt: new Date() },
    });
  }

  private async handleRiskUpdated(event: ethers.EventLog) {
    const { protocol, riskScore, totalShort, totalLong } = event.args as any;

    const market = await prisma.market.findFirst({
      where: { protocol },
    });
    if (!market) return;

    await prisma.riskScore.create({
      data: {
        marketId: market.id,
        protocol,
        score: riskScore.toString(),
        totalShort: totalShort.toString(),
        totalLong: totalLong.toString(),
        timestamp: new Date(),
      },
    });

    await prisma.market.update({
      where: { id: market.id },
      data: {
        totalShort: totalShort.toString(),
        totalLong: totalLong.toString(),
      },
    });
  }
}
