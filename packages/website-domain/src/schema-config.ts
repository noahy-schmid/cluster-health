/**
 * Schema configuration for website-domain
 * Supports deployment prefixes for PR/staging deployments
 */

// Support for deployment prefixes (PR deployments, staging, etc.)
const deploymentPrefix = process.env.DEPLOYMENT_PREFIX || "";

// Get schema name with optional prefix
// For website-domain, we use 'public' as base schema, but with prefix we use a custom schema
export const getSchemaName = (): string => {
  if (!deploymentPrefix) {
    return "public";
  }
  return `${deploymentPrefix}_website`;
};

// Export the current schema name for this domain
export const WEBSITE_SCHEMA_NAME = getSchemaName();
