  export interface AccountResponse {
    BaseAccount: BaseAccount
  }
  
  export interface BaseAccount {
    address: string
    coins: string
    public_key: PublicKey
    account_number: string
    sequence: string
  }
  
  export interface PublicKey {
    "@type": string
    value: string
  }
  

  export interface BalanceResponse {
    balances: Coin[]
  }
  
  export interface Coin {
    denom: string
    amount: string
  }
  
  export interface TxResponse {
    result: Result
    hash: string
    height: number
  }
  
  export interface Result {
    Error: any
    Data: string
    Events: any
    Log: string
    Info: string
    GasWanted: number
    GasUsed: number
  }

