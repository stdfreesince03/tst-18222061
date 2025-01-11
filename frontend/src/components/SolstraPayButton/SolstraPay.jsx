import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import axios from 'axios';
import SolPriceDisplay from "../SolPriceDisplay/SolPriceDisplay";
import bs58 from 'bs58';
import nacl from 'tweetnacl';




export default function SolstraPayButton({ order }) {
    const [status, setStatus] = useState('');
    const [recipientWallet, setRecipientWallet] = useState(null);
    const [senderWallet, setSenderWallet] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const CORS_PROXY = "http://localhost:8080/";
    const API_URL = "https://api-staging.solstra.fi/service/pay/create";
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

            const response = await axios.post(`${CORS_PROXY}${API_URL}`, {
                currency: 'SOL',
                amount: order.totalPrice,
            }, {
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IndpbmF0YXRyaXN0YW4wNEBnbWFpbC5jb20iLCJhdXRoIjoiZ29vZ2xlIiwiaXNBY3RpdmUiOnRydWUsImFwaUtleSI6ImVlNGVkZTFmLTFjZjItNGFhYS05ODI2LWY5ZTc0Y2NlNDQ0ZSIsImlhdCI6MTczNjUzOTk4MywiZXhwIjoxNzM2NTU0MzgzfQ.ueSNDSd_1ATG3kgwsIkLez33iopJQcywvdIP__UzWcg`,
                    'x-api-key': 'ee4ede1f-1cf2-4aaa-9826-f9e74cce444e',
                    'Content-Type': 'application/json',
                }
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

            let recipientPubKey;
            try {
                recipientPubKey = new PublicKey(recipientWallet);
            } catch (err) {
                throw new Error('Invalid recipient wallet address format');
            }


            let privateKeyUint8;
            try {

                const decodedKey = bs58.decode(senderWallet);


                if (decodedKey.length === 32) {
                    // If it's a 32-byte key, we need to derive the keypair
                    const keyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(decodedKey));
                    privateKeyUint8 = new Uint8Array([...decodedKey, ...keyPair.publicKey]);
                } else if (decodedKey.length === 64) {
                    // If it's already 64 bytes, just convert to Uint8Array
                    privateKeyUint8 = new Uint8Array(decodedKey);
                } else {
                    throw new Error('Invalid private key length');
                }
            } catch (err) {
                throw new Error('Invalid private key format: ' + err.message);
            }

            const senderKeypair = Keypair.fromSecretKey(privateKeyUint8);

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: senderKeypair.publicKey,
                    toPubkey: recipientPubKey,
                    lamports: Math.floor(order.totalPrice * 1_000_000_000), // Ensure integer
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