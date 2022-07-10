import { coins, Token } from "../config";

export function formatAddress(wallet: string): string {
  return ellideMiddle(wallet, 24);
}

export function ellideMiddle(str: string, maxOutLen: number): string {
  if (str.length <= maxOutLen) {
    return str;
  }
  const ellide = "…";
  const frontLen = Math.ceil((maxOutLen - ellide.length) / 2);
  const tailLen = Math.floor((maxOutLen - ellide.length) / 2);
  return str.slice(0, frontLen) + ellide + str.slice(str.length - tailLen, str.length);
}

export function getTokenConfig(denom: string): Token|undefined {
  return coins.find((c: any) => c.denom === denom);
}

export function formatPrice(price: {amount: string, denom: string}): string {
  const coin = getTokenConfig(price.denom)!;
  const amount = (parseInt(price.amount) / Math.pow(10, coin.decimals)).toFixed(6);

  return amount + " " + coin.name;
}

export function toMinDenom(amount: number, denom: string): string {
  const coin = getTokenConfig(denom)!;
  return Math.floor(amount * Math.pow(10, coin.decimals)).toString();
}


export function parseResultId(base64Data: string): string {
  if (!base64Data) {
    return "";
  }
  
  const raw = atob(base64Data);
  const regExp = /\((\d+) /;

  const match = raw.match(regExp);
  if (!match) {
    return "";
  }

  return match[1];
}

export function parseBoards(raw: string): string[] {
  if (!raw) {
    return [];
  }

  const regExp = /\(([^)]+)\)/g;
  const matches = raw.match(regExp);
  if (!matches) {
    return [];
  }

  return matches.map((str) => str.substring(1, str.length - 1));
}
