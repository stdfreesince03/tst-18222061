import React, { useState, useEffect } from 'react';
import { convertUsdToSol } from '../../utils/currencyConverter';

const SolPriceDisplay = ({ usdAmount }) => {
    const [solValue, setSolValue] = useState(null); // SOL value
    const [loading, setLoading] = useState(true);   // Loading state

    useEffect(() => {
        const fetchSolValue = async () => {
            try {
                setLoading(true);
                const sol = await convertUsdToSol(usdAmount);
                setSolValue(sol);
            } catch (error) {
                console.error('Error converting USD to SOL:', error);
                setSolValue('Error');
            } finally {
                setLoading(false);
            }
        };

        fetchSolValue();
    }, [usdAmount]);

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : solValue !== 'Error' ? (
                <p>{usdAmount} USD ≈ {solValue} SOL</p>
            ) : (
                <p>Failed to fetch SOL value.</p>
            )}
        </div>
    );
};

export default SolPriceDisplay;