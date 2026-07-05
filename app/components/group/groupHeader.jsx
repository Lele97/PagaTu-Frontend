import React from 'react';
import styles from '~/styles/group.module.css';
import { formatRoundProgress, getCurrentTurnMember, getDisplayName } from '~/utils/groupHelpers';

const GroupHeader = React.memo(function GroupHeader({ group, currentUser }) {
    const memberCount = group?.memberCount ?? group?.userMembershipsdto?.length ?? 0;
    const currentTurn = getCurrentTurnMember(group);
    const roundProgress = formatRoundProgress(group);
    const me = group?.userMembershipsdto?.find((m) => m.username === currentUser);

    return (
        <div className={styles.groupHeader}>
            <div>
                <h1 className={styles.sectionTitle} style={{ textAlign: 'left', margin: 0 }}>
                    <i className="fa-solid fa-user-group" /> {group?.groupName || group?.name || 'No Group Name'}
                    {me?.isAdmin && <span className={styles.adminBadge}>admin</span>}
                </h1>
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