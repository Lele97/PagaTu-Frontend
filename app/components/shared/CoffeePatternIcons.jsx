import React, { memo } from 'react';
import styles from '~/styles/shared.module.css';

const CoffeePatternIcons = memo(function CoffeePatternIcons() {
    return <div className={styles.coffeePattern} aria-hidden="true" />;
});

export default CoffeePatternIcons;
