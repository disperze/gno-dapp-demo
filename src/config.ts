import { AppConfig, getAppConfig, NetworkConfigs } from "./services/config/network";

const local: AppConfig = {
  chainId: "testing",
  chainName: "Testing",
  addressPrefix: "g",
  rpcUrl: "http://localhost:26657",
  httpUrl: "http://localhost:1317",
  token: {
    coinDenom: "STAKE",
    coinDecimals: 6,
    coinMinimalDenom: "ustake"
  },
  gasPrice: 0.025,
  codeId: 4,
  contract: "",
  marketContract: ""
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
  gasPrice: 0.00,
  codeId: 1,
  contract: "",
  marketContract: ""
};

export interface Token {
  readonly denom: string;
  readonly name: string;
  readonly decimals: number;
  readonly logo?: string
}

export const coins: Token[] = [
  {
    denom: "gnot",
    name: "GNOT",
    decimals: 6,
  },
];

const configs: NetworkConfigs = { local, testnet };
export const config = getAppConfig(configs);
