import { zodResolver } from '@hookform/resolvers/zod'
import { ChainOperationArgs } from '@palladxyz/key-management'
import { Mina } from '@palladxyz/mina-core'
import { useVault } from '@palladxyz/vault'
import { addHours } from 'date-fns'
import { Loader2Icon } from 'lucide-react'
import {
  Payment,
  SignedLegacy
} from 'mina-signer/dist/node/mina-signer/src/TSTypes'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useMixpanel } from 'react-mixpanel-browser'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAccount } from '@/common/hooks/use-account'
import { usePendingTransactionStore } from '@/common/store/pending-transactions'
import { useTransactionStore } from '@/common/store/transaction'
import { ButtonArrow } from '@/components/button-arrow'
import { FormError } from '@/components/form-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { ConfirmTransactionSchema } from './confirm-transaction-form.schema'

type ConfirmTransactionData = z.infer<typeof ConfirmTransactionSchema>
export const ConfirmTransactionForm = () => {
  const mixpanel = useMixpanel()
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  // can use
  // const request = useVault((state) => state.request) for signing
  const sign = useVault((state) => state.sign)
  const submitTx = useVault((state) => state.submitTx)
  const constructTx = useVault((state) => state.constructTx)
  const syncWallet = useVault((state) => state._syncWallet)
  const currentWallet = useVault((state) => state.getCurrentWallet())
  const { publicKey } = useAccount()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<ConfirmTransactionData>({
    resolver: zodResolver(ConfirmTransactionSchema),
    defaultValues: {
      spendingPassword: ''
    }
  })
  const outgoingTransaction = useTransactionStore(
    (state) => state.outgoingTransaction
  )
  const kind = useTransactionStore((state) => state.kind)
  const { addPendingTransaction } = usePendingTransactionStore()
  if (!outgoingTransaction) return null
  const rawAmount = parseFloat(outgoingTransaction.amount || '0.00')
  const rawFee = parseFloat(outgoingTransaction.fee || '0.01')
  const amount = BigInt(rawAmount * 1_000_000_000).toString()
  const fee = BigInt(rawFee * 1_000_000_000).toString()
  const onSubmit: SubmitHandler<ConfirmTransactionData> = async (data) => {
    const transaction: Mina.TransactionBody = {
      to: outgoingTransaction.to,
      from: publicKey,
      memo: outgoingTransaction.memo,
      validUntil: '4294967295',
      fee,
      amount,
      nonce: currentWallet.accountInfo['MINA'].inferredNonce, // need a util for this whole `onSubmit` to remove Mina dependency
      type: 'payment'
    }
    const constructTxArgs = {
      transaction: transaction,
      transactionKind:
        kind === 'staking'
          ? Mina.TransactionKind.STAKE_DELEGATION
          : Mina.TransactionKind.PAYMENT
    }
    const constructedTx = await constructTx(constructTxArgs)
    const getPassphrase = () =>
      new Promise<Uint8Array>((resolve) =>
        resolve(Buffer.from(data.spendingPassword))
      )
    let signedTx
    // TODO: make chain agnostic depending on the currentWallet chain and it's corresponding operation e.g. 'eth_signTransaction' vs 'mina_signTransaction'
    const operationArgs: ChainOperationArgs = {
      operation: 'mina_signTransaction',
      network: 'Mina',
      networkType: 'testnet' // TODO: make configurable for 'mainnet' and 'testnet'
    }
    try {
      signedTx = await sign(constructedTx as any, operationArgs, getPassphrase)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AuthenticationError')
          setError('spendingPassword', {
            type: 'wrongPassword',
            message: 'The spending password is wrong'
          })
      }
    }
    if (!signedTx) return
    // TODO: Make a util for this
    const submitTxArgs = {
      signedTransaction: signedTx as unknown as SignedLegacy<Payment>,
      kind:
        kind === ('staking' as Mina.TransactionKind)
          ? Mina.TransactionKind.STAKE_DELEGATION
          : Mina.TransactionKind.PAYMENT,
      transactionDetails: {
        fee: transaction.fee,
        to: transaction.to,
        from: transaction.from,
        nonce: transaction.nonce,
        memo: transaction.memo,
        amount: transaction.amount,
        validUntil: transaction.validUntil
      }
    }
    try {
      setSubmitting(true)
      const submittedTx = (await submitTx(submitTxArgs as any)) as any
      const hash =
        submittedTx?.sendPayment?.payment?.hash ??
        submittedTx?.sendDelegation?.delegation?.hash
      addPendingTransaction({
        hash,
        expireAt: addHours(new Date(), 8).toISOString()
      })
      await syncWallet()
      mixpanel.track(
        kind === ('staking' as Mina.TransactionKind)
          ? 'PortfolioDelegated'
          : 'TransactionSent',
        {
          amount: transaction.amount,
          fee: transaction.fee,
          to: kind === ('staking' as Mina.TransactionKind) && transaction.to
        }
      )
      navigate('/transactions/success', {
        state: {
          hash
        }
      })
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-1 flex-col gap-4"
    >
      <fieldset className="flex flex-1 flex-col gap-2">
        <Label
          htmlFor="spendingPassword"
          className={cn(errors.spendingPassword && 'text-destructive')}
        >
          Spending Password
        </Label>
        <Input
          id="spendingPassword"
          type="password"
          placeholder="Spending Password"
          className={errors.spendingPassword && 'border-destructive'}
          data-testid="confirm__spendingPassword"
          {...register('spendingPassword')}
          autoFocus
        />
        <FormError>{errors.spendingPassword?.message}</FormError>
        <div className="flex-1" />
      </fieldset>
      <Button
        disabled={submitting}
        className="group gap-2"
        data-testid="confirm__nextButton"
      >
        {submitting && <Loader2Icon size={16} className="animate-spin" />}
        <span>Send</span>
        <ButtonArrow />
      </Button>
    </form>
  )
}
