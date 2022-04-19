import * as React from "react";
import { OfflineAminoSigner } from "@cosmjs/amino";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppConfig } from "../config/network";
import { createClient } from "./sdk";
import { LcdClient } from "../lcd";
import { Coin } from "../types";

interface GnoContextType {
  readonly initialized: boolean;
  readonly init: (signer: OfflineAminoSigner) => void;
  readonly clear: () => void;
  readonly config: Partial<AppConfig>;
  readonly client: LcdClient | undefined;
  readonly changeConfig: (updates: Partial<AppConfig>) => void;
  readonly address: string;
  readonly balance: readonly Coin[];
  readonly refreshBalance: () => Promise<void>;
  readonly getSigner: () => OfflineAminoSigner | undefined;
  readonly changeSigner: (newSigner: OfflineAminoSigner) => void;
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
  getSigner: () => undefined,
  changeSigner: throwNotInitialized,
};

const GnoContext = React.createContext<GnoContextType>(defaultContext);

export const useSdk = (): GnoContextType => React.useContext(GnoContext);

interface SdkProviderProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  readonly config: AppConfig;
}

export function SdkProvider({ config: configProp, children }: SdkProviderProps): JSX.Element {
  const [config, setConfig] = useState(configProp);
  const [signer, setSigner] = useState<OfflineAminoSigner>();
  const [client, setClient] = useState<LcdClient>();

  const contextWithInit = useMemo(() => ({ ...defaultContext, init: setSigner }), []);
  const [value, setValue] = useState<GnoContextType>(contextWithInit);

  const clear = useCallback(() => {
    setValue({ ...contextWithInit });
    setClient(undefined);
    setSigner(undefined);
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
    if (!signer || !client) return;

    const balance: Coin[] = [];

    (async function updateValue(): Promise<void> {
      const address = (await signer.getAccounts())[0].address;

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
        getSigner: () => signer,
        changeSigner: setSigner,
      });
    })();
  }, [signer, clear, client, config, refreshBalance]);

  return <GnoContext.Provider value={value}>{children}</GnoContext.Provider>;
}
