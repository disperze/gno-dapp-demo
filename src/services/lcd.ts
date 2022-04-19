import axios, { AxiosInstance } from "axios";
import { AccountResponse, BalanceResponse } from "./types";

export class LcdClient {
    constructor(private instance: AxiosInstance) {
    }

    async getAccount(address: string): Promise<AccountResponse> {
        const res = await this.instance.get(`/cosmos/auth/v1beta1/accounts/${address}`);
        
        return res.data;
    }

    async getBalance(address: string): Promise<BalanceResponse> {
        const res = await this.instance.get(`/cosmos/bank/v1beta1/balances/${address}`);
        
        return res.data; 
    }

    async broadcastTx(tx: any) {
        const payload = {
            tx: tx,
        };

        const res = await this.instance.post("/txs/", JSON.stringify(payload), {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return res.data;
    }
}
