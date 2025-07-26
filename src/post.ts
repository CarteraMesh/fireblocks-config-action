import * as core from '@actions/core'
import { execSync } from 'child_process'

/**
 * The post function for the action.
 * Cleans up all created configuration files and directories.
 */
export async function run(): Promise<void> {
  try {
    core.info('🧹 Starting cleanup of configuration files...')

    // Remove config directories (this will also remove sandbox.pem)
    execSync('rm -rf ~/.config/solana ~/.config/fireblocks', {
      stdio: 'inherit'
    })
    core.info('🗑️  Removed: ~/.config/solana and ~/.config/fireblocks')

    core.info('✨ Cleanup completed successfully!')
  } catch (error) {
    // Don't fail the workflow if cleanup fails, just warn
    if (error instanceof Error) {
      core.warning(`Cleanup encountered an issue: ${error.message}`)
    }
  }
}
