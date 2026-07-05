import styles from '~/styles/group.module.css';
import TurnIndicator from '~/components/group/TurnIndicator.jsx';
import {
    formatPaymentStatus,
    formatRoundNumber,
    formatSkipsRemaining,
    getMembers,
    memberDisplayName,
    memberInitial,
} from '~/utils/groupHelpers';

const statusClass = (status, myTurn) => {
    if (myTurn) return styles.memberStatusTurn;
    if (status === 'PAGATO') return styles.memberStatusPaid;
    if (status === 'SALTATO') return styles.memberStatusSkipped;
    return styles.memberStatusPending;
};

const GroupInfoSection = ({ group, currentUser }) => {
    const members = getMembers(group);
    if (!members.length) return null;

    const currentTurn = group?.currentTurnUsername;
    const paid = group?.roundPaidCount ?? 0;
    const pending = group?.roundPendingCount ?? 0;
    const roundLabel = formatRoundNumber(group);

    return (
        <section className={styles.groupInfoSection}>
            <div className={styles.groupInfoHeader}>
                <h2 className={styles.sectionTitle}>
                    <i className="fa-solid fa-user-group" /> Membri e turno
                    {roundLabel && <span className={styles.roundBadge}>{roundLabel}</span>}
                </h2>
                <div className={styles.roundStats}>
                    <span><i className="fa-solid fa-circle-check" /> {paid} pagati</span>
                    <span><i className="fa-solid fa-hourglass-half" /> {pending} in attesa</span>
                </div>
            </div>

            {currentTurn && (
                <div className={styles.turnBanner}>
                    <i className="fa-solid fa-mug-hot" />
                    <span>
                        Turno di <strong>{currentTurn}</strong>
                        {currentTurn === currentUser && ' — tocca a te!'}
                    </span>
                </div>
            )}

            <TurnIndicator members={members} />

            <div className={styles.membersList}>
                {members.map((member) => (
                    <div key={member.username} className={styles.memberRow}>
                        <div className={styles.memberMain}>
                            <div className={`${styles.memberAvatar} ${member.myTurn ? styles.memberAvatarActive : ''}`}>
                                {memberInitial(member)}
                            </div>
                            <div>
                                <div className={styles.memberName}>
                                    {memberDisplayName(member)}
                                    {member.username === currentUser && (
                                        <span className={styles.youBadge}>tu</span>
                                    )}
                                    {member.isAdmin && (
                                        <span className={styles.adminBadge}>admin</span>
                                    )}
                                </div>
                                <div className={styles.memberMeta}>
                                    @{member.username}
                                </div>
                            </div>
                        </div>
                        <div className={styles.memberStats}>
                            <span className={`${styles.memberStatus} ${statusClass(member.status, member.myTurn)}`}>
                                {member.myTurn ? 'Turno attivo' : formatPaymentStatus(member.status)}
                            </span>
                            <span className={styles.memberSkip}>
                                {formatSkipsRemaining(member, group.maxSkipPerMonth)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default GroupInfoSection;