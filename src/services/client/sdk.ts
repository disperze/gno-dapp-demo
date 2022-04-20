import axios from "axios";
import { OfflineAminoSigner, makeCosmoshubPath } from "@cosmjs/amino";

import { AppConfig } from "../config/network";
import { LcdClient } from "../lcd";
import { LedgerSigner, Secp256k1HdWallet } from "../signer";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";


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

export async function loadLedgerWallet( _chainId: string, addressPrefix?: string): Promise<OfflineAminoSigner> {
  const interactiveTimeout = 120_000;
  const ledgerTransport = await TransportWebUSB.create(interactiveTimeout, interactiveTimeout);

  return new LedgerSigner(ledgerTransport, {
    hdPaths: [makeCosmoshubPath(0)],
    prefix: addressPrefix
  });
}

export function webUsbMissing(): boolean {
  const anyNavigator: any = navigator;
  return !anyNavigator?.usb;
}

export async function loadOrCreateWalletDirect(
  _chainId: string,
  addressPrefix?: string,
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
