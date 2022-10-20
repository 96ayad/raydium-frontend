import useAppSettings from '@/application/common/useAppSettings'
import txCreateNewConcentratedPool from '@/application/concentrated/txCreateNewConcentratedPool'
import useConcentrated from '@/application/concentrated/useConcentrated'
import useConcentratedAmmConfigInfoLoader from '@/application/concentrated/useConcentratedAmmConfigInfoLoader'
import useConcentratedAmountCalculator from '@/application/concentrated/useConcentratedAmountCalculator'
import useNotification from '@/application/notification/useNotification'
import { routeBack, routeTo } from '@/application/routeTools'
import useWallet from '@/application/wallet/useWallet'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { Checkbox } from '@/components/Checkbox'
import Col from '@/components/Col'
import CyberpunkStyleCard from '@/components/CyberpunkStyleCard'
import FadeInStable from '@/components/FadeIn'
import Icon from '@/components/Icon'
import PageLayout from '@/components/PageLayout'
import Row from '@/components/Row'
import { getLocalItem, setLocalItem } from '@/functions/dom/jStorage'
import { toTokenAmount } from '@/functions/format/toTokenAmount'
import toUsdVolume from '@/functions/format/toUsdVolume'
import { isMeaningfulNumber } from '@/functions/numberish/compare'
import toFraction from '@/functions/numberish/toFraction'
import { useEvent } from '@/hooks/useEvent'
import useToggle from '@/hooks/useToggle'
import { CreatePoolCard } from '@/pageComponents/createConcentratedPool/CreatePoolCard'
import CreatePoolPreviewDialog from '@/pageComponents/createConcentratedPool/CreatePoolPreviewDialog'
import { useState, useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

// unless ido have move this component, it can't be renamed or move to /components
function StepBadge(props: { n: number }) {
  return (
    <CyberpunkStyleCard
      wrapperClassName="w-8 h-8 mobile:w-6 mobile:h-6 flex-none"
      className="grid place-content-center bg-[#2f2c78]"
    >
      <div className="font-semibold text-white mobile:text-xs">{props.n}</div>
    </CyberpunkStyleCard>
  )
}

function NavButtons({ className }: { className?: string }) {
  return (
    <Row className={twMerge('items-center justify-between', className)}>
      <Button
        type="text"
        className="text-sm text-[#ABC4FF] opacity-50 px-0"
        prefix={<Icon heroIconName="chevron-left" size="sm" />}
        onClick={() => {
          if (window.history.length === 1) {
            // user jump directly into /farms/create page by clicking a link, we "goback" to /farms
            routeTo('/clmm/pools')
          } else {
            routeBack()
          }
        }}
      >
        Back to Concentrated pools
      </Button>
    </Row>
  )
}

function WarningBoard({ className }: { className: string }) {
  const [needWarning, setNeedWarning] = useState(false)
  const isMobile = useAppSettings((s) => s.isMobile)
  const [checkIgnorePermanent, setCheckIgnorePermanent] = useState(false)
  useEffect(() => {
    const userSetIgnored = getLocalItem<boolean>('IGNORE_CREATE_CLMM_WARNING')
    if (!userSetIgnored) setNeedWarning(true)
  }, [])
  const setIgnoreWarning = useEvent(() => setLocalItem('IGNORE_CREATE_CLMM_WARNING', true))
  return (
    <FadeInStable show={needWarning}>
      <Row className={className}>
        <Card
          className={`p-6 mobile:p-4 grow rounded-3xl mobile:rounded-2xl ring-1 ring-inset ring-[#39d0d8] bg-[#1B1659]`}
        >
          <div className="mobile:text-sm font-medium text-base text-white mb-3">
            You can create a farm based on the pool you created!
          </div>

          <div className="font-medium text-sm mobile:text-xs text-[#ABC4FF80] mb-4">
            You can choose to create a farm after creating this pool and providing your position. You can also create a
            farm based on a previously created pool.
          </div>

          <Row className="gap-4">
            <Button
              className="frosted-glass-teal mobile:px-4"
              size={isMobile ? 'sm' : 'md'}
              onClick={() => {
                setNeedWarning(false)
                checkIgnorePermanent && setIgnoreWarning()
              }}
            >
              Got it
            </Button>

            <Checkbox
              checkBoxSize="sm"
              className="my-2 w-max text-sm"
              onChange={setCheckIgnorePermanent}
              label={<div className="text-sm text-white font-medium">Do not show again</div>}
            />
          </Row>
        </Card>
      </Row>
    </FadeInStable>
  )
}

export default function CreatePoolPage() {
  useConcentratedAmmConfigInfoLoader()
  useConcentratedAmountCalculator()
  const isMobile = useAppSettings((s) => s.isMobile)

  const { popConfirm } = useNotification()

  // avoid input re-render if chain Date change

  const coin1 = useConcentrated((s) => s.coin1)
  const coin1Amount = useConcentrated((s) => s.coin1Amount)
  const coin2 = useConcentrated((s) => s.coin2)
  const coin2Amount = useConcentrated((s) => s.coin2Amount)
  const focusSide = useConcentrated((s) => s.focusSide)
  const totalDeposit = useConcentrated((s) => s.totalDeposit)
  const userSettedCurrentPrice = useConcentrated((s) => s.userSettedCurrentPrice)
  const priceLower = useConcentrated((s) => s.priceLower)
  const priceUpper = useConcentrated((s) => s.priceUpper)

  const decimals = coin1 || coin2 ? Math.max(coin1?.decimals ?? 0, coin2?.decimals ?? 0) : 6

  function popCongratulations() {
    popConfirm({
      type: 'success',
      title: 'Pool created successfully!',
      description: 'Do you want to create a farm based on this pool?',
      confirmButtonIsMainButton: true,
      confirmButtonText: 'Back to all Pools',
      cancelButtonText: 'Not Now',
      onConfirm() {
        routeTo('/clmm/pools')
        setTimeout(() => {
          // clean inputs
          useConcentrated.setState({
            coin1: undefined,
            coin2: undefined,
            coin1Amount: undefined,
            coin2Amount: undefined,
            focusSide: 'coin1',
            userCursorSide: 'coin1',
            tempDataCache: undefined
          })
          useConcentrated.getState().refreshConcentrated()
        }, 400)
      },
      onCancel() {
        setTimeout(() => {
          // clean inputs
          useConcentrated.setState({
            coin1: undefined,
            coin2: undefined,
            coin1Amount: undefined,
            coin2Amount: undefined,
            focusSide: 'coin1',
            userCursorSide: 'coin1'
          })
          useConcentrated.getState().refreshConcentrated()
        }, 400)
      }
    })
  }
  return (
    <PageLayout metaTitle="Farms - Raydium" mobileBarTitle="Create Farm">
      <NavButtons className="mb-8 mobile:mb-2 sticky z-10 top-0 mobile:-translate-y-2 mobile:bg-[#0f0b2f] mobile:hidden" />

      <div className={`pb-10 self-center transition-all duration-500 w-[min(840px,70vw)] mobile:w-[90vw] z-20`}>
        {!isMobile && (
          <div className="pb-8 text-2xl mobile:text-lg font-semibold justify-self-start text-white">Create Pool</div>
        )}

        <WarningBoard className="pb-6 w-full" />

        <CreatePoolCard />

        <Col className="items-center my-8"></Col>
      </div>
    </PageLayout>
  )
}
