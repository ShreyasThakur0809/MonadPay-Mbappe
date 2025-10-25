import { PaymentRequest, DeepLinkSchema } from "./types";
/**
 * Encode payment request into a deep link URL
 * @param request Payment request parameters
 * @returns Deep link URL string
 */
export function encodePaymentLink(request: PaymentRequest): string {
  const params = new URLSearchParams();

  // Required parameters
  params.set('to', request.to);
  params.set('amount', request.amount);

  // Optional parameters
  if (request.token) {
    params.set('token', request.token);
  }
  if (request.label) {
    params.set('label', request.label);
  }
  if (request.memo) {
    params.set('memo', request.memo);
  }
  if (request.chainId) {
    params.set('chainId', request.chainId.toString());
  }

  return `monadpay://send?${params.toString()}`;
}

/**
 * Encode payment request into a web fallback URL
 * @param request Payment request parameters
 * @param baseUrl Base URL for the web app
 * @returns Web URL string
 */
export function encodeWebPaymentLink(
  request: PaymentRequest,
  baseUrl: string = 'http://localhost:3000/'
): string {
  const params = new URLSearchParams();

  params.set('to', request.to);
  params.set('amount', request.amount);

  if (request.token) params.set('token', request.token);
  if (request.label) params.set('label', request.label);
  if (request.memo) params.set('memo', request.memo);
  if (request.chainId) params.set('chainId', request.chainId.toString());

  return `${baseUrl}/send?${params.toString()}`;
}

/**
 * Decode payment link into payment request
 * @param link Deep link or web URL
 * @returns Payment request object
 */
export function decodePaymentLink(link: string): PaymentRequest | null {
  try {
    let url: URL;

    // Handle deep link format
    if (link.startsWith('monadpay://')) {
      // Convert to http:// for URL parsing
      url = new URL(link.replace('monadpay://', 'http://'));
    } else {
      url = new URL(link);
    }

    const params = url.searchParams;

    // Validate required parameters
    const to = params.get('to');
    const amount = params.get('amount');

    if (!to || !amount) {
      console.error('Missing required parameters: to or amount');
      return null;
    }

    // Validate address format
    if (!isValidAddress(to)) {
      console.error('Invalid recipient address');
      return null;
    }

    // Build payment request
    const request: PaymentRequest = {
      to,
      amount,
      token: params.get('token') || undefined,
      label: params.get('label') || undefined,
      memo: params.get('memo') || undefined,
      chainId: params.get('chainId') ? parseInt(params.get('chainId')!) : 10143,
    };

    return request;
  } catch (error) {
    console.error('Failed to decode payment link:', error);
    return null;
  }
}

/**
 * Parse deep link into schema object
 * @param link Deep link URL
 * @returns Deep link schema
 */
export function parseDeepLink(link: string): DeepLinkSchema | null {
  try {
    if (!link.startsWith('monadpay://')) {
      return null;
    }

    const [protocol, rest] = link.split('://');
    const [action, queryString] = rest.split('?');

    const request = decodePaymentLink(link);
    if (!request) return null;

    return {
      protocol,
      action,
      params: request,
    };
  } catch (error) {
    console.error('Failed to parse deep link:', error);
    return null;
  }
}

/**
 * Validate Ethereum address
 * @param address Address string
 * @returns True if valid
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Shorten address for display
 * @param address Full address
 * @param chars Number of chars to show on each side
 * @returns Shortened address
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format amount for display
 * @param amount Amount string or bigint
 * @param decimals Token decimals
 * @returns Formatted string
 */
export function formatAmount(amount: string | bigint, decimals: number = 18): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : Number(amount) / Math.pow(10, decimals);
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  } else {
    return value.toFixed(2);
  }
}

/**
 * Generate QR code data URL
 * @param link Payment link
 * @returns Data URL for QR code (use with qrcode.react)
 */
export function getQRCodeData(link: string): string {
  return link;
}

/**
 * Copy text to clipboard
 * @param text Text to copy
 * @returns Promise resolving to success
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Share via Web Share API
 * @param title Share title
 * @param text Share text
 * @param url Share URL
 */
export async function shareLink(title: string, text: string, url: string): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return true;
    } else {
      // Fallback to clipboard
      return await copyToClipboard(url);
    }
  } catch (error) {
    console.error('Failed to share:', error);
    return false;
  }
}