import { coins, Token } from "../config";
import { StdSignDoc, StdSignature } from "@cosmjs/amino";
import { BaseAccount } from "./types";
import { AppConfig } from "./config";

export function formatAddress(wallet: string): string {
  return ellideMiddle(wallet, 24);
}

export function ellideMiddle(str: string, maxOutLen: number): string {
  if (str.length <= maxOutLen) {
    return str;
  }
  const ellide = "…";
  const frontLen = Math.ceil((maxOutLen - ellide.length) / 2);
  const tailLen = Math.floor((maxOutLen - ellide.length) / 2);
  return str.slice(0, frontLen) + ellide + str.slice(str.length - tailLen, str.length);
}

export function getTokenConfig(denom: string): Token|undefined {
  return coins.find((c: any) => c.denom === denom);
}

export function formatPrice(price: {amount: string, denom: string}): string {
  const coin = getTokenConfig(price.denom)!;
  const amount = parseInt(price.amount) / Math.pow(10, coin.decimals);

  return amount + " " + coin.name;
}

export function toMinDenom(amount: number, denom: string): string {
  const coin = getTokenConfig(denom)!;
  return Math.floor(amount * Math.pow(10, coin.decimals)).toString();
}


export function parseResultId(base64Data: string): string {
  if (!base64Data) {
    return "";
  }
  
  const raw = atob(base64Data);
  const regExp = /\((\d+) /;

  const match = raw.match(regExp);
  if (!match) {
    return "";
  }

  return match[1];
}

export function parseBoards(raw: string): string[] {
  if (!raw) {
    return [];
  }

  const regExp = /\(([^)]+)\)/g;
  const matches = raw.match(regExp);
  if (!matches) {
    return [];
  }

  return matches.map((str) => str.substring(1, str.length - 1));
}

export function createSignDoc(account: BaseAccount, msg: any, config: Partial<AppConfig>, gas: number): StdSignDoc {
  return {
    msgs: [msg],
    fee: { amount: [{
      amount: "1",
      denom: config.token.coinMinimalDenom
    }], gas: gas.toString() },
    chain_id: config.chainId!,
    memo: "",
    account_number: account.account_number,
    sequence: account.sequence,
  };
}

export function createReplyMsg(sender: string, bid: number, threadid: number, postid: number, body: string) {
  return  {
    type: "/vm.m_call",
    value: {
      caller: sender,
      send: "",
      pkg_path: "gno.land/r/boards",
      func: "CreateReply",
      args: [
        bid.toString(),
        threadid.toString(),
        postid.toString(),
        body
      ]
    }
  };
}

export function createPostMsg(sender: string, bid: number, title: string, body: string) {
  return  {
    type: "/vm.m_call",
    value: {
      caller: sender,
      send: "",
      pkg_path: "gno.land/r/boards",
      func: "CreatePost",
      args: [
        bid.toString(),
        title,
        body
      ]
    }
  };
}

export function createDeleteMsg(sender: string, bid: number, threadid: number, postid: number, reason: string) {
  return  {
    type: "/vm.m_call",
    value: {
      caller: sender,
      send: "",
      pkg_path: "gno.land/r/boards",
      func: "DeletePost",
      args: [
        bid.toString(),
        threadid.toString(),
        postid.toString(),
        reason
      ]
    }
  };
}

export function makeGnoStdTx(
  content: StdSignDoc,
  signature: StdSignature,
) {

  return {
    msg: content.msgs.map((m: any) => ({
      '@type': m.type,
      ...m.value
    })),
    fee: {
      gas_wanted: content.fee.gas,
      gas_fee: `${content.fee.amount[0].amount}${content.fee.amount[0].denom}`,
    },
    signatures: [
      {
        pub_key: {
          "@type": "/tm.PubKeySecp256k1",
          value: signature.pub_key.value,
        },
        signature: signature.signature,
      }
    ],
    memo: content.memo,
  };
}