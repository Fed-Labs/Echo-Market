import "dotenv/config";
import { createServer } from "./api/server";
import { EchoIndexer } from "./indexer/indexer";

const PORT = process.env.PORT || "4000";
const RPC_URL = process.env.RPC_URL || "https://base-mainnet.g.alchemy.com/v2/demo";
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "";
const ARBITRATION_ADDRESS = process.env.ARBITRATION_ADDRESS || "";
const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS || "";

async function main() {
  if (!FACTORY_ADDRESS || !ARBITRATION_ADDRESS || !ORACLE_ADDRESS) {
    console.warn("[Main] Contract addresses not fully configured. Running in demo mode.");
  }

  const app = createServer();

  // Start indexer if addresses are configured
  if (FACTORY_ADDRESS && ARBITRATION_ADDRESS && ORACLE_ADDRESS) {
    const indexer = new EchoIndexer(
      RPC_URL,
      FACTORY_ADDRESS,
      ARBITRATION_ADDRESS,
      ORACLE_ADDRESS
    );
    await indexer.start();
  }

  app.listen(PORT, () => {
    console.log(`[Main] Echo API listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("[Main] Fatal error:", err);
  process.exit(1);
});
