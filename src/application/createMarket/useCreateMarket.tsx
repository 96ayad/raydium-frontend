import { MAINNET_PROGRAM_ID, PublicKeyish } from '@raydium-io/raydium-sdk'

import { create } from 'zustand'

import toPubString from '@/functions/format/toMintString'
import { Numberish } from '@/types/constants'

import { SplToken } from '../token/type'

export type CreateMarket = {
  programId: string
  baseToken?: SplToken
  quoteToken?: SplToken
  minimumOrderSize: Numberish
  tickSize: Numberish

  newCreatedMarketId?: PublicKeyish
}

export const useCreateMarket = create<CreateMarket>((set) => ({
  ////////////ayad//////////////////
  // programId: toPubString(MAINNET_PROGRAM_ID.OPENBOOK_MARKET),
  programId: toPubString("EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj"),
  minimumOrderSize: 1,
  tickSize: 0.01
}))
