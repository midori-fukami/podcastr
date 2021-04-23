import format from 'date-fns/format'
import enUS from 'date-fns/locale/en-US';

import styles from './styles.module.scss';

export function Header() {
    const currentDate = format(new Date(), 'EEEE, MMMM d', {
        locale: enUS,
    })

    return (
        <header className={styles.headerContainer}>
            <img src="/logo.svg" alt="Logo Podcastr" />

            <p>O melhor de todos para ouvir</p>

            <span>{currentDate}</span>
        </header>
    );
}