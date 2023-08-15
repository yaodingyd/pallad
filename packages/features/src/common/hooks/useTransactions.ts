import { MinaNetwork } from '@palladxyz/key-management'
import useSWR from 'swr'

import { useWallet } from '../../wallet/hooks/useWallet'
import { useAppStore } from '../../wallet/store/app'

export const useTransactions = () => {
  const { wallet } = useWallet()
  const address = wallet.getCurrentWallet()?.address
  const network = useAppStore((state) => state.network)
  return useSWR(
    address ? [address, 'transactions', MinaNetwork[network]] : null,
    async () => await wallet.getTransactions()
  )
}
