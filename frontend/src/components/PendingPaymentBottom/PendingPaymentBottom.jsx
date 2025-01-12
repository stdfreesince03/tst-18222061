import React, { useState } from 'react';
import classes from './pendingpaymentbottom.module.css';

export default function PendingPaymentBottom({ status, wallet, onCopy, onVerify }) {
    const [copyStatus, setCopyStatus] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(wallet);
        setCopyStatus(true);
        setTimeout(() => {
            setCopyStatus(false);
            onCopy && onCopy(); // Trigger additional callback if provided
        }, 2000);
    };

    return (
        <div className={classes.container}>
            {/* Pending Status */}
            <div className={classes.pending_status}>
                Payment Status: {status}
            </div>

            {/* Copy and Verify Buttons */}
            <div className={classes.buttons_row}>
                <div className={classes.copy_wallet}>
                    <button
                        onClick={handleCopy}
                        className={`${classes['copy-button']} ${copyStatus ? classes.copied : ''}`}
                    >
                        {copyStatus ? 'Copied!' : 'Copy Wallet Address'}
                    </button>
                </div>

                <button onClick={onVerify} className={classes['verify-button']}>
                    Verify Payment
                </button>
            </div>
        </div>
    );
}