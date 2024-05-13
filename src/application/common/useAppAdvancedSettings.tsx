///////////ayad///////////////
// import { MAINNET_PROGRAM_ID, RAYDIUM_MAINNET } from '@raydium-io/raydium-sdk'
import { DEVNET_PROGRAM_ID, RAYDIUM_MAINNET } from '@raydium-io/raydium-sdk'

import { create } from 'zustand'
import { ApiConfig } from './apiUrl.config'
import { getLocalItem } from '@/functions/dom/jStorage'

///////////ayad///////////////////////
// export const DEFAULT_URL_ENDPOINT = 'https://uapi.raydium.io'
export const DEFAULT_URL_ENDPOINT = 'https://simple-crud-app-backend.onrender.com'

export type AppAdvancedSettingsStore = {
  mode: 'mainnet' | 'devnet'
  programIds: typeof DEVNET_PROGRAM_ID
  readonly apiUrls: {

    //////////ayad///////////////
    // [K in keyof ApiConfig]: `https://uapi.raydium.io/${K}`
    [K in keyof ApiConfig]: `https://simple-crud-app-backend.onrender.com/${K}`
  }
  apiUrlOrigin: string
  apiUrlPathnames: typeof RAYDIUM_MAINNET
}

export const useAppAdvancedSettings = create<AppAdvancedSettingsStore>((set, get) => ({
  mode: getLocalItem('ADVANCED_SETTINGS_TAB') ?? 'mainnet',
  programIds: DEVNET_PROGRAM_ID,
  get apiUrls() {
    return new Proxy({} as any, {
      get(target, p, receiver) {
        return `${get().apiUrlOrigin}${get().apiUrlPathnames[p]}`
      }
    })
  },
  apiUrlOrigin: getLocalItem('ADVANCED_SETTINGS_ENDPOINT') ?? DEFAULT_URL_ENDPOINT,
  apiUrlPathnames: RAYDIUM_MAINNET
}))

export default useAppAdvancedSettings
