import { Button, Label } from '@palladxyz/ui'
import easyMeshGradient from 'easy-mesh-gradient'
import { useNavigate } from 'react-router-dom'
import { CopyIcon } from 'lucide-react'

import { truncateString } from '../../common/lib/string'

interface OverviewCardProps {
  walletAddress: string
}

export const OverviewCard = ({ walletAddress }: OverviewCardProps) => {
  const navigate = useNavigate()
  // const { data: accountQuery, isLoading: accountLoading } = useAccount()
  // const account = accountQuery?.result?.data?.account
  // const { data: priceQuery, isLoading: fiatPriceLoading } = useFiatPrice()
  // const isLoading = accountLoading || fiatPriceLoading
  // const rawTotalBalance = parseFloat(account?.balance?.total)
  // const totalBalance = rawTotalBalance ? rawTotalBalance.toFixed(4) : '0'
  // const rawFiatPrice = parseFloat(priceQuery?.['mina-protocol']?.usd)
  // const rawFiatBalance = useMemo(
  //   () => rawTotalBalance * rawFiatPrice || 0,
  //   [rawTotalBalance, rawFiatPrice]
  // )
  // const fiatBalance = rawFiatBalance ? rawFiatBalance.toFixed(2) : '0'
  const meshGradientBright = easyMeshGradient({
    seed: walletAddress,
    hueRange: [180, 240]
  })
  return (
    <div className="h-232 rounded-md p-4 gap-4 relative">
      <div
        className="absolute w-full h-full blur-[64px] rounded-md opacity-30"
        style={{ backgroundImage: meshGradientBright }}
      />
      <div
        className="absolute w-full h-full inset-0 rounded-md"
        style={{ backgroundImage: meshGradientBright }}
      />
      <div
        className="absolute bg-slate-900 inset-[2px] rounded-[14px] opacity-80"
        style={{ width: 'calc(100% - 4px)', height: 'calc(100% - 4px)' }}
      />
      {/*{isLoading ? (*/}
      {/*  <Box css={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>*/}
      {/*    <Spinner />*/}
      {/*  </Box>*/}
      {/*) : (*/}
      {/*  <Box css={{ flex: 1, flexDirection: 'row' }}>*/}
      {/*    <Box css={{ flex: 1, gap: 8 }}>*/}
      {/*      <FormLabel>Balance</FormLabel>*/}
      {/*      <Text*/}
      {/*        css={{ fontSize: 24, fontWeight: 700, color: '$white' }}*/}
      {/*        data-testid="dashboard__minaBalance"*/}
      {/*      >*/}
      {/*        {totalBalance} MINA*/}
      {/*      </Text>*/}
      {/*      <Text css={{ fontSize: 14, fontWeight: 700, color: '$primary400' }}>*/}
      {/*        ~{fiatBalance} USD*/}
      {/*      </Text>*/}
      {/*    </Box>*/}
      {/*    <Avatar label={walletAddress} />*/}
      {/*  </Box>*/}
      {/*)}*/}
      <div className="gap-2">
        <Label>Address</Label>
        <div className="gap-2">
          <div
            className="text-md font-semibold text-sky-400"
            data-testid="dashboard__addressTruncated"
          >
            {truncateString({
              value: walletAddress,
              firstCharCount: 8,
              endCharCount: 8
            })}
          </div>
          <div onClick={() => console.log('copy')}>
            <CopyIcon />
          </div>
        </div>
      </div>
      <div className="gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => navigate('/send')}
        >
          Send
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate('/receive')}
        >
          Receive
        </Button>
      </div>
    </div>
  )
}
