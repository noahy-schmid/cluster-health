import "dotenv/config";

import { Command } from "commander";

import { cleanupPr } from "./commands/cleanup-pr.js";
import { deployProduction } from "./commands/deploy-production.js";
import { deployStaging } from "./commands/deploy-staging.js";
import { deployPr } from "./commands/deploy-pr.js";
import { loadDeploymentConfig } from "./config.js";

const program = new Command();

program
  .name("deinsalon-deploy")
  .description("CLI for deploying deinsalon services to Coolify")
  .version("0.0.0");

program
  .command("deploy-pr")
  .description(
    "Create/update and deploy a PR environment in the Coolify development project",
  )
  .requiredOption("--pr-number <number>", "Pull request number", parseInt)
  .action(async (opts: { prNumber: number }) => {
    const config = loadDeploymentConfig();
    await deployPr({ prNumber: opts.prNumber, config });
  });

program
  .command("deploy-staging")
  .description("Trigger redeployment of all staging services in Coolify")
  .action(async () => {
    const config = loadDeploymentConfig();
    await deployStaging({ config });
  });

program
  .command("deploy-production")
  .description("Trigger redeployment of all production services in Coolify")
  .action(async () => {
    const config = loadDeploymentConfig();
    await deployProduction({ config });
  });

program
  .command("cleanup-pr")
  .description("Delete all Coolify applications created for a closed PR")
  .requiredOption("--pr-number <number>", "Pull request number", parseInt)
  .action(async (opts: { prNumber: number }) => {
    const config = loadDeploymentConfig();
    await cleanupPr({ prNumber: opts.prNumber, config });
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
