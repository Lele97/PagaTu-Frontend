import styles from "~/styles/home.module.css";
import React from "react";
import ErrorMessage from "~/components/shared/errorMessage.jsx";
import LoadingSpinner from "~/components/shared/loadingSpinner.jsx";
import PaginationControls from "~/components/shared/paginationControls.jsx";
import {
    formatRoundNumber,
    formatSkipsRemaining,
    getMemberForUser,
    isMyTurn,
} from "~/utils/groupHelpers";

const HomeGroups = React.memo(function HomeGroups({
                                                      onRetry,
                                                      groups,
                                                      addGroup,
                                                      groupsError,
                                                      groupsLoading,
                                                      currentGroupPage,
                                                      getTotalGroupPages,
                                                      setCurrentGroupPage,
                                                      handleGroupSelect,
                                                      selectedGroup,
                                                      currentUsername,
                                                  }) {

    if (groupsLoading) {
        return <LoadingSpinner message="Caricamento gruppi..."/>
    }

    if (groupsError) {
        const error =
            typeof groupsError === "string"
                ? groupsError
                : groupsError?.message || JSON.stringify(groupsError);

        return <ErrorMessage message={error} onRetry={onRetry}/>
    }

    if (!groups || groups.length === 0) {
        return (
            <section className={styles.groupSection}>
                <div className={styles.sectionHeader}>
                    <button onClick={addGroup} className={styles.createGroupButton}>
                        <i className="fa-solid fa-plus"></i>
                        Crea il tuo primo gruppo
                    </button>
                </div>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <i className="fa-solid fa-users"></i>
                    </div>
                    <h3>Non fai parte di nessun gruppo</h3>
                    <p>Inizia creando il tuo primo gruppo per gestire i pagamenti del caffè</p>
                </div>
            </section>
        )
    }

    return (
        <section className={styles.groupSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                    <i className="fa-solid fa-user-group"></i> I tuoi gruppi
                </h2>
                <button onClick={addGroup} className={styles.createGroupButton}>
                    <i className="fa-solid fa-plus"></i>
                    Crea nuovo gruppo
                </button>
            </div>

            <div className={styles.groupGrid}>
                {groups.map((group, index) => {
                    const memberCount = group.memberCount ?? group.userMembershipsdto?.length ?? 0;
                    const turnUsername = group.currentTurnUsername;
                    const myTurn = currentUsername && isMyTurn(group, currentUsername);
                    const me = currentUsername ? getMemberForUser(group, currentUsername) : null;
                    const turnLabel = turnUsername
                        ? (turnUsername === currentUsername ? 'Tocca a te' : `Turno: @${turnUsername}`)
                        : null;

                    return (
                        <div
                            key={group.id || group.name || index}
                            className={`${styles.groupCard} ${
                                selectedGroup === group.name ? styles.groupCardSelected : ''
                            }`}
                            onClick={() => handleGroupSelect(group.name)}
                        >
                            <div className={styles.groupIcon}>
                                <i className="fa-solid fa-user-group" />
                            </div>
                            <div className={styles.groupInfo}>
                                <h3 className={styles.groupName}>{group.name}</h3>
                                {group.description && (
                                    <p className={styles.groupDescription}>{group.description}</p>
                                )}
                                <div className={styles.groupMeta}>
                                    {formatRoundNumber(group) && (
                                        <span className={styles.groupMetaItem}>
                                            <i className="fa-solid fa-arrows-rotate" />
                                            {formatRoundNumber(group)}
                                        </span>
                                    )}
                                    <span className={styles.groupMetaItem}>
                                        <i className="fa-solid fa-users" />
                                        {memberCount} {memberCount === 1 ? 'membro' : 'membri'}
                                    </span>
                                    {turnLabel && !myTurn && (
                                        <span className={styles.groupMetaItem}>
                                            <i className="fa-solid fa-mug-hot" />
                                            {turnLabel}
                                        </span>
                                    )}
                                    {myTurn && (
                                        <span className={styles.groupTurnBadge}>
                                            <i className="fa-solid fa-mug-hot" />
                                            È il tuo turno
                                        </span>
                                    )}
                                </div>
                                {me && (
                                    <p className={styles.groupTurnHint}>
                                        {formatSkipsRemaining(me, group.maxSkipPerMonth)}
                                    </p>
                                )}
                            </div>
                            <div className={styles.groupAction}>
                                <i className="fa-solid fa-arrow-right"></i>
                            </div>
                        </div>
                    );
                })}
            </div>
            <PaginationControls currentPage={currentGroupPage} totalPages={getTotalGroupPages}
                                onPageChange={setCurrentGroupPage}/>
        </section>
    );
})

export default HomeGroups;