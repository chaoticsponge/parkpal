"use client";

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import styles from './Navigation.module.scss';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';

const Navigation = () => {

  const { connection } = useConnection();
  const { connected, publicKey, disconnecting } = useWallet();
  const { initialiseUser, disconnect } = useUser();

  useEffect(() => {
    if (connected && publicKey) {
      initialiseUser(publicKey.toBase58());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  useEffect(() => {
    if(disconnecting) {
      disconnect();
    }
  }, [disconnect, disconnecting])

  return (
    <nav className={styles.navigation}>
      <div className={styles.brand}>
        <img src="/parkpal.svg" alt="ParkPal" className={styles.logo} />
        <span className={styles.wordmark} aria-label="ParkPal">
          <span className={styles.wordmarkPark}>PARK</span>
          <span className={styles.wordmarkPal}>PAL</span>
        </span>
      </div>
      <div className={styles.wallet}>
        <WalletMultiButton />
      </div>
    </nav>
  )
}

export default Navigation;
