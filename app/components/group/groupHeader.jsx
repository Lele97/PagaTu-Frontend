import React from 'react';
import styles from '~/styles/group.module.css';

const GroupHeader = React.memo(function GroupHeader({ group }) {
    return (
        <div className={styles.groupHeader}>
            <h1 className={styles.sectionTitle} style={{ textAlign: 'left', margin: 0 }}>
                <i className="fa-solid fa-user-group" /> {group?.groupName || 'No Group Name'}
            </h1>
        </div>
    );
});

export default GroupHeader;