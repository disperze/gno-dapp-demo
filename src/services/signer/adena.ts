import {
  OfflineAminoSigner,
  AccountData,
  StdSignDoc,
  AminoSignResponse
} from "@cosmjs/amino";
import { fromBase64, toHex } from "@cosmjs/encoding";

interface RequestDocontractMessage {
  message: {
    type: string;
    value: { [key in string]: any };
  };
  gasFee: number;
  gasWanted: number;
  memo?: string;
}

export interface AdenaSignResponse extends AminoSignResponse {
    readonly txHash: string;
    readonly height: number;
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
  async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AdenaSignResponse> {
      const accounts = await this.getAccounts();
      const accountIndex = accounts.findIndex((account) => account.address === signerAddress);

      if (accountIndex === -1) {
          throw new Error(`Address ${signerAddress} not found in wallet`);
      }

      const adenaRequest: RequestDocontractMessage = {
          message: {
              type: signDoc.msgs[0].type,
              value: signDoc.msgs[0].value,
          },
          gasFee: parseInt(signDoc.fee.amount[0].amount),
          gasWanted: parseInt(signDoc.fee.gas),
          memo: signDoc.memo,
      };
      const res = await (window as any).adena.DoContract(adenaRequest)
      if (res.code !== 0) {
          throw new Error(res.message);
      }
      alert(res.message);

      return {
          signed: signDoc,
          signature: {
              signature: "",
              pub_key: {
                  type: "",
                  value: "",
              }
          },
          txHash: toHex(fromBase64(res.data.hash)).toUpperCase(),
          height: parseInt(res.data.height),
      };
  }
}