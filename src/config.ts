import { AppConfig, getAppConfig, NetworkConfigs } from "./services/config/network";

const local: AppConfig = {
  chainId: "testing",
  chainName: "Testing",
  addressPrefix: "g",
  rpcUrl: "http://localhost:26657",
  httpUrl: "http://localhost:1317",
  token: {
    coinDenom: "GNOT",
    coinDecimals: 6,
    coinMinimalDenom: "gnot"
  },
  gasPrice: 0.00001,
};

export const testnet: AppConfig = {
  chainId: "testchain",
  chainName: "Gno Tesnet",
  addressPrefix: "g",
  rpcUrl: "http://gno.land:36657",
  httpUrl: "https://lcd.gno.tools",
  token: {
    coinDenom: "GNOT",
    coinDecimals: 6,
    coinMinimalDenom: "gnot"
  },
  gasPrice: 0.00000000000001
};

export const test2: AppConfig = {
  chainId: "test2",
  chainName: "Gno Test2",
  addressPrefix: "g",
  rpcUrl: "http://173.255.228.38:36657",
  httpUrl: "https://lcd.gno.tools",
  token: {
    coinDenom: "GNOT",
    coinDecimals: 6,
    coinMinimalDenom: "ugnot"
  },
  gasPrice: 0.00000000000001
};

export interface Token {
  readonly denom: string;
  readonly name: string;
  readonly decimals: number;
  readonly logo?: string
}

export const coins: Token[] = [
  {
    denom: "ugnot",
    name: "GNOT",
    decimals: 6,
  },
];

const configs: NetworkConfigs = { local, testnet, test2 };
export const config = getAppConfig(configs);
