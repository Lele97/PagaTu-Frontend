import React from 'react';
import styles from '~/styles/shared.module.css';

const CoffeeSeparator = () => (
    <div className={styles.separator} role="separator" aria-hidden="true">
        <div className={styles.separatorLeft} />
        <img src="/coffee-medium-svgrepo-com.svg" alt="" />
        <div className={styles.separatorRight} />
    </div>
);

export default CoffeeSeparator;