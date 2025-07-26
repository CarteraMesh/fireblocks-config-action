import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

/**
 * The main function for the action.
 * Sets up Fireblocks and Solana configuration files.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    const fireblocksSecret = core.getInput('fireblocks-secret')
    const fireblocksApiKey = core.getInput('fireblocks-api-key')
    const fireblocksVault = core.getInput('fireblocks-vault')
    const rpcUrl = core.getInput('solana-rpc-url')

    core.info('🔧 Setting up Fireblocks and Solana configuration files...')

    // Create directories
    const homeDir = os.homedir()
    const fireblocksConfigDir = path.join(homeDir, '.config', 'fireblocks')
    const solanaConfigDir = path.join(homeDir, '.config', 'solana', 'cli')

    fs.mkdirSync(fireblocksConfigDir, { recursive: true })
    fs.mkdirSync(solanaConfigDir, { recursive: true })

    // Write Fireblocks secret key to ~/.config/fireblocks/
    const secretPath = path.join(fireblocksConfigDir, 'sandbox.pem')
    fs.writeFileSync(secretPath, fireblocksSecret, { mode: 0o600 })
    core.info('✅ Created Fireblocks secret key file')

    // Create Fireblocks config
    const fireblocksConfig = `api_key = "${fireblocksApiKey}"
secret_path = "~/.config/fireblocks/sandbox.pem"
url = "https://sandbox-api.fireblocks.io"
[display]
output = "Table"
[signer]
poll_timeout = 120
poll_interval = 5
vault = "${fireblocksVault}"`

    const defaultConfigPath = path.join(fireblocksConfigDir, 'default.toml')
    const sandboxConfigPath = path.join(fireblocksConfigDir, 'sandbox.toml')

    fs.writeFileSync(defaultConfigPath, fireblocksConfig)
    fs.writeFileSync(sandboxConfigPath, fireblocksConfig)
    core.info('✅ Created Fireblocks configuration files')

    // Create Solana config
    const solanaConfig = `---
keypair_path: "fireblocks://default"
websocket_url: "wss://api.devnet.solana.com"
commitment: finalized
json_rpc_url: ${rpcUrl}`

    const solanaConfigPath = path.join(solanaConfigDir, 'config.yml')
    fs.writeFileSync(solanaConfigPath, solanaConfig)
    core.info('✅ Created Solana configuration file')

    // Create Solana keypair file (fake keypair for testing)
    const solanaKeypair =
      '[142,66,83,178,186,150,12,117,220,68,184,164,196,191,93,214,80,246,160,55,81,158,122,197,73,49,97,86,229,65,96,235,101,155,178,255,13,45,251,194,5,242,23,233,109,19,157,253,56,175,36,184,43,68,233,90,44,76,24,205,176,2,213,130]'
    const solanaKeypairPath = path.join(solanaConfigDir, '..', 'id.json')
    fs.writeFileSync(solanaKeypairPath, solanaKeypair)
    core.info('✅ Created Solana keypair file')

    // Set output
    core.setOutput('config-path', path.join(homeDir, '.config'))

    core.info('🎉 Configuration setup completed successfully!')
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(`Failed to setup configuration: ${error.message}`)
    }
  }
}
