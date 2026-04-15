"use client";
import { useEffect, useState } from 'react';
import styles from './RegisterCar.module.scss';
import { useUser } from '@/hooks/useUser';
import AddPlate from '@/libs/@server/AddPlate';

const RegisterCar = ({
  setDialog
} : {
  setDialog: Function
}) => {

  const [ plate, setPlate ] = useState<string>("");

  const { user, refetch } = useUser();

  const handlePlateChange = (e: string) => {

    // if the first character is a space, return
    if (e.length === 1 && e[0] === ' ') return;

    // if the key pressed is not a letter or number, return
    if (!e.match(/^[a-zA-Z0-9\s]*$/)) return;

    return setPlate(e.toUpperCase());
  }

  const handleSubmit = async () => {
    if(!user) return;
    // handle submit
    const address = user?.walletAddress;

    // call the AddPlate function from the server
    const res = await AddPlate({
      walletAddress: address,
      plate
    });

    if(res.error) {
      console.log(res.error);
      return;
    }

    refetch();
    setDialog({
      isOpen: false,
      children: null
    });
  }

  return (
    <>
      <section className={styles.numberPlate}>
        <label className={styles.text}>Enter Plate Number</label>
        <input 
        type="text" 
        placeholder="EXMPL 1234" 
        maxLength={10} 
        className={styles.plate} 
        value={plate} 
        onChange={(e) => handlePlateChange(e.target.value)}
        autoCapitalize='characters'  
      />
      </section>
      <button className={styles.submit} onClick={() => {
        handleSubmit();
      }} disabled={plate.length === 0}>
        Register Vehicle
      </button>
    </>
  )
}

export default RegisterCar;