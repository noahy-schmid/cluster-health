/**
 * Schema configuration for auth-domain
 * Supports deployment prefixes for PR/staging deployments
 */

// Support for deployment prefixes (PR deployments, staging, etc.)
const deploymentPrefix = process.env.DEPLOYMENT_PREFIX || "";

// Get schema name with optional prefix
export const getSchemaName = (baseSchema: string): string => {
  if (!deploymentPrefix) {
    return baseSchema;
  }
  return `${deploymentPrefix}_${baseSchema}`;
};

// Export the current schema name for this domain
export const AUTH_SCHEMA_NAME = getSchemaName("auth");
