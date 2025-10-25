"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QRCodeSVG from "react-qr-code";
import { toast } from "sonner";
import { Copy, Share2, ArrowLeft, CheckCircle2, QrCode } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import {
  encodePaymentLink,
  encodeWebPaymentLink,
  isValidAddress,
} from "@/lib/deeplink-utils";
import { CONTRACT_ADDRESSES } from "@/lib/contract";

export default function CreatePage() {
  const { address, isConnected } = useAccount();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("MON");
  const [label, setLabel] = useState("");
  const [memo, setMemo] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [webLink, setWebLink] = useState("");

  const useMyAddress = () => {
    if (address) {
      setTo(address);
      toast.success("Your address filled!");
    } else {
      toast.error("Please connect wallet first");
    }
  };

  const handleGenerateLink = () => {
    if (!to) {
      toast.error("Please enter recipient address");
      return;
    }
    if (!isValidAddress(to)) {
      toast.error("Invalid Ethereum address");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Build request object with proper typing
    const request = {
      to,
      amount,
      ...(token !== "MON" && {
        token:
          token === "USDC"
            ? CONTRACT_ADDRESSES.tokens.USDC
            : CONTRACT_ADDRESSES.tokens.USDT,
      }),
      ...(label && { label }),
      ...(memo && { memo }),
    };

    const deepLink = encodePaymentLink(request);
    const web = encodeWebPaymentLink(request, "http://localhost:3000");

    setGeneratedLink(deepLink);
    setWebLink(web);
    toast.success("Payment link generated!");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MonadPay Payment Link",
          text: `Pay ${amount} ${token}`,
          url: webLink,
        });
      } catch {
        copyToClipboard(webLink);
      }
    } else {
      copyToClipboard(webLink);
    }
  };

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
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Create Payment Link</h1>
            <p className="text-muted-foreground">
              Generate a shareable payment link in seconds
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Fill in the information below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="to">Recipient Address *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="to"
                      placeholder="0x..."
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={useMyAddress}
                      disabled={!isConnected}
                    >
                      Use Mine
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="token">Token</Label>
                    <Select value={token} onValueChange={setToken}>
                      <SelectTrigger id="token">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MON">MON</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label">Label (Optional)</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Coffee payment"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memo">Memo (Optional)</Label>
                  <Input
                    id="memo"
                    placeholder="e.g., Thanks!"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleGenerateLink}
                  className="w-full"
                  size="lg"
                >
                  Generate Payment Link
                </Button>
              </CardContent>
            </Card>

            {/* Result Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Your Payment Link</CardTitle>
                <CardDescription>
                  {generatedLink
                    ? "Share this link to receive payment"
                    : "Link will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {generatedLink ? (
                  <>
                    {/* QR Code */}
                    <div className="flex justify-center p-6 bg-white dark:bg-gray-950 rounded-xl border-2 border-dashed">
                      <QRCodeSVG value={webLink} size={220} />
                    </div>

                    {/* Links */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Deep Link</Label>
                        <div className="flex gap-2">
                          <Input
                            value={generatedLink}
                            readOnly
                            className="text-xs font-mono"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyToClipboard(generatedLink)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Web Link</Label>
                        <div className="flex gap-2">
                          <Input
                            value={webLink}
                            readOnly
                            className="text-xs font-mono"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyToClipboard(webLink)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button onClick={shareLink} className="w-full" size="lg">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Link
                    </Button>

                    {/* Preview */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Payment Preview
                      </div>
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <div>
                          Amount:{" "}
                          <span className="font-semibold text-foreground">
                            {amount} {token}
                          </span>
                        </div>
                        {label && <div>Label: {label}</div>}
                        {memo && <div>Memo: {memo}</div>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                      <QrCode className="h-12 w-12" />
                    </div>
                    <p className="text-center">
                      Fill the form and generate your payment link
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
