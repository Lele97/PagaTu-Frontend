import React from 'react';
import styles from '~/styles/header.module.css';
import BuyMeACoffeeButton from '~/components/buttons/BuyMeACoffeeButton.jsx';
import { useSettings } from '~/context/SettingsContext.jsx';
import { AVATAR_PRESETS } from '~/services/userApi';

const Header = ({ user, logout, showGroupSettings = false, avatarKey = 'default' }) => {
    const { openUserSettings, openGroupSettings } = useSettings();
    const avatar = AVATAR_PRESETS.find((a) => a.key === avatarKey) || AVATAR_PRESETS[0];

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <BuyMeACoffeeButton />

                <div className={styles.logoTitleContainer}>
                    <img
                        src="/pagaTu.webp"
                        alt="PagaTu - Logo applicazione caffè aziendale"
                        width={200}
                        height={300}
                        className={styles.pagatu_image}
                    />
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.coffeeAvatar} aria-label={`Utente ${user}`}>
                        <i className={`bi ${avatar.icon} ${styles.avatarIcon}`} />
                        <span className={styles.coffeeLetter}>
                            {user?.charAt(0).toUpperCase()}
                        </span>
                    </div>

                        <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => openUserSettings('profile')}
                            title="Impostazioni"
                            aria-label="Impostazioni utente"
                        >
                            <i className="bi bi-gear" />
                        </button>

                    {showGroupSettings && (
                        <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={openGroupSettings}
                            title="Impostazioni gruppo"
                            aria-label="Impostazioni gruppo"
                        >
                            <i className="bi bi-sliders" />
                        </button>
                    )}

                    <div onClick={logout} className={styles.door_container} role="button" tabIndex={0} aria-label="Esci">
                        <div className={styles.top_bar} />
                        <div className={styles.door_frame} />
                        <div className={styles.door_panel} />
                        <div className={styles.doorknob}>
                            <div className={styles.doorknob_inner} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;