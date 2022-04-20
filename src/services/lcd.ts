import { AxiosInstance } from "axios";
import { AccountResponse, BalanceResponse, TxResponse } from "./types";

export class LcdClient {
    constructor(private instance: AxiosInstance) {
    }

    async render(realm: string, query?: string): Promise<string> {
        const res = await this.instance.get(`/gno/render?realm=${realm}&query=${query ?? ""}`);
        
        return res.data;
    }

    async getAccount(address: string): Promise<AccountResponse> {
        const res = await this.instance.get(`/cosmos/auth/v1beta1/accounts/${address}`);
        
        return res.data;
    }

    async getBalance(address: string): Promise<BalanceResponse> {
        const res = await this.instance.get(`/cosmos/bank/v1beta1/balances/${address}`);
        
        return res.data; 
    }

    async broadcastTx(tx: any): Promise<TxResponse> {
        const payload = {
            tx: tx,
        };

        const res = await this.instance.post("/txs", JSON.stringify(payload), {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return res.data;
    }
}
