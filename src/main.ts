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
    const fireblocksSecret = core.getInput('fireblocks-secret', {
      required: true
    })
    const fireblocksApiKey = core.getInput('fireblocks-api-key', {
      required: true
    })
    const fireblocksVault = core.getInput('fireblocks-vault', {
      required: true
    })
    const fireblocksEndpoint =
      core.getInput('fireblocks-endpoint', {
        required: false
      }) || 'https://sandbox-api.fireblocks.io'
    const commitment =
      core.getInput('commitment', {
        required: false
      }) || 'finalized'

    const pollTimeout =
      core.getInput('poll-timeout', {
        required: false
      }) || '120'
    const pollInterval =
      core.getInput('poll-interval', {
        required: false
      }) || '5'
    const rpcUrl = core.getInput('solana-rpc-url', { required: true })
    const setEnvVars = core.getBooleanInput('set-env-vars')

    core.info(`Using fireblocks endpoint ${fireblocksEndpoint}`)
    core.info('🔧 Setting up Fireblocks and Solana configuration files...')

    // Export enviro  nment variables if requested
    if (setEnvVars) {
      core.exportVariable('FIREBLOCKS_SECRET', fireblocksSecret)
      core.exportVariable('FIREBLOCKS_API_KEY', fireblocksApiKey)
      core.exportVariable('FIREBLOCKS_VAULT', fireblocksVault)
      core.exportVariable('FIREBLOCKS_ENDPOINT', fireblocksEndpoint)
      core.exportVariable('FIREBLOCKS_DEVNET', 'true')
      core.exportVariable('FIREBLOCKS_POLL_TIMEOUT', pollTimeout)
      core.exportVariable('FIREBLOCKS_POLL_INTERVAL', pollInterval)
      core.exportVariable('RPC_URL', rpcUrl)
      core.exportVariable('COMMITMENT', commitment)
      core.info('✅ Exported environment variables')
    }

    // Create directories
    const homeDir = process.env.FAKE ? '/tmp' : os.homedir()
    core.info(`using $HOME ${homeDir}`)
    // detect macOS and put in  'Library/Application Support/
    const fireblocksConfigDir =
      process.platform === 'darwin'
        ? path.join(homeDir, 'Library', 'Application Support', 'fireblocks')
        : path.join(homeDir, '.config', 'fireblocks')
    const solanaConfigDir = path.join(homeDir, '.config', 'solana', 'cli')

    fs.mkdirSync(fireblocksConfigDir, { recursive: true })
    fs.mkdirSync(solanaConfigDir, { recursive: true })

    // Write Fireblocks secret key to ~/.config/fireblocks/
    const secretPath = path.join(fireblocksConfigDir, 'sandbox.pem')
    fs.writeFileSync(secretPath, fireblocksSecret, { mode: 0o600 })
    core.info('✅ Created Fireblocks secret key file')

    // Create Fireblocks config
    const fireblocksConfig = `api_key = "${fireblocksApiKey}"
secret_path = "${secretPath}"
url = "${fireblocksEndpoint}"
[display]
output = "Table"
[signer]
poll_timeout = ${pollTimeout}
poll_interval = ${pollInterval}
vault = "${fireblocksVault}"

[extra]
solana_rpc_url = "${rpcUrl}"`

    const fireblocksConfigPath = path.join(fireblocksConfigDir, 'default.toml')
    const sandboxConfigPath = path.join(fireblocksConfigDir, 'sandbox.toml')

    fs.writeFileSync(fireblocksConfigPath, fireblocksConfig)
    fs.writeFileSync(sandboxConfigPath, fireblocksConfig)
    core.info(
      `✅ Created Fireblocks configuration files ${fireblocksConfigPath} and ${sandboxConfigPath}`
    )

    // Create Solana config
    const solanaConfig = `---
keypair_path: "fireblocks://default"
websocket_url: "wss://api.devnet.solana.com"
commitment: ${commitment}
json_rpc_url: ${rpcUrl}`

    const solanaConfigPath = path.join(solanaConfigDir, 'config.yml')
    fs.writeFileSync(solanaConfigPath, solanaConfig)
    core.info(`✅ Created Solana configuration file ${solanaConfigPath}`)

    // Create Solana keypair file (fake keypair for testing)
    const solanaKeypair =
      '[142,66,83,178,186,150,12,117,220,68,184,164,196,191,93,214,80,246,160,55,81,158,122,197,73,49,97,86,229,65,96,235,101,155,178,255,13,45,251,194,5,242,23,233,109,19,157,253,56,175,36,184,43,68,233,90,44,76,24,205,176,2,213,130]'
    const solanaKeypairPath = path.join(solanaConfigDir, '..', 'id.json')
    fs.writeFileSync(solanaKeypairPath, solanaKeypair)
    core.info(`✅ Created Solana keypair file ${solanaKeypairPath}`)

    // Set output
    core.setOutput('solana-config-path', solanaConfigPath)
    core.setOutput('fireblocks-config-path', fireblocksConfigPath)

    core.info('🎉 Configuration setup completed successfully!')
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(`Failed to setup configuration: ${error.message}`)
    }
  }
}
