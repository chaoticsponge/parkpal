"use client";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { UnsafeBurnerWalletAdapter, PhantomWalletAdapter, CloverWalletAdapter, Coin98WalletAdapter, CoinbaseWalletAdapter, HuobiWalletAdapter, MathWalletAdapter, NekoWalletAdapter, NightlyWalletAdapter, SalmonWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter, TrustWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

const WalletWrapper = ({ children }: { children : React.ReactNode }) => {
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const network = WalletAdapterNetwork.Devnet;

    const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");

    if (!process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      console.warn("Missing NEXT_PUBLIC_SOLANA_RPC_URL, falling back to Solana devnet public RPC.");
    }
  
    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking --
    // Only the wallets you configure here will be compiled into your application
    const wallets = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new MathWalletAdapter(),
      new Coin98WalletAdapter(),
      new CloverWalletAdapter(),
      new HuobiWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new NekoWalletAdapter(),
      new TrustWalletAdapter(),
      new NightlyWalletAdapter(),
      new SalmonWalletAdapter(),
    ]

    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
}

require("@solana/wallet-adapter-react-ui/styles.css");

export default WalletWrapper;
