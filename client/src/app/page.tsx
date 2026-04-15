import styles from './page.module.css'
import WalletWrapper from '@/components/Providers/WalletConnectProvider'
import Navigation from '@/components/Navigation/Navigation'
import Carlist from '@/components/Carlist/Carlist'
import { UserContextProvider, useUser } from '@/hooks/useUser'
import SelectPark from '@/components/SelectPark/SelectPark'

export default function Home() {

  return (
    <main className={styles.main}>
      <UserContextProvider>
        <WalletWrapper>
          <div className={styles.layout}>
            <Navigation />
            <section className={styles.columns}>
              <div className={styles.sideColumn}>
                <Carlist mode="vehicles" />
              </div>
              <div className={styles.centerColumn}>
                <SelectPark />
              </div>
              <div className={styles.sideColumn}>
                <Carlist mode="bookings" />
              </div>
            </section>
          </div>
        </WalletWrapper>
      </UserContextProvider>
    </main>
  )
}
