import { OfflineAminoSigner, StdSignDoc } from "@cosmjs/amino";
import { AppConfig } from "../config";
import { LcdClient } from "../lcd";
import { makeProtoTx } from "../tx_utils";
import { BaseAccount, TxResponse } from "../types";

interface Msg {
  type: string;
  value: { [key in string]: any };
}

export class GnoClient {
    constructor(
        private config: AppConfig,
        private signer: OfflineAminoSigner,
        private lcd: LcdClient,
    ) {}

    getSigner(): OfflineAminoSigner {
      return this.signer;
    }
    /**
     * signAndBroadcast
     */
    async signAndBroadcast(sender: string, msgs: Msg[]): Promise<TxResponse> {
        const account = await this.lcd.getAccount(sender);
        const signDoc = this.createSignDoc(account, msgs, this.config, 2000000);
        const signRes = await this.signer.signAmino(sender, signDoc);  
        const stdTx = makeProtoTx(signRes.signed, signRes.signature);
        const response = await this.lcd.broadcastTx(stdTx);

        return response;
    }

    private createSignDoc(account: BaseAccount, msgs: Msg[], config: Partial<AppConfig>, gas: number): StdSignDoc {
      return {
        msgs,
        fee: {
          amount: [{
            amount: "1",
            denom: config.token.coinMinimalDenom
          }], gas: gas.toString()
        },
        chain_id: config.chainId!,
        memo: "",
        account_number: account.account_number,
          sequence: account.sequence,
      };
    }
}