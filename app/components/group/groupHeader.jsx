import React from 'react';
import styles from '~/styles/group.module.css';
import {formatRoundProgress, getCurrentTurnMember, getDisplayName} from '~/utils/groupHelpers';

const GroupHeader = React.memo(function GroupHeader({group, currentUser, onGoBack, onOpenSettings, isAdmin}) {
    const memberCount = group?.memberCount ?? group?.userMembershipsdto?.length ?? 0;
    const currentTurn = getCurrentTurnMember(group);
    const roundProgress = formatRoundProgress(group);
    const me = group?.userMembershipsdto?.find((m) => m.username === currentUser);

    return (
        <div className={styles.groupHeader}>
            {onGoBack && (
                <button
                    type="button"
                    onClick={onGoBack}
                    className={styles.backButton}
                    aria-label="Torna alla home"
                    title="Torna alla home"
                >
                    <i className="fa-solid fa-arrow-left"/>
                </button>
            )}
            <div className={styles.groupHeaderContent}>
                <div className={styles.groupHeaderTopRow}>
                    <h1 className={styles.groupTitle}>
                        <i className="fa-solid fa-user-group"/> {group?.groupName || group?.name || 'No Group Name'}
                        {me?.isAdmin && <span className={styles.adminBadge}>admin</span>}
                    </h1>
                </div>
                <p className={styles.groupHeaderMeta}>
                    {memberCount} {memberCount === 1 ? 'membro' : 'membri'}
                    {roundProgress && <> · {roundProgress}</>}
                    {currentTurn && (
                        <> · Turno: <strong>{getDisplayName(currentTurn) || currentTurn.username}</strong></>
                    )}
                </p>
            </div>
        </div>
    );
});

export default GroupHeader;