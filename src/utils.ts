/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const ONES = [
  "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", 
  "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", 
  "SEVENTEEN", "EIGHTEEN", "NINETEEN"
];

const TENS = [
  "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"
];

function convertLessThanThousand(num: number): string {
  if (num === 0) return "";
  
  let result = "";
  if (num >= 100) {
    result += ONES[Math.floor(num / 100)] + " HUNDRED ";
    num %= 100;
  }
  
  if (num >= 20) {
    result += TENS[Math.floor(num / 10)] + " ";
    num %= 10;
  }
  
  if (num > 0) {
    result += ONES[num] + " ";
  }
  
  return result.trim();
}

/**
 * Converts a standard number into English word representation
 */
export function numberToWords(num: number): string {
  if (num === 0) return "ZERO";
  
  let result = "";
  let temp = num;
  
  const billion = Math.floor(temp / 1000000000);
  temp %= 1000000000;
  if (billion > 0) {
    result += convertLessThanThousand(billion) + " BILLION ";
  }
  
  const million = Math.floor(temp / 1000000);
  temp %= 1000000;
  if (million > 0) {
    result += convertLessThanThousand(million) + " MILLION ";
  }
  
  const thousand = Math.floor(temp / 1000);
  temp %= 1000;
  if (thousand > 0) {
    result += convertLessThanThousand(thousand) + " THOUSAND ";
  }
  
  const remainder = temp;
  if (remainder > 0) {
    result += convertLessThanThousand(remainder);
  }
  
  return result.trim();
}

/**
 * Converts a numeric RM amount into standard Malaysian Invoice Word Format
 * e.g., 1228.50 -> RINGGIT MALAYSIA ONE THOUSAND TWO HUNDRED TWENTY EIGHT AND CENTS FIFTY ONLY
 */
export function amountToMalaysianWords(amount: number): string {
  if (isNaN(amount) || amount < 0) return "RINGGIT MALAYSIA ZERO ONLY";
  
  // Round to 2 decimal places to avoid floating point precision issues
  const roundedAmount = Math.round(amount * 100) / 100;
  const ringgitPart = Math.floor(roundedAmount);
  const centsPart = Math.round((roundedAmount - ringgitPart) * 100);
  
  let ringgitWords = "";
  if (ringgitPart === 0 && centsPart === 0) {
    return "RINGGIT MALAYSIA ZERO ONLY";
  }
  
  if (ringgitPart > 0) {
    ringgitWords = numberToWords(ringgitPart);
  }
  
  let centsWords = "";
  if (centsPart > 0) {
    centsWords = numberToWords(centsPart);
  }
  
  let finalPhrase = "RINGGIT MALAYSIA ";
  if (ringgitPart > 0) {
    finalPhrase += ringgitWords;
  } else {
    finalPhrase += "ZERO";
  }
  
  if (centsPart > 0) {
    finalPhrase += " AND CENTS " + centsWords;
  }
  
  finalPhrase += " ONLY";
  return finalPhrase.replace(/\s+/g, ' '); // collapse extra spaces
}

/**
 * Serializes invoice data to a compact URL-safe Base64 string for direct link sharing.
 */
export function encodeInvoiceToUrl(invoice: any): string {
  try {
    const jsonStr = JSON.stringify(invoice);
    // Use standard UTF-8 friendly base64 encoding
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = "";
    const len = utf8Bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch (error) {
    console.error("Failed to encode invoice", error);
    return "";
  }
}

/**
 * Deserializes invoice data from a URL Base64 parameter back into a structured object.
 */
export function decodeInvoiceFromUrl(encoded: string): any | null {
  if (!encoded) return null;
  try {
    // Add back padding if necessary
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to decode invoice", error);
    return null;
  }
}
