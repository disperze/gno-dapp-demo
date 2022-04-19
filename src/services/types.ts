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
  
  