import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { convertUsdToSol } from '../../utils/currencyConverter';
import styles from './solstrapay.module.css';
import { createSolPayment } from '../../services/paymentService';
import { createOrder } from '../../services/orderService';
import { useCart } from '../../hooks/useCart';

const SolstraPayButton = ({ order }) => {
    const [status, setStatus] = useState('');
    const [recipientWallet, setRecipientWallet] = useState(null);
    const [solAmount, setSolAmount] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isPaymentModalMinimized, setIsPaymentModalMinimized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copyStatus, setCopyStatus] = useState(false);
    const { clearCart } = useCart();
    const navigate = useNavigate();


    useEffect(() => {
        const fetchSolAmount = async () => {
            try {
                const amount = await convertUsdToSol(order.totalPrice);
                setSolAmount(amount);
            } catch (error) {
                console.error('Error converting price:', error);
            }
        };
        fetchSolAmount();
    }, [order.totalPrice]);

    const createPayment = async () => {
        try {
            setIsLoading(true);
            setStatus('Creating payment...');

            const response = await createSolPayment(solAmount);
            const { walletAddress, id } = response.data.data;

            if (!walletAddress) throw new Error('No wallet address received');

            const pendingOrder = {
                ...order,
                statusData: {
                    solAmount,
                    paymentID: id,
                    recipientWallet: walletAddress,
                },
            };
            const createdOrder = await createOrder(pendingOrder);
            await clearCart();

            setRecipientWallet(walletAddress);
            setIsConfirmModalOpen(false);
            setIsPaymentModalMinimized(false);
            setStatus('Payment created. Please copy the recipient wallet address and make the payment manually.');

            navigate(`/payment/${createdOrder._id}`);
        } catch (error) {
            console.error('Payment creation error:', error);
            setStatus(`Failed to create payment: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(recipientWallet);
        setCopyStatus(true);
        setTimeout(() => {
            setCopyStatus(false);
            setIsPaymentModalMinimized(true); // Minimize the modal after copying
        }, 2000);
    };

    return (
        <div style={{ textAlign: 'center', position: 'relative' }}>
            {/* Main Pay Button */}
            <button
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={isLoading}
                className={styles.button}
            >
                {isLoading ? 'Processing...' : `$${order.totalPrice} USD`}
            </button>

            {/* Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-content']}>
                        <button className={styles['close-button']} onClick={() => setIsConfirmModalOpen(false)}>
                            &times;
                        </button>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Confirm Order</h2>
                        <p>
                            By confirming, an order will be created. You must complete the payment of {solAmount} SOL within the given timeframe to avoid order cancellation.
                        </p>
                        <button
                            onClick={createPayment}
                            disabled={isLoading}
                            className={styles['confirm-button']}
                        >
                            {isLoading ? 'Processing...' : 'Confirm and Pay'}
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {recipientWallet && (
                <div
                    className={`${styles['modal-overlay']} ${
                        isPaymentModalMinimized ? styles['minimized'] : ''
                    }`}
                >
                    <div className={styles['modal-content']}>
                        <button
                            className={styles['close-button']}
                            onClick={() => setIsPaymentModalMinimized(!isPaymentModalMinimized)}
                        >
                            {isPaymentModalMinimized ? '+' : 'X'}
                        </button>

                        {!isPaymentModalMinimized && (
                            <>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Manual Payment</h2>
                                <p><strong>Amount:</strong> {solAmount} SOL</p>
                                <p><strong>Recipient Wallet:</strong></p>
                                <div className={styles.wallet}>{recipientWallet}</div>

                                <p>Copy the wallet address and manually send the payment using your Phantom Wallet.</p>
                                <button
                                    onClick={handleCopy}
                                    className={`${styles['copy-button']} ${copyStatus ? styles.copied : ''}`}
                                >
                                    {copyStatus ? 'Copied!' : 'Copy Wallet Address'}
                                </button>
                            </>
                        )}

                        {isPaymentModalMinimized && (
                            <div className={styles['minimized-info']}>
                                {/*<span>{solAmount} SOL</span>*/}
                                {/*<span>Recipient: {recipientWallet.slice(0, 6)}...{recipientWallet.slice(-4)}</span>*/}
                                <button
                                    className={styles['next-button']}
                                    onClick={() => navigate(`/payment/${order._id}`)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Status Message */}
            {status && (
                <p
                    className={
                        status.includes('successful')
                            ? styles['status-success']
                            : status.includes('Failed')
                                ? styles['status-failed']
                                : styles['status-info']
                    }
                >
                    {status}
                </p>
            )}
        </div>
    );
};

export default SolstraPayButton;