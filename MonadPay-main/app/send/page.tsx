'use client';

import { useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { WalletConnect } from '@/components/wallet-connect';
import { toast } from 'sonner';
import { CONTRACT_ADDRESSES, PROCESSOR_ABI } from '@/lib/contract';

function SendPageContent() {
  const searchParams = useSearchParams();
  const { isConnected } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Memoize payment details to avoid re-renders
  const paymentDetails = useMemo(() => ({
    to: searchParams.get('to') || '',
    amount: searchParams.get('amount') || '',
    token: searchParams.get('token') || 'MON',
    label: searchParams.get('label') || '',
    memo: searchParams.get('memo') || '',
  }), [searchParams]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Payment sent successfully!');
    }
  }, [isSuccess]);

  const handleSendPayment = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      if (paymentDetails.token === 'MON') {
        writeContract({
          address: CONTRACT_ADDRESSES.processor as `0x${string}`,
          abi: PROCESSOR_ABI,
          functionName: 'processPayment',
          args: [
            paymentDetails.to as `0x${string}`,
            paymentDetails.label || '',
            paymentDetails.memo || '',
          ],
          value: parseEther(paymentDetails.amount),
        });
      } else {
        toast.error('Token payments coming soon!');
      }
    } catch {
      toast.error('Failed to send payment');
    }
  };

  const isValidRequest = paymentDetails.to && paymentDetails.amount;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl text-primary font-bold">
              MonadPay
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <WalletConnect />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Complete Payment</h1>
            <p className="text-muted-foreground">Review and send your payment</p>
          </div>

          {!isValidRequest ? (
            <Card>
              <CardContent className="p-12 text-center">
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Invalid Payment Link</h3>
                <p className="text-muted-foreground mb-6">
                  This payment link is invalid or expired
                </p>
                <Link href="/create">
                  <Button>Create New Payment Link</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Review the payment information below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-lg">
                      {paymentDetails.amount} {paymentDetails.token}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-mono text-sm">{paymentDetails.to.slice(0, 10)}...{paymentDetails.to.slice(-8)}</span>
                  </div>
                  {paymentDetails.label && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Label</span>
                      <span>{paymentDetails.label}</span>
                    </div>
                  )}
                  {paymentDetails.memo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Memo</span>
                      <span>{paymentDetails.memo}</span>
                    </div>
                  )}
                </div>

                {!isConnected && (
                  <Alert>
                    <AlertDescription>
                      Please connect your wallet to send payment
                    </AlertDescription>
                  </Alert>
                )}

                {isPending && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Waiting for wallet confirmation...
                    </AlertDescription>
                  </Alert>
                )}

                {isConfirming && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Transaction pending... Please wait.
                    </AlertDescription>
                  </Alert>
                )}

                {isSuccess && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      Payment sent successfully!
                      <br />
                      <a
                        href={`https://monad-testnet.g.alchemy.com/v2/5sF0mkfo834fgZ0BVRo1ubDqYLuCRcSm/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline mt-2 inline-block"
                      >
                        View on Explorer
                      </a>
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-600">
                      {error.message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  {!isSuccess ? (
                    <Button
                      onClick={handleSendPayment}
                      disabled={!isConnected || isPending || isConfirming}
                      className="w-full"
                      size="lg"
                    >
                      {isPending || isConfirming ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Payment
                        </>
                      )}
                    </Button>
                  ) : (
                    <Link href="/create">
                      <Button className="w-full" size="lg">
                        Create Another Payment Link
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SendPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <SendPageContent />
    </Suspense>
  );
}
