'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES, PROCESSOR_ABI } from '@/lib/contract';
import { isValidAddress } from '@/lib/deeplink-utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { WalletConnect } from '@/components/wallet-connect';
import { ThemeToggle } from '@/components/theme-toggle';

export default function BatchPaymentPage() {
  const [recipients, setRecipients] = useState<string[]>(['', '']);
  const [amounts, setAmounts] = useState<string[]>(['', '']);
  const [label, setLabel] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash,
    });
  
  const addRecipient = () => {
    setRecipients([...recipients, '']);
    setAmounts([...amounts, '']);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length <= 2) {
      toast.error('Need at least 2 recipients');
      return;
    }
    setRecipients(recipients.filter((_, i) => i !== index));
    setAmounts(amounts.filter((_, i) => i !== index));
  };
  
  const handleBatchPayment = async () => {
    // Reset success state
    setShowSuccess(false);

    // Validation
    const validRecipients = recipients.filter(r => r.trim() !== '');
    const validAmounts = amounts.filter(a => a.trim() !== '' && parseFloat(a) > 0);

    if (validRecipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    if (validRecipients.length !== validAmounts.length) {
      toast.error('Please enter valid amounts for all recipients');
      return;
    }

    // Validate all addresses
    for (let i = 0; i < validRecipients.length; i++) {
      if (!isValidAddress(validRecipients[i])) {
        toast.error(`Invalid address at position ${i + 1}`);
        return;
      }
    }

    try {
      const totalAmount = validAmounts.reduce((sum, amt) => 
        sum + parseFloat(amt || '0'), 0
      );

      const recipientAddresses = validRecipients as `0x${string}`[];
      
      writeContract({
        address: CONTRACT_ADDRESSES.processor as `0x${string}`,
        abi: PROCESSOR_ABI,
        functionName: 'processBatchPayment',
        args: [
          recipientAddresses,
          validAmounts.map(amt => parseEther(amt)),
          label || 'Batch Payment'
        ],
        value: parseEther(totalAmount.toString()),
      });
      
    } catch (error) {
      console.error('Batch payment failed:', error);
      toast.error('Transaction rejected or failed');
    }
  };

  // Show success when transaction is confirmed
  if (isConfirmed && !showSuccess) {
    setShowSuccess(true);
    toast.success('Batch payment confirmed on-chain!');
  }

  const handleNewPayment = () => {
    setRecipients(['', '']);
    setAmounts(['', '']);
    setLabel('');
    setShowSuccess(false);
  };

  const totalAmount = amounts.reduce((sum, amt) => 
    sum + parseFloat(amt || '0'), 0
  );
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-primary">
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Split Payment</h1>
            <p className="text-muted-foreground">
              Pay multiple people at once
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Batch Payment</CardTitle>
              <CardDescription>
                Send payments to multiple recipients in one transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {showSuccess ? (
                /* Success Message */
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-center">Payment Confirmed!</h3>
                    <p className="text-muted-foreground text-center">
                      Your batch payment has been confirmed on Monad Testnet
                    </p>
                  </div>

                  {/* Transaction Details */}
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Recipients:</span>
                      <span className="text-sm">
                        {recipients.filter(r => r.trim() !== '').length} addresses
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Amount:</span>
                      <span className="text-sm font-bold">
                        {totalAmount.toFixed(4)} MON
                      </span>
                    </div>
                    {label && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Label:</span>
                        <span className="text-sm">{label}</span>
                      </div>
                    )}
                    {hash && (
                      <div className="pt-3 border-t">
                        <span className="text-xs font-medium">Transaction Hash:</span>
                        <p className="text-xs text-muted-foreground font-mono mt-1 break-all">
                          {hash}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleNewPayment}
                      className="flex-1"
                      size="lg"
                    >
                      Send Another Payment
                    </Button>
                    <Link href="/" className="flex-1">
                      <Button variant="outline" className="w-full" size="lg">
                        Go Home
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : isConfirming ? (
                /* Confirming State */
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  <h3 className="text-xl font-semibold">Confirming Transaction...</h3>
                  <p className="text-muted-foreground text-center">
                    Waiting for blockchain confirmation
                  </p>
                  {hash && (
                    <p className="text-xs text-muted-foreground font-mono break-all max-w-md">
                      {hash}
                    </p>
                  )}
                </div>
              ) : (
                /* Payment Form */
                <>
                  {/* Recipients List */}
                  <div className="space-y-4">
                    <Label>Recipients & Amounts</Label>
                    {recipients.map((recipient, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          type="text"
                          placeholder="0x... Recipient address"
                          value={recipient}
                          onChange={(e) => {
                            const newRecipients = [...recipients];
                            newRecipients[index] = e.target.value;
                            setRecipients(newRecipients);
                          }}
                          className="flex-1 font-mono text-sm"
                        />
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="Amount"
                          value={amounts[index]}
                          onChange={(e) => {
                            const newAmounts = [...amounts];
                            newAmounts[index] = e.target.value;
                            setAmounts(newAmounts);
                          }}
                          className="w-32"
                        />
                        {recipients.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeRecipient(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={addRecipient}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Recipient
                    </Button>
                  </div>
                  
                  {/* Label */}
                  <div className="space-y-2">
                    <Label htmlFor="label">Label (Optional)</Label>
                    <Input 
                      id="label"
                      type="text" 
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="e.g., Dinner split"
                    />
                  </div>
                  
                  {/* Total */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Amount:</span>
                      <span className="text-2xl font-bold">
                        {totalAmount.toFixed(4)} MON
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {recipients.filter(r => r.trim() !== '').length} recipients
                    </div>
                  </div>
                  
                  {/* Submit */}
                  <Button 
                    onClick={handleBatchPayment}
                    disabled={isPending || isConfirming}
                    className="w-full"
                    size="lg"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirm in Wallet...
                      </>
                    ) : (
                      'Send Batch Payment'
                    )}
                  </Button>

                  {/* Info */}
                  <div className="text-xs text-muted-foreground text-center">
                    All recipients will receive their payment in a single transaction
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
