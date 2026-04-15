"use client";
import { Icon } from '@/util/Icons';
import styles from './Dialog.module.scss';
import { Dispatch, FC, ReactNode, SetStateAction } from "react";

export type DialogType = {
  isOpen: boolean;
  children: ReactNode;
}

type DialogProps = {
  setDialog: Dispatch<SetStateAction<DialogType>>
  children: ReactNode;
}
const Dialog: FC<DialogProps> = ({ setDialog, children }) => {
  return (
    <div className={styles.dialog} id="dialog-overview">
      <div className={styles.background} onClick={() => setDialog({
        isOpen: false,
        children: null
      })}/>
      <section className={styles.dialogContent}>
        <Icon icon="close" onClick={() => setDialog({
          isOpen: false,
          children: null
        })} className={styles.dialogClose}/>
        { children }
      </section>
    </div>
  )
}

export default Dialog;