"use client";
import React, { useEffect, useState } from 'react';
import styles from './SelectPark.module.scss';
import { useUser } from '@/hooks/useUser';
import AvailabilitySlots from '@/libs/@server/AvailabilitySlots';
import SendSOL from '@/libs/@server/BookSlot';
import calendar from './Calendar.module.scss';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConvertIDtoParking } from '@/util/ConvertIDtoParking';

export type Information = {
  date: string;
  timeSlot: number[];
  plate: string;
}

const MonthData = {
  'January': 1,
  'February': 2,
  'March': 3,
  'April': 4,
  'May': 5,
  'June': 6,
  'July': 7,
  'August': 8,
  'September': 9,
  'October': 10,
  'November': 11,
  'December': 12
}

type Availability = {
  date: string;
  timeSlots: {
    [key: number]: number;
  };
  userSlots?: number[];
}

type dateData = {
  day?: number;
  month: number;
  year: number;
}

type Slot = {
  id: string;
  slot: {
    _id: string;
    createdAt: string;
    date: string;
    plate: string;
    timeSlot: number[];
    updatedAt: string;
    version: number;
  }
}

type PurchaseDialog = {
  open: boolean;
  status?: 'pending' | 'success' | 'error';
  message?: string;
  slot?: {
    date: string;
    plate: string;
    id: string;
  }
}

const SelectPark = () => {

  const { user } = useUser();
  const { connected, publicKey } = useWallet();

  // Temporarily set the max slots to 30 for testing
  const MAX_SLOTS = 2;

  const [ dateData, setDateData ] = useState<dateData>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const [ information, setInformation ] = useState<Information>({
    date: '',
    timeSlot: [],
    plate: ''
  });

  const [ availableSlots, setAvailableSlots ] = useState<Availability | undefined>(undefined);
  const [ loadingSlots, setLoadingSlots ] = useState<boolean>(false);
  const [ purchaseDialog, setPurchaseDialog ] = useState<PurchaseDialog>({
    open: false
  });

  useEffect(() => {
    if(!purchaseDialog.open || purchaseDialog.status === 'pending' || !purchaseDialog.status) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.location.reload();
    }, 2500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [purchaseDialog.open, purchaseDialog.status]);

  // fetch available slots from the server
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if(!information.plate || !information.date) return;

      setLoadingSlots(true);
      await AvailabilitySlots({
        date: information.date,
        plate: information.plate
      }).then((data) => {
        if(data.error || !data.data?.slotData) {
          setLoadingSlots(false);
          return;
        }

        setAvailableSlots({
          date: data.data.slotData.date,
          timeSlots: data.data.slotData.timeSlots,
          userSlots: data.data.userSlots.length > 0 ? data.data.userSlots[0].timeSlot : []
        });

        setLoadingSlots(false);
      }).catch((err) => {
        console.error(err);
      });
    };

    if(!availableSlots) {
      fetchAvailableSlots();
    }
    
  }, [availableSlots, information.date, information.plate])

  const UpdateDate = (direction: 'next' | 'prev', type: 'month' | 'year') => {

    setInformation({
      ...information,
      timeSlot: [],
      date: ''
    })

    switch(type) {
      case 'month':
        if(direction === 'next') {
          // increment but if it is 12, set it to 1 and add 1 to the year
          setDateData({
            day: undefined,
            year: dateData?.month && dateData.month + 1 > 12 ? dateData.year + 1 : dateData.year,
            month: dateData?.month && dateData.month + 1 > 12 ? 1 : dateData.month + 1
          })
        } else {
          
          // if its the current year and current month, dont allow the user to go below the current month
          if(dateData?.year && dateData.year === new Date().getFullYear() && dateData?.month && dateData.month === new Date().getMonth() + 1) return null;

          // decrement but if it is 1, set it to 12 and subtract 1 from the year
          setDateData({
            day: undefined,
            year: dateData?.month && dateData.month - 1 < 1 ? dateData.year - 1 : dateData.year,
            month: dateData?.month && dateData.month - 1 < 1 ? 12 : dateData.month - 1
          })
        }
        break;
      case 'year':
        if(direction === 'next') {
          setDateData({
            ...dateData,
            day: undefined,
            year: dateData?.year ? dateData.year + 1 : new Date().getFullYear() + 1
          })
        } else {

          // if its the current year, do not allow the user to go below the current year
          if(dateData?.year && dateData.year === new Date().getFullYear()) return null;

          // if the year reduces to the current year, and is below the current month set the month to the current month
          if((dateData?.year && dateData.year - 1 === new Date().getFullYear()) &&
            dateData?.month && dateData.month < new Date().getMonth() + 1
          ){
            return setDateData({
              day: undefined,
              month: new Date().getMonth() + 1,
              year: dateData?.year ? dateData.year - 1 : new Date().getFullYear() - 1
            })
          }

          setDateData({
            ...dateData,
            day: undefined,
            year: dateData?.year ? dateData.year - 1 : new Date().getFullYear() - 1
          })
        }
        break;
    }
  }

  if(!user || (user.plates && user.plates.length <= 0)) return null;

  return (
    <section className={styles.sect}>
      { purchaseDialog.open && (
        <div className={styles.dialog}>
          <section className={styles.dialogPanel}>
            {purchaseDialog.status === 'pending' && (
              <div className={styles.loadingWrap}>
                <div className={styles.loadingRing} />
                <span className={styles.loadingLabel}>Submitting on devnet</span>
              </div>
            )}
            <span className={styles.dialogHeadline}>
              {purchaseDialog.status === 'pending' && 'Processing Payment'}
              {purchaseDialog.status === 'success' && 'Slot Purchased'}
              {purchaseDialog.status === 'error' && 'Payment Failed'}
            </span>
            {purchaseDialog.status === 'pending' && (
              <span className={styles.dialogSubtext}>Waiting for wallet approval, network confirmation, and booking finalization.</span>
            )}
            {purchaseDialog.status === 'success' && purchaseDialog.slot?.id && (
              <>
                <span className={styles.dialogSubtext}>Your slot has been purchased successfully for <b>{purchaseDialog.slot?.date}</b> and car plate <b>{purchaseDialog.slot.plate}</b></span>
                <span className={styles.dialogSubtext}>Please park at: <span style={{
              fontWeight: 'bold',
              fontSize: '1.25rem'
            }}>{ConvertIDtoParking(purchaseDialog.slot.id)}</span></span>
              </>
            )}
            {purchaseDialog.status === 'error' && (
              <span className={styles.dialogSubtext}>{purchaseDialog.message || 'The transaction was not completed.'}</span>
            )}
            {purchaseDialog.status !== 'pending' && (
              <span className={styles.dialogHint}>Reloading page...</span>
            )}
            {purchaseDialog.status !== 'pending' && (
              <button onClick={() => {
                setPurchaseDialog({
                  open: false,
                  status: undefined,
                  message: undefined,
                  slot: undefined
                });
              }} className={styles.dialogButton}>Close</button>
            )}
          </section>
          <div className={styles.dialogBG} />
        </div>
      )}
      { (connected && publicKey && user && user.plates.length > 0) && 
      <section className={styles.innerCont}>
        <span className={styles.headline}>Select a Car</span>
        <select onChange={(e) => {
          setAvailableSlots(undefined);

          setDateData({
            ...dateData,
            day: undefined
          })

          setInformation({
            date: '',
            timeSlot: [],
            plate: e.target.value
          })
        }}
        className={styles.selectInput}
        >
          <option value="" className={styles.selectOption} style={{
            display: 'none'
          }} disabled selected>Select a Car</option>
          {user.plates && user.plates.map((plate, index) => {
            return (
              <option key={index} value={plate}>{plate}</option>
            )
          })}
        </select>
        
      </section>
      }
      { information.plate && (
      <section className={calendar.innerCont}>
        <span className={styles.headline}>Select a Date</span>
        <div className={calendar.container}>
          <section className={calendar.yearPicker}>
            <button className={
              // if the year is the current year, and the month is the current month, disable the button
              dateData?.year && dateData.year === new Date().getFullYear() ? calendar.nextDisabled : calendar.next
            } onClick={() => UpdateDate('prev', 'year')}>{'<'}</button>
            <span>{dateData?.year ? dateData.year : new Date().getFullYear()}</span>
            <button className={calendar.next} onClick={() => UpdateDate('next', 'year')}>{'>'}</button>
          </section>

          {/* similar to the year picker, a month selector left and right */}
          <section className={calendar.monthPicker}>
            {/* if it goes under 1, set it to 12, if it goes over 12, set it to 1 */}
            <button className={
              // if the year is the current year, and the month is the current month, disable the button
              dateData?.year && dateData.year === new Date().getFullYear() && dateData?.month && dateData.month - 1 < new Date().getMonth() + 1 ? calendar.nextDisabled : calendar.next
            } onClick={() => UpdateDate('prev', 'month')}>{'<'}</button>
            <span>{dateData?.month ? Object.keys(MonthData)[dateData.month - 1] : Object.keys(MonthData)[new Date().getMonth()]}</span>
            <button className={calendar.next} onClick={() => UpdateDate('next', 'month')}>{'>'}</button>
          </section>

          <section className={calendar.dayPicker}>
            {/* In this day picker, it will be a grid of 10 days per row, please calculate based on the year, the number of days to input into the array */}
            {Array.from({length: new Date(dateData.year, dateData.month, 0).getDate()}, (_, i) => i + 1).map((day, index) => {
              return (
                <button key={index} 
                disabled={
                  (dateData.year === new Date().getFullYear() &&
                  dateData.month === new Date().getMonth() + 1 &&
                  day < new Date().getDate()) ? true : false
                }
                onClick={() => {

                  if(dateData.year === new Date().getFullYear() &&
                  dateData.month === new Date().getMonth() + 1 &&
                  day < new Date().getDate()) return null;

                  setAvailableSlots(undefined);

                  setDateData({
                    ...dateData,
                    day
                  })

                  setInformation({
                    ...information,
                    timeSlot: [],
                    date: `${dateData.year}-${dateData.month}-${day}`
                  })
                }} className={dateData?.day === day ? calendar.daySelected : 
                  (dateData.year === new Date().getFullYear() &&
                  dateData.month === new Date().getMonth() + 1 &&
                  day < new Date().getDate()) ? calendar.dayDisabled :
                  calendar.day}
                
                  style={{
                    // if today is the day, make the color red
                    border: dateData.year === new Date().getFullYear() && dateData.month === new Date().getMonth() + 1 && day === new Date().getDate() ? '1px solid var(--text)' : 'none'
                  }}
                  
                >{day}</button>
              )
            })}
          </section>      
        </div>
          <div className={calendar.timeSlotCont}>
          { information.date && availableSlots && availableSlots.date === information.date ? (
              <div className={styles.timeSlotCont}>
              {Array.from({length: 24}, (_, i) => i).map((time, index) => {
                return (
                  <button key={index} onClick={() => {
                    if(information.timeSlot.includes(time)) {
                      setInformation({
                        ...information,
                        timeSlot: information.timeSlot.filter((slot: number) => slot !== time)
                      })
                    } else {
                      setInformation({
                        ...information,
                        timeSlot: [...information.timeSlot, time]
                      })
                    }
                  }}
                  
                  // we disable it if the time slot with the index cross checks availableSlots and the timeSlots object, with the key being the index and the value
                  // being the number of available slots, if the value in availableSlots is 5, meaning its full, we disable the button
                  disabled={(availableSlots && availableSlots.timeSlots[time] >= MAX_SLOTS ? true : false) || (availableSlots && availableSlots.userSlots && availableSlots.userSlots.includes(time) ? true : false)}
                  className={
                    // if time slot is full, make it styles.unavailableSlot, if the user has already selected the time slot, make it styles.timeSlotSelected and selected, if the user has not selected the time slot, make it styles.timeSlot
                    ( availableSlots.userSlots && availableSlots.userSlots.includes(time) ? styles.bookedSlot :
                      // if the user has already booked the slot, make it styles.bookedSlot
                      availableSlots && availableSlots.timeSlots[time] === MAX_SLOTS ? styles.unavailableSlot :
                      
                      information.timeSlot.includes(time) ? styles.timeSlotSelected : styles.timeSlot)
                  }>
                  { availableSlots && availableSlots.userSlots && availableSlots.userSlots.includes(time) ? (
                    <span>{time}:00 - {time + 1}:00 (Booked)</span>
                  ) : 
                  // if full, show it as full
                  availableSlots && availableSlots.timeSlots[time] === MAX_SLOTS ? (
                    <span>{time}:00 - {time + 1}:00 (Full)</span>
                  ) :
                  (
                    <span>
                      {time}:00 - {time + 1}:00 
                  {/* if this slot is available and not the max count */}
                  { (availableSlots && availableSlots.timeSlots[time] !== MAX_SLOTS &&
                    // is not selected by the user
                    !information.timeSlot.includes(time)
                  ) && (
                    <span style={{
                      // if more than 50% of the slots are taken, make the color red, else make it green
                      color: availableSlots.timeSlots[time] > MAX_SLOTS / 2 ? 'var(--error)' : 'var(--success)'
                    }}>
                    &nbsp;|&nbsp;{availableSlots && availableSlots.timeSlots[time] ? MAX_SLOTS - availableSlots.timeSlots[time] : MAX_SLOTS} Left
                    </span>
                  )}
                    </span>
                  )}
                    
                    
                  </button>
                )
              })}
            </div>
          ) : (
            <span className={calendar.subtext}>Select a Date to view available slots</span>
          )}
          </div>

      </section>
      )}

      { information.date && information.timeSlot.length > 0 && (
        <SendSOL
          information={information}
          onPendingChange={(pending) => {
            if(pending) {
              setPurchaseDialog({
                open: true,
                status: 'pending',
                message: undefined,
                slot: undefined
              });
              return;
            }

            setPurchaseDialog((previous) => {
              if(previous.status === 'pending') {
                return {
                  open: false,
                  status: undefined,
                  message: undefined,
                  slot: undefined
                };
              }

              return previous;
            });
          }}
          onError={(message) => {
            setPurchaseDialog({
              open: true,
              status: 'error',
              message,
              slot: undefined
            });
          }}
          onSuccess={(slot) => {
            setPurchaseDialog({
              open: true,
              status: 'success',
              message: undefined,
              slot: {
                date: slot.date,
                plate: slot.plate,
                id: slot._id
              }
            });
          }}
        />
      )}     
    </section>
  )
}

export default SelectPark;


// <section className={styles.slotSection}>
// { (
// information.date 
// && availableSlots 
// && availableSlots.date === information.date
// ) && (

// )}
// </section>
