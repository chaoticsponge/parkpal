import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import { FC, useCallback } from "react";
import AddSlot from "./AddSlot";
import { Information } from "@/components/SelectPark/SelectPark";

type props = {
  information: Information;
  onPendingChange: (pending: boolean) => void;
  onError: (message: string) => void;
  onSuccess: (slot: { _id: string; plate: string; date: string }) => void;
}

const SendSOL: FC<props> = ({ information, onPendingChange, onError, onSuccess }) => {

    const DEVMODE = false;
    // const PRICE = 0.15;
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const finalizeBooking = useCallback(async () => {
      const slotResponse = await AddSlot(information);

      if(slotResponse?.error) {
        throw new Error(slotResponse.error.message || "Payment succeeded but slot booking failed.");
      }

      if(!slotResponse?.data?.slot?._id) {
        throw new Error("Payment succeeded but no booking confirmation was returned.");
      }

      onSuccess(slotResponse.data.slot);
    }, [information, onSuccess]);

    const onClick = useCallback(async () => {
        if(information.date === '') return null;

        try {
          onPendingChange(true);

          if(!DEVMODE){
          if (!publicKey) throw new WalletNotConnectedError();

          // 0.005 SOL
          const lamports = LAMPORTS_PER_SOL * 0.015 * information.timeSlot.length;

          const transaction = new Transaction().add(
              SystemProgram.transfer({
                  fromPubkey: publicKey,
                  toPubkey: new PublicKey("Hh3cwe4EEgWDgy8htkqbL3PzxVaYSB74qH1w3kt6Gv3L"),
                  lamports,
              })
          );

          const {
              context: { slot: minContextSlot },
              value: { blockhash, lastValidBlockHeight }
          } = await connection.getLatestBlockhashAndContext();

          const signature = await sendTransaction(transaction, connection, { minContextSlot });

          let confirmation;

          try {
            confirmation = await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
          } catch (confirmationError) {
            const signatureStatus = await connection.getSignatureStatus(signature, {
              searchTransactionHistory: true,
            });

            if(signatureStatus.value?.confirmationStatus || signatureStatus.value?.err === null) {
              await finalizeBooking();
              return;
            }

            throw confirmationError;
          }

          if(confirmation.value.err) {
            throw new Error("Transaction failed on-chain.");
          }

          await finalizeBooking();
          return;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Payment failed. Please try again.";
        onError(message);
      } finally {
        onPendingChange(false);
      }
    }, [information, DEVMODE, publicKey, connection, sendTransaction, onPendingChange, onError, finalizeBooking]);

    return (
      <button onClick={onClick} disabled={!publicKey} style={{
        width: '100%',
        background: 'var(--success)',
        padding: '1rem',
        border: '1px solid var(--text-dim)',
        color: 'var(--text-neg)',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1.25rem',
        borderRadius: '0.25rem',
      }}>
        Confirm Payment
      </button>
    )
};

export default SendSOL;
