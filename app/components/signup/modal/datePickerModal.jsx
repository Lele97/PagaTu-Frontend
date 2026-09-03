import styles from "~/styles/signup.module.css";
import { useEffect, useRef, useState } from "react";
import React from "react";

const CustomSelect = ({ value, options, onChange, visibleItems }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const listRef = useRef(null);
    const selected = options.find((o) => o.value === value) ?? options[0];

    useEffect(() => {
        if (!isOpen) return;
        const handleOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target))
                setIsOpen(false);
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && listRef.current) {
            const el = listRef.current.querySelector(`.${styles.dpSelected}`);
            if (el) {
                const list = listRef.current;
                list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2;
            }
        }
    }, [isOpen]);



    return (
        <div className={styles.dpSelectWrap} ref={containerRef}>
            <button
                type="button"
                className={`${styles.dpTrigger} ${isOpen ? styles.dpTriggerOpen : ""}`}
                onClick={() => setIsOpen((o) => !o)}
            >
                <span>{selected?.label}</span>
                <span className={`${styles.dpArrow} ${isOpen ? styles.dpArrowUp : ""}`}>▾</span>
            </button>

            {isOpen && (
                <div
                    ref={listRef}
                    className={styles.dpDropdown}
                    style={{ maxHeight: `${visibleItems * 36}px` }}
                >
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            className={`${styles.dpOption} ${opt.value === value ? styles.dpSelected : ""}`}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── costanti statiche ───────────────────────────────────────── */
const MONTHS = [
    "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
    "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
].map((label, i) => ({ value: i, label }));

const CY = new Date().getFullYear();
const YEARS = Array.from({ length: CY - 1939 }, (_, i) => ({
    value: CY - i, label: String(CY - i),
}));

function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

function buildDays(y, m) {
    return Array.from({ length: daysInMonth(y, m) }, (_, i) => ({
        value: i + 1, label: String(i + 1).padStart(2, "0"),
    }));
}

function parse(dateStr) {
    if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d)) return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
    }
    return { y: CY - 25, m: 0, d: 1 };
}

/* ─── DatePickerInline ────────────────────────────────────────── */
const DatePickerModal = React.memo(({ initialDate, onConfirm, onClose }) => {
    const init = parse(initialDate);
    const [year, setYear] = useState(init.y);
    const [month, setMonth] = useState(init.m);
    const [day, setDay] = useState(init.d);

    /* clamp giorno se il mese/anno cambia */
    useEffect(() => {
        const max = daysInMonth(year, month);
        if (day > max) setDay(max);
    }, [year, month]);

    /* Escape → chiudi */
    useEffect(() => {
        const fn = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", fn);
        return () => document.removeEventListener("keydown", fn);
    }, [onClose]);

    const confirm = () => {
        const d = new Date(year, month, day + 1);
        onConfirm(d.toISOString().split("T")[0]);
    };

    return (
        <div className={styles.dpPanel}>

            {/* riga select */}
            <div className={styles.dpRow}>
                <div className={styles.dpCol}>
                    <span className={styles.dpLabel}>Giorno</span>
                    <CustomSelect value={day} options={buildDays(year, month)} onChange={setDay} visibleItems={3} />
                </div>
                <div className={styles.dpDivider} />
                <div className={`${styles.dpCol} ${styles.dpColWide}`}>
                    <span className={styles.dpLabel}>Mese</span>
                    <CustomSelect value={month} options={MONTHS} onChange={setMonth} visibleItems={3} />
                </div>
                <div className={styles.dpDivider} />
                <div className={`${styles.dpCol} ${styles.dpColYear}`}>
                    <span className={styles.dpLabel}>Anno</span>
                    <CustomSelect value={year} options={YEARS} onChange={setYear} visibleItems={3} />
                </div>
            </div>

            {/* pulsanti compatti */}
            <div className={styles.dpActions}>
                <button type="button" onClick={onClose} className={styles.dpCancel}>
                    <i className="fa-solid fa-xmark" /></button>
                <button type="button" onClick={confirm} className={styles.dpConfirm}>
                    <i className="fa-solid fa-check" />
                </button>
            </div>

        </div>
    );
});

export default DatePickerModal;