import {
  OfflineAminoSigner,
  AccountData,
  StdSignDoc,
  AminoSignResponse
} from "@cosmjs/amino";
import { fromBase64 } from "@cosmjs/encoding";

interface RequestDocontractMessage {
  messages: {
    type: string;
    value: { [key in string]: any };
  }[];
  gasFee: number;
  gasWanted: number;
  memo?: string;
}

export class AdenaSigner implements OfflineAminoSigner {
  constructor(private accountData: any) {
  }

  getAccounts(): Promise<readonly AccountData[]> {
      return Promise.resolve([{
          address: this.accountData.address,
          algo: "secp256k1",
          pubkey: fromBase64(this.accountData.publicKey.value),
      }]);
  }
  async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
      const accounts = await this.getAccounts();
      const accountIndex = accounts.findIndex((account) => account.address === signerAddress);

      if (accountIndex === -1) {
          throw new Error(`Address ${signerAddress} not found in wallet`);
      }

      const adenaRequest: RequestDocontractMessage = {
          messages: signDoc.msgs.map(msg => ({
              type: msg.type,
              value: msg.value,
          })),
          gasFee: parseInt(signDoc.fee.amount[0].amount),
          gasWanted: parseInt(signDoc.fee.gas),
          memo: signDoc.memo,
      };
      const res = await (window as any).adena.Sign(adenaRequest)
      if (res.code !== 0) {
          throw new Error(res.message);
      }

      return {
          signed: res.data.signed,
          signature: res.data.signature,
      };
  }
}