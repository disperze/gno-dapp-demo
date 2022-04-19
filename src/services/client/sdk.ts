import axios from "axios";
import { OfflineAminoSigner } from "@cosmjs/amino";

import { AppConfig } from "../config/network";
import { LcdClient } from "../lcd";

export type WalletLoader = (chainId: string, addressPrefix?: string) => OfflineAminoSigner;

export function loadKeplrWallet(chainId: string): OfflineAminoSigner {
  const anyWindow = window as any;
  if (!anyWindow.getOfflineSignerOnlyAmino) {
    throw new Error("Keplr extension is not available");
  }

  anyWindow.keplr.defaultOptions = {
    sign: {
      preferNoSetFee: true,
      preferNoSetMemo: false,
      // disableBalanceCheck: true,
    }
  };

  return anyWindow.getOfflineSignerOnlyAmino(chainId);
}

// this creates a new connection to a server at URL,
export function createClient(config: AppConfig): LcdClient {
  const instance = axios.create({
    baseURL: config.httpUrl,
    timeout: 15000,
  });

  return new LcdClient(instance);
}
