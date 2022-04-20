import axios from "axios";
import { OfflineAminoSigner, Secp256k1HdWallet, makeCosmoshubPath } from "@cosmjs/amino";

import { AppConfig } from "../config/network";
import { LcdClient } from "../lcd";

export type WalletLoader = (chainId: string, addressPrefix?: string) => Promise<OfflineAminoSigner>;

export async function loadKeplrWallet(chainId: string): Promise<OfflineAminoSigner> {
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

  return await anyWindow.getOfflineSignerOnlyAmino(chainId);
}

export async function loadOrCreateWalletDirect(
  addressPrefix: string,
  pin?: string,
): Promise<OfflineAminoSigner> {
  const hdPath = makeCosmoshubPath(0);

  const key = "gno-wallet";
  pin = pin ?? key;
  const loaded = localStorage.getItem(key);
  if (!loaded) {
    const signer = await Secp256k1HdWallet.generate(12, {
      hdPaths: [hdPath],
      prefix: addressPrefix,
    });

    localStorage.setItem(key, await signer.serialize(pin));

    return signer;
  }

  return Secp256k1HdWallet.deserialize(loaded, pin);
}

// this creates a new connection to a server at URL,
export function createClient(config: AppConfig): LcdClient {
  const instance = axios.create({
    baseURL: config.httpUrl,
    timeout: 15000,
  });

  return new LcdClient(instance);
}
