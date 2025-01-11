import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import axios from 'axios';
import SolPriceDisplay from "../SolPriceDisplay/SolPriceDisplay";



export default function SolstraPayButton({ order }) {
    const [status, setStatus] = useState('');
    const [recipientWallet, setRecipientWallet] = useState(null);
    const [senderWallet, setSenderWallet] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    useEffect(() => {
        if (recipientWallet) {
            setIsModalOpen(true);
        }
    }, [recipientWallet]);

    const createPayment = async () => {
        try {
            setIsLoading(true);
            setStatus('Creating payment...');

            const response = await axios.post('http://localhost:8000/api/solstra/pay/create',  {
                currency: 'SOL',
                amount: order.totalPrice,
            }, {
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
                    'x-api-key': 'ee4ede1f-1cf2-4aaa-9826-f9e74cce444e',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                withCredentials: false
            });

            if (!response.data?.data?.walletAddress) {
                throw new Error('No wallet address received');
            }

            const { walletAddress } = response.data.data;
            setRecipientWallet(walletAddress);
            setStatus('Payment created. Please enter your wallet details.');
        } catch (error) {
            console.error('Payment creation error:', error);
            setStatus('Failed to create payment: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const sendPayment = async () => {
        if (!senderWallet || !recipientWallet) {
            setStatus('Please enter valid wallet details');
            return;
        }

        try {
            setStatus('Sending payment...');
            setIsLoading(true);

            const senderKeypair = Keypair.fromSecretKey(
                new Uint8Array(JSON.parse(senderWallet))
            );

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: senderKeypair.publicKey,
                    toPubkey: new PublicKey(recipientWallet),
                    lamports: order.totalPrice * 1_000_000_000,
                })
            );

            const { blockhash } = await connection.getRecentBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = senderKeypair.publicKey;

            const signature = await connection.sendTransaction(transaction, [senderKeypair]);
            await connection.confirmTransaction(signature, 'confirmed');

            setStatus(`Payment successful! Transaction signature: ${signature}`);
            setIsModalOpen(false);
            setSenderWallet('');
        } catch (error) {
            console.error('Error sending payment:', error);
            setStatus('Failed to send payment: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', position: 'relative' }}>
            <button
                onClick={createPayment}
                disabled={isLoading}
                style={{
                    padding: '12px 36px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    color: '#ffffff',
                    background: isLoading ? '#cccccc' : 'linear-gradient(90deg, #3a0ca3, #7209b7)',
                    boxShadow: '0 6px 20px rgba(58, 12, 163, 0.5)',
                    transition: 'all 0.3s ease-in-out',
                    letterSpacing: '1px',
                    opacity: isLoading ? 0.7 : 1,
                }}
            >
                {isLoading ? 'Processing...' : order.totalPrice}
            </button>

            {isModalOpen && recipientWallet && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => {
                                setIsModalOpen(false);
                                setSenderWallet('');
                            }}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '10px',
                                background: 'none',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer'
                            }}
                        >
                            ×
                        </button>

                        <div style={{ marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px' }}>
                                Complete Your Payment
                            </h2>

                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Amount:</p>
                                <p style={{
                                    backgroundColor: '#f3f4f6',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem'
                                }}>
                                    {order.totalPrice} SOL
                                </p>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Recipient Wallet:</p>
                                <p style={{
                                    backgroundColor: '#f3f4f6',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    wordBreak: 'break-all',
                                    fontSize: '0.875rem'
                                }}>
                                    {recipientWallet}
                                </p>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '5px',
                                    fontWeight: '500'
                                }}>
                                    Your Wallet Private Key:
                                </label>
                                <input
                                    type="text"
                                    value={senderWallet}
                                    onChange={(e) => setSenderWallet(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        fontSize: '16px'
                                    }}
                                    placeholder="Enter your private key"
                                    disabled={isLoading}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSenderWallet('');
                                    }}
                                    disabled={isLoading}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        backgroundColor: '#fff',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={sendPayment}
                                    disabled={isLoading || !senderWallet}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        backgroundColor: isLoading || !senderWallet ? '#cccccc' : '#3a0ca3',
                                        color: 'white',
                                        cursor: isLoading || !senderWallet ? 'not-allowed' : 'pointer',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                >
                                    {isLoading ? 'Processing...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {status && (
                <p style={{
                    marginTop: '1rem',
                    fontSize: '0.875rem',
                    color: status.includes('successful') ? '#10B981' : status.includes('Failed') ? '#EF4444' : '#3B82F6'
                }}>
                    {status}
                </p>
            )}
        </div>
    );
}