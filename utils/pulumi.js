const pulumi = require('@pulumi/pulumi');
const gcp = require('@pulumi/gcp');
const logger = require('./logger');
require('dotenv').config();

/**
 * Configure Pulumi stack with GCP credentials using refresh token
 * @param {string} refreshToken - The OAuth2 refresh token
 * @param {string} projectId - The GCP project ID
 * @param {string} stackName - The Pulumi stack name
 * @returns {Promise<pulumi.automation.Stack>} - The configured Pulumi stack
 */
const configureStack = async (refreshToken, projectId, stackName) => {
  try {
    logger.info(`Configuring Pulumi stack: ${stackName}`, {
      data: { projectId }
    });

    // Check if Pulumi access token is set
    if (!process.env.PULUMI_ACCESS_TOKEN) {
      throw new Error('PULUMI_ACCESS_TOKEN environment variable is not set. Please set it in your .env file.');
    }

    // Create or select stack
    const stack = await pulumi.automation.LocalWorkspace.createOrSelectStack({
      stackName,
      projectName: process.env.PULUMI_PROJECT || 'gbq-integration',
      program: async () => {
        // This function defines the Pulumi program to run
        return createPulumiProgram(projectId);
      },
      // Explicitly pass environment variables to ensure they're available
      envVars: {
        PULUMI_ACCESS_TOKEN: process.env.PULUMI_ACCESS_TOKEN
      }
    });

    // Set GCP credentials using refresh token
    await stack.setConfig('gcp:credentials', {
      value: JSON.stringify({
        type: 'authorized_user',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
      secret: true // Mark as secret to avoid logging
    });

    // Set GCP project
    await stack.setConfig('gcp:project', {
      value: projectId
    });

    logger.info(`Pulumi stack ${stackName} configured successfully`);
    return stack;
  } catch (error) {
    logger.error('Error configuring Pulumi stack', {
      data: { error: error.message, stack: error.stack }
    });
    throw error;
  }
};

/**
 * Create the Pulumi program for BigQuery dataset access
 * @param {string} projectId - The GCP project ID
 * @returns {Promise<void>}
 */
const createPulumiProgram = async (projectId) => {
  // This is where you define your Pulumi resources
  // For example, granting access to BigQuery datasets
  
  // Example: Create a service account for BigQuery access
  // const serviceAccount = new gcp.serviceaccount.Account('bq-service-account', {
  //   accountId: `bq-access-${Date.now()}`,
  //   displayName: 'BigQuery Access Service Account',
  // });

  // Example: Grant BigQuery Data Viewer role to the service account
  const iamBinding = new gcp.projects.IAMBinding('bq-viewer-binding', {
    project: projectId,
    role: 'roles/bigquery.dataViewer',
    members: [
      pulumi.interpolate`serviceAccount:integration@icustomer-warahouse.iam.gserviceaccount.com`,
    ],
  });

  // Return any outputs you want to expose
  return {
    serviceAccountEmail: serviceAccount.email,
    projectId: projectId,
  };
};

/**
 * Deploy a Pulumi stack
 * @param {pulumi.automation.Stack} stack - The configured Pulumi stack
 * @returns {Promise<pulumi.automation.OutputMap>} - The deployment results
 */
const deployStack = async (stack) => {
  try {
    logger.info(`Deploying Pulumi stack: ${stack.name}`);
    
    // Run pulumi up
    const upResult = await stack.up({
      onOutput: (output) => {
        logger.info(`Pulumi: ${output}`);
      }
    });
    
    logger.info('Pulumi deployment completed successfully', {
      data: {
        summary: upResult.summary,
        outputs: Object.keys(upResult.outputs)
      }
    });
    
    return upResult.outputs;
  } catch (error) {
    logger.error('Error deploying Pulumi stack', {
      data: { error: error.message, stack: error.stack }
    });
    throw error;
  }
};

/**
 * Grant access to a BigQuery dataset using Pulumi
 * @param {string} refreshToken - The OAuth2 refresh token
 * @param {string} projectId - The GCP project ID
 * @param {string} datasetId - The BigQuery dataset ID
 * @returns {Promise<object>} - The deployment results
 */
const grantBigQueryAccess = async (refreshToken, projectId, datasetId) => {
  try {
    // Create a unique stack name for this tenant and dataset
    const stackName = `tenant-${projectId}-${datasetId}`;
    
    // Configure the stack with credentials
    const stack = await configureStack(refreshToken, projectId, stackName);
    
    // Deploy the stack
    const outputs = await deployStack(stack);
    
    return {
      success: true,
      stackName,
      outputs: outputs
    };
  } catch (error) {
    logger.error('Error granting BigQuery access', {
      data: { 
        projectId,
        datasetId,
        error: error.message,
        stack: error.stack
      }
    });
    
    throw error;
  }
};

module.exports = {
  configureStack,
  deployStack,
  grantBigQueryAccess
};
