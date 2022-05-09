  export interface AccountResponse {
    account: BaseAccount
  }
  
  export interface BaseAccount {
    address: string
    pub_key: PublicKey
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
    txhash: string
    height: number
    code: number
    gas_wanted: number
    gas_used: number
    data: string
    raw_log: string
  }
  

