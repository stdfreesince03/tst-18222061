import axios from 'axios';

/**
 * Converts USD to SOL using real-time price data.
 * @param {number} usdAmount - The amount in USD to convert.
 * @returns {Promise<number>} - The equivalent amount in SOL.
 */
export const convertUsdToSol = async (usdAmount) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');

        const solPriceInUsd = response.data.solana.usd;

        const solAmount = (usdAmount / solPriceInUsd).toFixed(6); // Round to 6 decimal places
        return parseFloat(solAmount);
    } catch (error) {
        console.error('Error fetching SOL price:', error);
        throw new Error('Failed to convert USD to SOL.');
    }
};