'use client';

import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES, PROCESSOR_ABI } from '@/lib/contract';
import { isValidAddress } from '@/lib/deeplink-utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { WalletConnect } from '@/components/wallet-connect';
import { ThemeToggle } from '@/components/theme-toggle';

export default function BatchPaymentPage() {
  const [recipients, setRecipients] = useState<string[]>(['', '']);
  const [amounts, setAmounts] = useState<string[]>(['', '']);
  const [label, setLabel] = useState('');
  
  const { writeContract, isPending } = useWriteContract();
  
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

      // Type assertion to satisfy TypeScript
      const recipientAddresses = validRecipients as `0x${string}`[];
      
      const result = await writeContract({
        address: CONTRACT_ADDRESSES.processor as `0x${string}`,
        abi: PROCESSOR_ABI,
        functionName: 'processBatchPayment',
        args: [
          recipientAddresses,                      // address[]
          validAmounts.map(amt => parseEther(amt)), // uint256[]
          label || 'Batch Payment'                  // label
        ],
        value: parseEther(totalAmount.toString()), // Total amount
      });
      
      toast.success('Batch payment sent successfully!');
      console.log('Batch payment result:', result);

      // Reset form
      setRecipients(['', '']);
      setAmounts(['', '']);
      setLabel('');
      
    } catch (error) {
      console.error('Batch payment failed:', error);
      toast.error('Batch payment failed. Please try again.');
    }
  };

  const totalAmount = amounts.reduce((sum, amt) => 
    sum + parseFloat(amt || '0'), 0
  );
  
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
                disabled={isPending}
                className="w-full"
                size="lg"
              >
                {isPending ? 'Processing...' : 'Send Batch Payment'}
              </Button>

              {/* Info */}
              <div className="text-xs text-muted-foreground text-center">
                All recipients will receive their payment in a single transaction
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
