import {
  HttpClient,
  HttpEndpoint,
  RpcClient,
  WebsocketClient,
} from "@cosmjs/tendermint-rpc/build/rpcclients";
import { adaptor34, Decoder, Encoder, Params, Responses } from "@cosmjs/tendermint-rpc/build/tendermint34/adaptor";
import * as requests from "@cosmjs/tendermint-rpc/build/tendermint34/requests";
import * as responses from "@cosmjs/tendermint-rpc/build/tendermint34/responses";

// We cannot use client from @cosmjs/tendermint-rpc, because calls "status" method.
export class Tendermint34Client {
  /**
   * Creates a new Tendermint client for the given endpoint.
   *
   * Uses HTTP when the URL schema is http or https. Uses WebSockets otherwise.
   */
  public static async connect(endpoint: string | HttpEndpoint): Promise<Tendermint34Client> {
    if (typeof endpoint === "object") {
      return Tendermint34Client.create(new HttpClient(endpoint));
    } else {
      const useHttp = endpoint.startsWith("http://") || endpoint.startsWith("https://");
      const rpcClient = useHttp ? new HttpClient(endpoint) : new WebsocketClient(endpoint);
      return Tendermint34Client.create(rpcClient);
    }
  }

  /**
   * Creates a new Tendermint client given an RPC client.
   */
  public static async create(rpcClient: RpcClient): Promise<Tendermint34Client> {
    // For some very strange reason I don't understand, tests start to fail on some systems
    // (our CI) when skipping the status call before doing other queries. Sleeping a little
    // while did not help. Thus we query the version as a way to say "hi" to the backend,
    // even in cases where we don't use the result.
    // const _version = await this.detectVersion(rpcClient);
    return new Tendermint34Client(rpcClient);
  }

  private readonly client: RpcClient;
  private readonly p: Params;
  private readonly r: Responses;

  /**
   * Use `Tendermint34Client.connect` or `Tendermint34Client.create` to create an instance.
   */
  private constructor(client: RpcClient) {
    this.client = client;
    this.p = adaptor34.params;
    this.r = adaptor34.responses;
  }

  public disconnect(): void {
    this.client.disconnect();
  }

  /**
   * Get a single transaction by hash
   *
   * @see https://docs.tendermint.com/master/rpc/#/Info/tx
   */
  public async tx(params: requests.TxParams): Promise<responses.TxResponse> {
    const query: requests.TxRequest = { params: params, method: requests.Method.Tx };
    return this.doCall(query, this.p.encodeTx, this.r.decodeTx);
  }

  /**
   * Search for transactions that are in a block
   *
   * @see https://docs.tendermint.com/master/rpc/#/Info/tx_search
   */
  public async txSearch(params: requests.TxSearchParams): Promise<responses.TxSearchResponse> {
    const query: requests.TxSearchRequest = { params: params, method: requests.Method.TxSearch };
    return this.doCall(query, this.p.encodeTxSearch, this.r.decodeTxSearch);
  }

  // this should paginate through all txSearch options to ensure it returns all results.
  // starts with page 1 or whatever was provided (eg. to start on page 7)
  public async txSearchAll(params: requests.TxSearchParams): Promise<responses.TxSearchResponse> {
    let page = params.page || 1;
    const txs: responses.TxResponse[] = [];
    let done = false;

    while (!done) {
      const resp = await this.txSearch({ ...params, page: page });
      txs.push(...resp.txs);
      if (txs.length < resp.totalCount) {
        page++;
      } else {
        done = true;
      }
    }

    return {
      totalCount: txs.length,
      txs: txs,
    };
  }

  // doCall is a helper to handle the encode/call/decode logic
  private async doCall<T extends requests.Request, U extends responses.Response>(
    request: T,
    encode: Encoder<T>,
    decode: Decoder<U>,
  ): Promise<U> {
    const req = encode(request);
    const result = await this.client.execute(req);
    return decode(result);
  }
}