import React from 'react';

const InfoBox = React.memo(({ title, items }) => {
    return (
        <div
            style={{
                backgroundColor: 'var(--coffee-50)',
                padding: '1rem',
                borderRadius: '0.5rem',
                margin: '1rem 0',
                borderLeft: '3px solid var(--coffee-600)',
            }}
        >
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>
                {title}
            </p>
            <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
});

InfoBox.displayName = 'InfoBox';
export default InfoBox;