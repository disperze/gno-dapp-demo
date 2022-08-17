import { StdSignDoc, StdSignature } from "@cosmjs/amino";
import { BaseAccount } from "./types";
import { AppConfig } from "./config";
import { Tx, Signature, Fee } from 'gnojs-types/gnoland/tx/tx';
import { MsgCall } from "gnojs-types/gnoland/vm/msg";
import { MsgSend } from "gnojs-types/gnoland/bank/msg";
import { PubKeySecp256k1 } from 'gnojs-types/gnoland/tm/keys';
import { Any } from "gnojs-types/google/protobuf/any";
import { Int53 } from "@cosmjs/math";
import Long from 'long';

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
  
  export function createTransferMsg(sender: string, recipient: string, amount: string) {
    return {
      type: "/bank.MsgSend",
      value: {
        from_address: sender,
        to_address: recipient,
        amount: amount,
      }
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
        func: "CreateThread",
        args: [
          bid.toString(),
          title,
          body
        ]
      }
    };
  }
  
  export function createUserMsg(sender: string, inviter: string, username: string, profile: string) {
    return  {
      type: "/vm.m_call",
      value: {
        caller: sender,
        send: !inviter ? "200000000ugnot" : "",
        pkg_path: "gno.land/r/users",
        func: "Register",
        args: [
          inviter,
          username,
          profile
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
  
  export function encodeType(type: string, msg: any) {
    switch (type) {
      case "/vm.m_call":
        return MsgCall.encode({
          caller: msg.caller,
          send: msg.send,
          pkgPath: msg.pkg_path,
          func: msg.func,
          args: msg.args,
        }).finish();
      case "/bank.MsgSend":
        return MsgSend.encode({
          fromAddress: msg.from_address,
          toAddress: msg.to_address,
          amount: msg.amount,
        }).finish();
      default:
        throw new Error("Unknown type: " + type);
    }
  }
  
  export function makeProtoTx(
    content: StdSignDoc,
    signature: StdSignature,
  ): Uint8Array {
    const gasWanted = Int53.fromString(content.fee.gas).toNumber();
  
    const tx = Tx.fromPartial({
      messages: content.msgs.map((m: any) => Any.fromPartial({
        typeUrl: m.type,
        value: encodeType(m.type, m.value),
      })),
      fee: Fee.fromPartial({
        gasWanted: Long.fromNumber(gasWanted),
        gasFee: `${content.fee.amount[0].amount}${content.fee.amount[0].denom}`,
      }),
      signatures: [
        Signature.fromPartial({
          pubKey: Any.fromPartial({
            // TODO: Fix pub key type from Browser Wallet and Ledger
            typeUrl: "/tm.PubKeySecp256k1", // signature.pub_key.type, 
            value: PubKeySecp256k1.encode({
              key: signature.pub_key.value,
            }).finish(),
          }),
          signature: Buffer.from(signature.signature, 'base64')
        })
      ],
      memo: content.memo,
    });
  
    return Tx.encode(tx).finish();
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
            "@type": signature.pub_key.type,
            value: signature.pub_key.value,
          },
          signature: signature.signature,
        }
      ],
      memo: content.memo,
    };
}

export function getErrorMsg(log?: string) {
  if (!log) {
    return "";
  }

  const validKeys = ["Data", "Msg Traces", "Stack Trace"];
  const getKey = (line: string) => {
    for (let j = 0; j < validKeys.length; j++) {
      if (line.startsWith(validKeys[j])) {
        return validKeys[j];
      }
    }
    return "";
  };

  const lines = log.split("\n");
  const objResult = {} as any;
  let lastkey = '';
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const key = getKey(line);
    if (key) {
      lastkey = key;
      objResult[key] = [];
      line = line.replace(key+":", "");
    }

    line = line.trim();
    if (line && lastkey) {
      objResult[lastkey].push(line);
    }
  }
  console.log(objResult);
  const dataErr = objResult["Data"][0];
  if (dataErr && dataErr.startsWith("errors.FmtError")) {
    return dataErr.substring(dataErr.lastIndexOf("\\t") + 2).replace('"}}', "").trim();
  }

  const traceError = objResult["Msg Traces"][0];
  if (traceError) {
    return traceError.substring(traceError.indexOf("-") + 1).trim();
  }

  return log;
}