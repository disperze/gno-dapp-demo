import * as React from "react";
import { WebsocketClient } from "@cosmjs/tendermint-rpc";
import { SubscriptionEvent } from "@cosmjs/tendermint-rpc/build/rpcclients";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppConfig } from "../config/network";
import { createClient } from "./sdk";
import { LcdClient } from "../lcd";
import { Coin } from "../types";
import { GnoClient } from "./gno";

interface GnoContextType {
  readonly initialized: boolean;
  readonly init: (signer: GnoClient) => void;
  readonly clear: () => void;
  readonly config: Partial<AppConfig>;
  readonly client: LcdClient | undefined;
  readonly changeConfig: (updates: Partial<AppConfig>) => void;
  readonly address: string;
  readonly balance: readonly Coin[];
  readonly refreshBalance: () => Promise<void>;
  readonly getSignerClient: () => GnoClient | undefined;
}

function throwNotInitialized(): any {
  throw new Error("Not yet initialized");
}

const defaultContext: GnoContextType = {
  initialized: false,
  init: throwNotInitialized,
  clear: throwNotInitialized,
  config: {},
  client: undefined,
  changeConfig: throwNotInitialized,
  address: "",
  balance: [],
  refreshBalance: throwNotInitialized,
  getSignerClient: () => undefined,
};

const GnoContext = React.createContext<GnoContextType>(defaultContext);

export const useSdk = (): GnoContextType => React.useContext(GnoContext);

interface SdkProviderProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  readonly config: AppConfig;
}

export function SdkProvider({ config: configProp, children }: SdkProviderProps): JSX.Element {
  const [config, setConfig] = useState(configProp);
  const [signerClient, setSignerClient] = useState<GnoClient>();
  const [client, setClient] = useState<LcdClient>();

  const contextWithInit = useMemo(() => ({ ...defaultContext, init: setSignerClient }), []);
  const [value, setValue] = useState<GnoContextType>(contextWithInit);

  const clear = useCallback(() => {
    setValue({ ...contextWithInit });
    setClient(undefined);
    setSignerClient(undefined);
    setConfig(configProp);
  }, [contextWithInit, configProp]);

  function changeConfig(updates: Partial<AppConfig>): void {
    setConfig((config) => ({ ...config, ...updates }));
  }

  const refreshBalance = useCallback(async (address: string, balance: Coin[]): Promise<void> => {
    if (!client) return;

    balance.length = 0;
    const response = await client.getBalance(address);
    if (response && response.balances.length > 0) balance.push(response.balances[0]);
  }, [client]);

  useEffect(() => {
    const client = createClient(config);
    setClient(client);
    setValue({ ...contextWithInit, client })
  }, [contextWithInit, config]);

  useEffect(() => {
    if (!signerClient || !client) return;

    const balance: Coin[] = [];

    (async function updateValue(): Promise<void> {
      const address = (await signerClient.getSigner().getAccounts())[0].address;

      await refreshBalance(address, balance);

      setValue({
        initialized: true,
        init: () => {},
        clear,
        config,
        client,
        changeConfig,
        address,
        balance,
        refreshBalance: refreshBalance.bind(null, address, balance),
        getSignerClient: () => signerClient,
      });
    })();
  }, [signerClient, clear, client, config, refreshBalance]);

  return <GnoContext.Provider value={value}>{children}</GnoContext.Provider>;
}

export function waitingTx(rpc: string, query: string): Promise<SubscriptionEvent> {
  if (rpc.startsWith("http")) {
    rpc = rpc.replace("http", "ws");
  }
  const client = new WebsocketClient(rpc)
  const rndId = Math.floor(Math.random() * 10000);

  const stream = client.listen({
    jsonrpc: "2.0",
    id: `gno-tools-${rndId}`,
    method: "subscribe",
    params: {
      query,
    },
  });

  return new Promise((resolve, reject) => {
    const sub = stream.subscribe({
      next: (tx) => {
        sub.unsubscribe();
        const txResult = tx.data.value.TxResult;
        if (txResult && txResult.result.code) {
          reject(txResult.result.log);
          return;
        }
        resolve(tx);
      },
      error: (err) => {
        reject(err);
      }
    });
  });
}