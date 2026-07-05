import React from 'react';
import styles from '~/styles/group.module.css';
import { memberDisplayName, memberInitial } from '~/utils/groupHelpers';

const TurnIndicator = ({ members = [] }) => {
    if (!members.length) return null;

    return (
        <div className={styles.turnIndicator}>
            <span className={styles.turnIndicatorLabel}>
                <i className="fa-solid fa-list-ol" /> Coda turni
            </span>
            <div className={styles.turnQueue}>
                {members.map((member, index) => (
                    <div
                        key={member.username}
                        className={`${styles.turnAvatar} ${member.myTurn ? styles.turnAvatarActive : ''}`}
                        title={`${index + 1}. ${memberDisplayName(member)}`}
                    >
                        {memberInitial(member)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TurnIndicator;