import React from "react";
import styles from "~/styles/group.module.css";
import sharedStyles from "~/styles/shared.module.css";

const GroupHeader = React.memo(function GroupHeader({isAdmin, deleteGroup, group, inviteMember}) {
    return (
        <div className={styles.groupHeader}>
            <h1 className={styles.sectionTitle} style={{textAlign: 'left', margin: 0}}>
                <i className="fa-solid fa-user-group"></i> {group?.groupName || 'No Group Name'}
            </h1>
            {isAdmin && (<div className={styles.groupAdminButtons}>
                <button
                    onClick={deleteGroup}
                    className={`${sharedStyles.groupButton} ${styles.deleteButton}`}
                >
                    <i className="fa-solid fa-trash"></i> Elimina Gruppo
                </button>

                <button
                    onClick={inviteMember}
                    className={`${sharedStyles.groupButton} ${styles.inviteButton}`}
                >
                    <i className="fa-solid fa-user-plus"></i> Invita Membro
                </button>
            </div>)}
        </div>)
})

export default GroupHeader