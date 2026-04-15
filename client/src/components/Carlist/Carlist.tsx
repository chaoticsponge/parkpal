"use client";

import { Icon } from '@/util/Icons';
import styles from './Carlist.module.scss';
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from 'react';
import Dialog, { DialogType } from '../Dialog/Dialog';
import RegisterCar from '../Dialog/Dialogs/RegisterCar';
import { useUser } from '@/hooks/useUser';
import DeletePlate from '@/libs/@server/DeletePlate';
import GetUpcomingBookings from '@/libs/@server/GetUpcomingBookings';
import { ConvertIDtoParking } from '@/util/ConvertIDtoParking';

type UpcomingBooking = {
  _id: string;
  date: string;
  plate: string;
  timeSlot: number[];
}

const Carlist = ({
  mode = 'vehicles'
}: {
  mode?: 'vehicles' | 'bookings'
}) => {
  const { user, refetch } = useUser();
  const { connected, publicKey } = useWallet();
  const [ dialog, setDialog ] = useState<DialogType>({
    isOpen: false,
    children: null
  });
  const [ confirmDelete, setConfirmDelete ] = useState<{
    isOpen: boolean,
    plate?: string
  }>({
    isOpen: false,
    plate: undefined
  });
  const [ upcomingBookings, setUpcomingBookings ] = useState<UpcomingBooking[]>([]);
  const [ loadingBookings, setLoadingBookings ] = useState<boolean>(false);

  const isVehicles = mode === 'vehicles';

  const ConfirmDelete = async () => {
    if(!confirmDelete.plate || !user) return;

    await DeletePlate({
      walletAddress: user?.walletAddress,
      plate: confirmDelete.plate
    });

    setConfirmDelete({
      isOpen: false,
      plate: undefined
    });

    refetch();
  };

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      if(isVehicles) {
        return;
      }

      if(!connected || !publicKey || !user?.plates || user.plates.length === 0) {
        setUpcomingBookings([]);
        return;
      }

      setLoadingBookings(true);
      const response = await GetUpcomingBookings({
        plates: user.plates
      });

      setUpcomingBookings(response?.data?.bookings || []);
      setLoadingBookings(false);
    };

    fetchUpcomingBookings();
  }, [connected, publicKey, user?.plates, isVehicles]);

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, (month || 1) - 1, day || 1).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTimeRange = (timeSlot: number[]) => {
    const sortedSlots = [...timeSlot].sort((left, right) => left - right);

    if(sortedSlots.length === 0) {
      return "No time selected";
    }

    return `${sortedSlots[0]}:00 - ${sortedSlots[sortedSlots.length - 1] + 1}:00`;
  };

  return (
    <section className={`${styles.container} ${!isVehicles ? styles.fullHeight : ''}`}>
      {isVehicles && dialog.isOpen && (
        <Dialog setDialog={setDialog}>
          { dialog.children }
        </Dialog>
      )}
      <section className={styles.inner}>
        <section className={styles.headerSect}>
          <span className={styles.header}>
            {isVehicles ? 'Registered Vehicles' : 'Your Upcoming Bookings'}
          </span>
          { isVehicles && connected && publicKey && (
            <Icon icon="add" className={styles.addIcon} onClick={() => {
              setDialog({
                isOpen: true,
                children: <RegisterCar setDialog={setDialog} />
              });
            }} />
          )}
        </section>
        <section className={styles.carlist}>
          { isVehicles ? (
            connected && publicKey && user ? (
              <>
                { user.plates && user.plates.length === 0 ? <span className={styles.invalid}>No Registered Vehicles</span> :
                  user.plates && user.plates.map((plate, index) => (
                    <div className={styles.carItem} key={index}>
                      <span className={styles.carTag}>{plate}</span>
                      { confirmDelete.plate !== plate && (
                        <Icon icon="close" className={styles.deleteIcon} onClick={() => {
                          setConfirmDelete({
                            isOpen: true,
                            plate
                          });
                        }} />
                      )}
                      { confirmDelete.plate && confirmDelete.plate === plate && (
                        <div className={styles.confirmDeleteContainer}>
                          <span className={styles.confirmButton} onClick={() => {
                            ConfirmDelete();
                          }}>Delete?</span>
                          <span className={styles.confirmButton} onClick={() => {
                            setConfirmDelete({
                              isOpen: false,
                              plate: undefined
                            });
                          }}>Cancel</span>
                        </div>
                      )}
                      { confirmDelete.plate && confirmDelete.plate === plate && (
                        <div className={styles.backgroundDelete} />
                      )}
                    </div>
                  ))}
              </>
            ) : (
              <span className={styles.invalid}>Please connect a wallet to view registered Vehicles</span>
            )
          ) : connected && publicKey && user ? (
            <>
              { loadingBookings && <span className={styles.invalid}>Loading upcoming bookings...</span> }
              { !loadingBookings && upcomingBookings.length === 0 && (
                <span className={styles.invalid}>No upcoming bookings</span>
              )}
              { !loadingBookings && upcomingBookings.map((booking) => (
                <div className={styles.bookingItem} key={booking._id}>
                  <div className={styles.bookingMeta}>
                    <span className={styles.carTag}>{booking.plate}</span>
                    <span className={styles.bookingSlot}>Spot {ConvertIDtoParking(booking._id)}</span>
                  </div>
                  <div className={styles.bookingDetails}>
                    <span>{formatDate(booking.date)}</span>
                    <span>{formatTimeRange(booking.timeSlot)}</span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <span className={styles.invalid}>Please connect a wallet to view upcoming bookings</span>
          )}
        </section>
      </section>
    </section>
  );
}

export default Carlist;
