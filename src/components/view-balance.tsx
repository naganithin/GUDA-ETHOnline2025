import { Button } from './ui/button'
import React, { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { cn } from '@/lib/utils'

const ViewUnifiedBalance = () => {
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(false)
  const [unifiedBalance, setUnifiedBalance] = useState<any[] | undefined>(
    undefined,
  )

  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance)
    return num.toFixed(Math.min(6, decimals))
  }

  const fetchBalance = async () => {
    setLoading(true)
    try {
      // Use nexus-core SDK directly
      const { getUnifiedBalances } = await import('@/lib/nexus')
      const balance = await getUnifiedBalances()
      console.log('balance', balance)
      setUnifiedBalance(balance)
    } catch (e) {
      console.error('Error fetching balance', e)
    } finally {
      setLoading(false)
    }
  }

  const TriggerButton = () => {
    return (
      <DialogTrigger asChild>
        <Button className="font-bold" onClick={fetchBalance}>
          View Unified Balance
        </Button>
      </DialogTrigger>
    )
  }

  const totalBalance = useMemo(() => {
    const total = unifiedBalance
      ?.reduce((acc, fiat) => acc + fiat.balanceInFiat, 0)
      .toFixed(2)

    return total ?? 0
  }, [unifiedBalance])
  return (
    <Dialog>
      <TriggerButton />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-bold">Unified Balance</DialogTitle>
          <DialogDescription className="font-semibold">
            {loading
              ? 'Fetching balance'
              : `Total Unified Balance: $${totalBalance}`}
          </DialogDescription>
        </DialogHeader>
        {unifiedBalance && (
          <ScrollArea className="w-full max-h-[476px] no-scrollbar">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {unifiedBalance
                ?.filter((token) => parseFloat(token.balance) > 0)
                .map((token) => (
                  <AccordionItem
                    key={token.symbol}
                    value={token.symbol}
                    className="px-4 border border-gray-400 rounded-lg"
                  >
                    <AccordionTrigger className="hover:no-underline cursor-pointer">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-8 w-8">
                            {token.icon && (
                              <img
                                src={token.icon}
                                alt={token.symbol}
                                className="rounded-full"
                              />
                            )}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold">{token.symbol}</h3>
                            <p className="text-sm text-muted-foreground">
                              ${token.balanceInFiat.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-medium">
                          {formatBalance(token.balance, 6)}
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 py-2">
                        {token.breakdown
                          .filter((chain) => parseFloat(chain.balance) > 0)
                          .map((chain, index, filteredChains) => (
                            <React.Fragment key={chain.chain.id}>
                              <div className="flex items-center justify-between px-2 py-1 rounded-md">
                                <div className="flex items-center gap-2">
                                  <div className="relative h-6 w-6">
                                    <img
                                      src={chain?.chain?.logo || ''}
                                      alt={chain.chain.name}
                                      sizes="100%"
                                      className="rounded-full"
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {chain.chain.name}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    {formatBalance(
                                      chain.balance,
                                      chain.decimals,
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-bold">
                                    ${chain.balanceInFiat.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              {index < filteredChains.length - 1 && (
                                <Separator className="my-2 bg-gray-700" />
                              )}
                            </React.Fragment>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ViewUnifiedBalance
