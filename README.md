# Fireblocks Solana Config Manager

[![GitHub Super-Linter](https://github.com/CarteraMesh/fireblocks-config-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/CarteraMesh/fireblocks-config-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/CarteraMesh/fireblocks-config-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/CarteraMesh/fireblocks-config-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/CarteraMesh/fireblocks-config-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/CarteraMesh/fireblocks-config-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A GitHub Action that sets up Fireblocks and Solana configuration files for
testing purposes with automatic cleanup when the workflow completes.

## Features

- 🔧 **Automatic Setup**: Creates Fireblocks and Solana configuration files
- 🧹 **Automatic Cleanup**: Removes all configuration files when the workflow
  ends (even if it fails)
- 🔒 **Secure**: Handles sensitive credentials properly with appropriate file
  permissions
- 📁 **Organized**: Places all config files in standard locations (`~/.config/`)

## Usage

### Basic Usage

```yaml
steps:
  - uses: actions/checkout@v4

  - name: Setup Fireblocks and Solana configs
    uses: CarteraMesh/fireblocks-config-action@v1
    with:
      fireblocks-secret: |
        ${{ secrets.FIREBLOCKS_SECRET }}
      fireblocks-api-key: ${{ secrets.FIREBLOCKS_API_KEY }}

  - name: Run your tests
    run: |
      # Your test commands here
      # Config files are automatically available
```

### With Custom RPC URL

```yaml
steps:
  - name: Setup configs for mainnet testing
    uses: CarteraMesh/fireblocks-config-action@v1
    with:
      fireblocks-secret: ${{ secrets.FIREBLOCKS_SECRET }}
      fireblocks-api-key: ${{ secrets.FIREBLOCKS_API_KEY }}
      fireblocks-vault: '0'
      solana-rpc-url: 'https://api.mainnet-beta.solana.com'
```

### Complete Workflow Example

```yaml
name: Test with Fireblocks

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Fireblocks and Solana configs
        uses: CarteraMesh/fireblocks-config-action@v1
        with:
          fireblocks-secret: |
            ${{ secrets.FIREBLOCKS_SECRET }}
          fireblocks-api-key: ${{ secrets.FIREBLOCKS_API_KEY }}
          fireblocks-vault: ${{ vars.FIREBLOCKS_VAULT }}
          solana-rpc-url: ${{ vars.SOLANA_RPC_URL }}

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      # No cleanup step needed - automatic cleanup happens via post action!
```

## Inputs

| Input                 | Description                                | Required | Default                               |
| --------------------- | ------------------------------------------ | -------- | ------------------------------------- |
| `fireblocks-secret`   | Fireblocks secret key content (PEM format) | ✅       | -                                     |
| `fireblocks-api-key`  | Fireblocks API key                         | ✅       | -                                     |
| `fireblocks-vault`    | Fireblocks vault ID                        | ❌       | `"0"`                                 |
| `fireblocks-endpoint` | Fireblocks API endpoint URL                | ❌       | `"https://sandbox-api.fireblocks.io"` |
| `solana-rpc-url`      | Solana RPC URL                             | ❌       | `"https://api.devnet.solana.com"`     
|
| `poll-timeout`      | how long to wait for sig in seconds                           | ❌       | `90`     
| `poll-interval`      | how often to poll for signature in seconds              | ❌       | `5`     

## Outputs

| Output        | Description                                               |
| ------------- | --------------------------------------------------------- |
| `solana-config-path` | Path to solana cli config |
| `fireblocks-config-path` | Path to fireblocks signer config |

## What Gets Created

The action creates the following files and directories:

```text
~/.config/
├── fireblocks/
│   ├── default.toml
│   ├── sandbox.toml
│   └── sandbox.pem
└── solana/
    ├── cli/
    │   └── config.yml
    └── id.json
```

### File Contents

**Fireblocks Config** (`~/.config/fireblocks/default.toml` & `sandbox.toml`):

```toml
api_key = "your-api-key"
secret_path = "~/.config/fireblocks/sandbox.pem"
url = "https://sandbox-api.fireblocks.io"
[display]
output = "Table"
[signer]
poll_timeout = 120
poll_interval = 5
vault = "your-vault-id"
```

**Solana Config** (`~/.config/solana/cli/config.yml`):

```yaml
---
keypair_path: 'fireblocks://default'
websocket_url: 'wss://api.devnet.solana.com'
commitment: finalized
json_rpc_url: your-rpc-url
```

## Automatic Cleanup

The action automatically cleans up **all** created files when the workflow step
completes, regardless of success or failure. This includes:

- `~/.config/fireblocks/` (entire directory)
- `~/.config/solana/` (entire directory)

No manual cleanup step is required!

## Security Notes

- The Fireblocks secret key file (`sandbox.pem`) is created with `600`
  permissions (owner read/write only)
- All sensitive files are automatically removed after the workflow completes
- Secrets should be stored in GitHub repository secrets, not hardcoded in
  workflows

## Requirements

- Runs on: `ubuntu-latest`, `macos-latest`, `windows-latest`
- Node.js 20+ (automatically provided by GitHub Actions)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Build: `npm run build`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
