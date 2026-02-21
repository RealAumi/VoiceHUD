import type { ProviderConfig } from './providers'
import {
  getProvider,
  setProvider,
  isProviderConfigured as isConfigured,
} from '#/lib/store/app-store'

export function getStoredProvider(): ProviderConfig {
  return getProvider()
}

export function setStoredProvider(config: ProviderConfig) {
  setProvider(config)
}

/** Check if the provider has a valid API key configured */
export function isProviderConfigured(): boolean {
  return isConfigured()
}
