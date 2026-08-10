import React from 'react';
import styles from '~/styles/shared.module.css';

// Icone decorative sparse in background, fedeli al mockup di design
// (posizioni/dimensioni/opacità/rotazioni riprese 1:1 dal prototipo per
// ciascuna schermata: splash, welcome, home, group).
const PATTERNS = {
    splash: [
        { icon: 'mug-hot', top: '8%', left: '5%', size: 56, opacity: 0.05, rotate: -15 },
        { icon: 'mug-saucer', top: '70%', left: '9%', size: 48, opacity: 0.045, rotate: 10 },
        { icon: 'seedling', top: '16%', right: '7%', size: 60, opacity: 0.05, rotate: 20 },
        { icon: 'cookie-bite', bottom: '10%', right: '11%', size: 46, opacity: 0.045, rotate: -8 },
        { icon: 'mortar-pestle', bottom: '16%', left: '40%', size: 44, opacity: 0.04, rotate: 6 },
        { icon: 'leaf', top: '4%', left: '38%', size: 40, opacity: 0.04 },
        { icon: 'mug-hot', top: '38%', left: '2%', size: 38, opacity: 0.04, rotate: 8 },
        { icon: 'seedling', bottom: '34%', right: '3%', size: 42, opacity: 0.04, rotate: -14 },
        { icon: 'mug-saucer', bottom: '4%', left: '20%', size: 36, opacity: 0.04, rotate: 12 },
        { icon: 'cookie-bite', top: '22%', right: '24%', size: 34, opacity: 0.035, rotate: -6 },
    ],
    welcome: [
        { icon: 'mug-hot', top: 90, left: '3%', size: 64, opacity: 0.05, rotate: -12 },
        { icon: 'seedling', top: 540, right: '4%', size: 70, opacity: 0.05, rotate: 18 },
        { icon: 'mortar-pestle', bottom: 60, left: '7%', size: 56, opacity: 0.045 },
        { icon: 'mug-saucer', top: 270, left: '36%', size: 44, opacity: 0.04, rotate: -6 },
        { icon: 'cookie-bite', bottom: 330, right: '9%', size: 48, opacity: 0.045, rotate: 10 },
        { icon: 'leaf', top: 880, right: '28%', size: 46, opacity: 0.045 },
        { icon: 'mug-hot', top: 420, left: '16%', size: 38, opacity: 0.04, rotate: 9 },
        { icon: 'seedling', bottom: 180, right: '22%', size: 40, opacity: 0.04, rotate: -10 },
    ],
    home: [
        { icon: 'mug-hot', top: 120, left: '2%', size: 52, opacity: 0.045, rotate: -10 },
        { icon: 'seedling', top: 700, right: '2%', size: 58, opacity: 0.045, rotate: 14 },
        { icon: 'mortar-pestle', bottom: 60, left: '36%', size: 44, opacity: 0.04 },
        { icon: 'cookie-bite', top: 340, right: '20%', size: 40, opacity: 0.04, rotate: 8 },
        { icon: 'leaf', bottom: 420, left: '14%', size: 38, opacity: 0.04, rotate: -8 },
        { icon: 'mug-saucer', top: 520, left: '48%', size: 42, opacity: 0.035 },
    ],
    group: [
        { icon: 'mug-hot', top: 120, right: '3%', size: 54, opacity: 0.045, rotate: 12 },
        { icon: 'seedling', bottom: 60, left: '3%', size: 56, opacity: 0.045, rotate: -10 },
        { icon: 'cookie-bite', top: 360, left: '20%', size: 40, opacity: 0.04, rotate: 6 },
        { icon: 'mortar-pestle', bottom: 320, right: '16%', size: 42, opacity: 0.04 },
        { icon: 'leaf', top: 600, right: '40%', size: 38, opacity: 0.035 },
    ],
};

const toCss = (value) => (typeof value === 'number' ? `${value}px` : value);

const CoffeePatternIcons = ({ variant }) => {
    const items = PATTERNS[variant];
    if (!items) return null;

    return (
        <div className={styles.coffeePattern} aria-hidden="true">
            {items.map((item, index) => (
                <i
                    key={`${variant}-${index}`}
                    className={`fa-solid fa-${item.icon}`}
                    style={{
                        position: 'absolute',
                        top: item.top !== undefined ? toCss(item.top) : undefined,
                        bottom: item.bottom !== undefined ? toCss(item.bottom) : undefined,
                        left: item.left !== undefined ? toCss(item.left) : undefined,
                        right: item.right !== undefined ? toCss(item.right) : undefined,
                        fontSize: `${item.size}px`,
                        opacity: item.opacity,
                        transform: item.rotate ? `rotate(${item.rotate}deg)` : undefined,
                    }}
                />
            ))}
        </div>
    );
};

export default CoffeePatternIcons;
