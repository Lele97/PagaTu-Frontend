import styles from "~/styles/home.module.css";
import React from "react";

const PaginationControls = React.memo(function PaginationControls({
                                                                      totalPages, onPageChange, currentPage
                                                                  }) {

    if (totalPages <= 1) return null;

    return (
        <div className={styles.paginationControls}>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                    className={styles.paginationButton}><i className="bi bi-arrow-left"></i></button>
            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => onPageChange(page)}
                        className={`${styles.paginationButton} ${currentPage === page ? styles.paginationButtonActive : ''}`}>
                    {page}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                    className={styles.paginationButton}><i className="bi bi-arrow-right"></i>
            </button>
        </div>
    )
})

export default PaginationControls;