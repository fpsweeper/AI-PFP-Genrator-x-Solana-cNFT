import { Injectable, Input } from "@angular/core";
import { Observable } from "rxjs";
const { api_endpoint } = require("./config.json");
import { WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { encode } from "bs58";
import { defer, from, throwError } from "rxjs";
import { concatMap, first, map } from "rxjs/operators";
import { ConnectionStore, WalletStore } from "@heavy-duty/wallet-adapter";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { resolve } from "path";

@Injectable({
  providedIn: "root",
})
export class WalletsService {
  /*************************************************************/
  @Input() public modal:any = null;

  public popup: Subject<any> = new Subject<any>();

  public walletKey:any = "";
  public wallName = "";
  readonly connection$ = this._connectionStore.connection$;
  readonly wallets$ = this._walletStore.wallets$;
  readonly wallet$ = this._walletStore.wallet$;
  readonly walletName$ = this.wallet$.pipe(
    map((wallet) => wallet?.adapter.name || null)
  );
  readonly ready$ = this.wallet$.pipe(
    map(
      (wallet) =>
        wallet &&
        (wallet.adapter.readyState === WalletReadyState.Installed ||
          wallet.adapter.readyState === WalletReadyState.Loadable)
    )
  );
  readonly connected$ = this._walletStore.connected$;
  readonly publicKey$ = this._walletStore.publicKey$;
  lamports = 0;
  recipient = "";
  /*************************************************************/

  constructor(
    public readonly _connectionStore: ConnectionStore,
    public readonly _walletStore: WalletStore
  ) {
    console.log("I'aaaaaaam constructor");
    this.publicKey$.subscribe((x) => {
      if (x == null) {
        //sessionStorage.setItem('walletaddress', '')
        if (sessionStorage.getItem("walletaddress") != null)
          if (sessionStorage.getItem("walletaddress") != "")
            this.walletKey = sessionStorage.getItem("walletaddress");
      } else {
        this.walletKey = x.toString();

        //sessionStorage.setItem('walletaddress', x.toString())

        sessionStorage.setItem("walletaddress", x.toString());

        console.log(sessionStorage.getItem("walletaddress"))
      }
    });
    console.log(this.publicKey$);
    this._connectionStore.setEndpoint(
      "https://empty-blissful-mound.solana-mainnet.quiknode.pro/b8306702b4976d4ad7a1fae80199c99257e2ce0b/"
    );
    this._walletStore.setAdapters([
      new PhantomWalletAdapter(),
      //new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      /*new TorusWalletAdapter(),
              new LedgerWalletAdapter(),*/
      //new SolletWalletAdapter({ network: WalletAdapterNetwork.Mainnet }),
    ]);
  }

  onConnect() {
    return new Promise((resolve, reject) => {
      console.log('sqgfhds,bn,')
      this._walletStore.connect().subscribe((response) => {
        this.publicKey$.pipe(
          map((wallet: any) => {
            wallet &&
              (wallet.adapter.readyState === WalletReadyState.Installed ||
                wallet.adapter.readyState === WalletReadyState.Loadable);
  
              
          })
        );
        resolve(true)
      });
    })
    
  }

  onDisconnect() {
    this._walletStore.disconnect().subscribe();
    this.walletKey = "";
    this.wallName = "";
    sessionStorage.setItem("walletaddress", "");
  }

  async onSelectWallet(walletName: WalletName) {
    this.wallName = walletName;
    sessionStorage.setItem("wallName", walletName);
    this._walletStore.selectWallet(walletName);
  }

  onSendTransaction(fromPubkey: PublicKey) {
    this.connection$
      .pipe(
        first(),
        isNotNull,
        concatMap((connection) =>
          from(defer(() => connection.getLatestBlockhash())).pipe(
            concatMap(({ blockhash, lastValidBlockHeight }) =>
              this._walletStore.sendTransaction(
                new Transaction({
                  blockhash,
                  feePayer: fromPubkey,
                  lastValidBlockHeight,
                }).add(
                  SystemProgram.transfer({
                    fromPubkey,
                    toPubkey: new PublicKey(this.recipient),
                    lamports: this.lamports,
                  })
                ),
                connection
              )
            )
          )
        )
      )
      .subscribe({
        next: (signature) => console.log(`Transaction sent (${signature})`),
        error: (error) => console.error(error),
      });
  }

  onSignTransaction(fromPubkey: PublicKey) {
    this.connection$
      .pipe(
        first(),
        isNotNull,
        concatMap((connection) =>
          from(defer(() => connection.getLatestBlockhash())).pipe(
            map(({ blockhash, lastValidBlockHeight }) =>
              new Transaction({
                blockhash,
                feePayer: fromPubkey,
                lastValidBlockHeight,
              }).add(
                SystemProgram.transfer({
                  fromPubkey,
                  toPubkey: new PublicKey(this.recipient),
                  lamports: this.lamports,
                })
              )
            )
          )
        ),
        concatMap((transaction) => {
          const signTransaction$ =
            this._walletStore.signTransaction(transaction);

          if (!signTransaction$) {
            return throwError(
              () => new Error("Sign transaction method is not defined")
            );
          }

          return signTransaction$;
        })
      )
      .subscribe({
        next: (transaction) => console.log("Transaction signed", transaction),
        error: (error) => console.error(error),
      });
  }

  onSignAllTransactions(fromPubkey: PublicKey) {
    this.connection$
      .pipe(
        first(),
        isNotNull,
        concatMap((connection) =>
          from(defer(() => connection.getLatestBlockhash())).pipe(
            map(({ blockhash, lastValidBlockHeight }) =>
              new Array(3).fill(0).map(() =>
                new Transaction({
                  blockhash,
                  feePayer: fromPubkey,
                  lastValidBlockHeight,
                }).add(
                  SystemProgram.transfer({
                    fromPubkey,
                    toPubkey: new PublicKey(this.recipient),
                    lamports: this.lamports,
                  })
                )
              )
            )
          )
        ),
        concatMap((transactions) => {
          const signAllTransaction$ =
            this._walletStore.signAllTransactions(transactions);

          if (!signAllTransaction$) {
            return throwError(
              () => new Error("Sign all transactions method is not defined")
            );
          }

          return signAllTransaction$;
        })
      )
      .subscribe({
        next: (transactions) =>
          console.log("Transactions signed", transactions),
        error: (error) => console.error(error),
      });
  }

  onSignMessage() {
    const signMessage$ = this._walletStore.signMessage(
      new TextEncoder().encode("Hello world!")
    );

    if (!signMessage$) {
      return console.error(new Error("Sign message method is not defined"));
    }

    signMessage$.pipe(first()).subscribe((signature) => {
      console.log(`Message signature: ${{ encode }.encode(signature)}`);
    });
  }

}

export const isNotNull = <T>(source: Observable<T | null>) =>
  source.pipe(filter((item: T | null): item is T => item !== null));
