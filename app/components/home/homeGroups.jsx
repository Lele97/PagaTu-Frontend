import styles from "~/styles/home.module.css";
import React from "react";
import ErrorMessage from "~/components/shared/errorMessage.jsx";
import LoadingSpinner from "~/components/shared/loadingSpinner.jsx";
import PaginationControls from "~/components/shared/paginationControls.jsx";

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
                                                      selectedGroup
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
                        <i className="bi bi-plus-lg"></i>
                        Crea il tuo primo gruppo
                    </button>
                </div>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <i className="bi bi-people"></i>
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
                    <i className="bi bi-people-fill"></i> I tuoi gruppi
                </h2>
                <button onClick={addGroup} className={styles.createGroupButton}>
                    <i className="bi bi-plus-lg"></i>
                    Crea nuovo gruppo
                </button>
            </div>

            <div className={styles.groupGrid}>
                {groups.map((group, index) => (
                    <div
                        key={group.id || group.name || index}
                        className={`${styles.groupCard} ${
                            selectedGroup === group.name ? styles.groupCardSelected : ''
                        }`}
                        onClick={() => handleGroupSelect(group.name)}
                    >
                        <div className={styles.groupIcon}>
                            <i className="fa-solid fa-user-group"></i>
                        </div>
                        <div className={styles.groupInfo}>
                            <h3 className={styles.groupName}>{group.name}</h3>
                            {group.description && (
                                <p className={styles.groupDescription}>{group.description}</p>
                            )}
                        </div>
                        <div className={styles.groupAction}>
                            <i className="bi bi-arrow-right"></i>
                        </div>
                    </div>
                ))}
            </div>
            <PaginationControls currentPage={currentGroupPage} totalPages={getTotalGroupPages}
                                onPageChange={setCurrentGroupPage}/>
        </section>
    );
})

export default HomeGroups;