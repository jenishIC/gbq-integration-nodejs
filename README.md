# Google BigQuery Integration

A secure NodeJS Express backend with React client for integrating with Google BigQuery using OAuth2 and Pulumi Automation API.

## Features

- **Secure OAuth2 Implementation**: Properly handles refresh tokens for long-term access
- **Pulumi Automation API**: Programmatically deploys infrastructure without shell commands
- **Enhanced Security**: Includes security headers, CORS protection, and secure token handling
- **Comprehensive Logging**: Logs operations while masking sensitive information
- **Token Management**: Automatically handles token expiry and refresh

## Prerequisites

- Node.js (v14 or higher)
- Google Cloud Platform account with BigQuery enabled
- Pulumi account and CLI installed
- Google OAuth2 credentials (client ID and client secret)

## Pulumi Setup

1. **Install Pulumi CLI**:
   - Follow the installation instructions at [Pulumi Installation Guide](https://www.pulumi.com/docs/install/)
   - Verify installation with `pulumi version`

2. **Create a Pulumi Account**:
   - Sign up at [app.pulumi.com](https://app.pulumi.com/signup) if you don't have an account

3. **Get Your Pulumi Access Token**:
   - Log in to [app.pulumi.com](https://app.pulumi.com/)
   - Go to Settings → Access Tokens
   - Create a new access token
   - Copy the token and add it to your `.env` file as `PULUMI_ACCESS_TOKEN`

4. **Login to Pulumi CLI** (optional, for testing):
   ```bash
   pulumi login
   ```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd poc-gbq-integration
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   ```
   
   Edit the `.env` file with your Google OAuth credentials and Pulumi configuration.

## Configuration

Update the `.env` file with the following information:

```
# Google OAuth credentials
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REDIRECT_URI=http://localhost:3000/oauth2callback

# Pulumi configuration
PULUMI_ORG=your_pulumi_org
PULUMI_PROJECT=your_pulumi_project
PULUMI_ACCESS_TOKEN=your_pulumi_access_token

# Server configuration
PORT=3000
NODE_ENV=development

# Frontend URL for CORS and redirects
FRONTEND_URL=http://localhost:5173

# Log level
LOG_LEVEL=info
```

## Usage

### Backend Only

```
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Frontend Only

```
# Start the React client
npm run client
```

### Full Stack Development

```
# Run both backend and frontend concurrently
npm run dev:all
```

### Testing

The project includes test scripts to verify the OAuth flow and Pulumi integration:

```
# Test OAuth flow
npm run test:oauth

# Test Pulumi Automation API
npm run test:pulumi
```

## Project Structure

```
poc-gbq-integration/
├── client/                 # React client application
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # React components
│       └── services/       # API services
├── utils/                  # Backend utilities
│   ├── logger.js           # Logging utility
│   ├── oauth.js            # OAuth token management
│   └── pulumi.js           # Pulumi automation
├── test/                   # Test scripts
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── index.js                # Main backend application
└── package.json            # Project dependencies and scripts
```

## API Endpoints

### Authentication

- **GET /auth**: Redirects to Google OAuth consent screen
- **GET /oauth2callback**: Handles OAuth callback and returns refresh token

### BigQuery Access Management

- **POST /grant-access**: Grants access to a BigQuery dataset using Pulumi
  ```json
  {
    "refreshToken": "your_refresh_token",
    "projectId": "gcp_project_id",
    "datasetId": "bigquery_dataset_id"
  }
  ```

### Token Management

- **POST /revoke**: Revokes an OAuth token
  ```json
  {
    "token": "token_to_revoke"
  }
  ```

## Security Features

- **Helmet**: Adds security headers to protect against common vulnerabilities
- **CORS**: Restricts cross-origin requests to trusted sources
- **Secure Token Handling**: Properly manages refresh tokens
- **Sensitive Data Masking**: Prevents logging of sensitive information

## Error Handling

The application includes comprehensive error handling for:
- OAuth authentication failures
- Pulumi deployment issues
- Token expiry and refresh problems
- General server errors

## Troubleshooting

### Pulumi Issues

- **"Command failed with ENOENT: pulumi version"**: Ensure Pulumi CLI is installed and in your PATH. Install it following the [Pulumi Installation Guide](https://www.pulumi.com/docs/install/).

- **"PULUMI_ACCESS_TOKEN must be set for login during non-interactive CLI sessions"**: Add your Pulumi access token to the `.env` file:
  ```
  PULUMI_ACCESS_TOKEN=your_pulumi_access_token
  ```
  You can get your access token from [app.pulumi.com](https://app.pulumi.com/) under Settings → Access Tokens.

- **Stack creation failures**: Ensure your GCP credentials are valid and have the necessary permissions. The service account needs permissions to create resources in the specified project.

### OAuth Issues

- **No refresh token received**: Ensure you're using the correct OAuth scopes and that the `access_type` is set to `offline` and `prompt` is set to `consent`.

- **Token expiry issues**: The application automatically handles token refresh, but ensure your refresh token is valid and not revoked.

## License

ISC
