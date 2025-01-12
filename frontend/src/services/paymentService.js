import axios from "axios";


const CORS_PROXY = 'http://localhost:8080/';
const API_URL = 'https://api-staging.solstra.fi/service/pay/create';
const CHECK_PAYMENT_URL = 'https://api-staging.solstra.fi/service/pay';

export const createSolPayment = async (solAmount) =>{
    return await axios.post(`${CORS_PROXY}${API_URL}`, {
        currency: 'SOL',
        amount: solAmount,
    }, {
        headers: {
            Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IndpbmF0YXRyaXN0YW4wNEBnbWFpbC5jb20iLCJhdXRoIjoiZ29vZ2xlIiwiaXNBY3RpdmUiOnRydWUsImFwaUtleSI6ImVlNGVkZTFmLTFjZjItNGFhYS05ODI2LWY5ZTc0Y2NlNDQ0ZSIsImlhdCI6MTczNjUzOTk4MywiZXhwIjoxNzM2NTU0MzgzfQ.ueSNDSd_1ATG3kgwsIkLez33iopJQcywvdIP__UzWcg`,
            'x-api-key': 'ee4ede1f-1cf2-4aaa-9826-f9e74cce444e',
            'Content-Type': 'application/json',
        },
    });
}


export const checkPaymentStatus = async (paymentId) => {
    try {
        const response = await axios.post(`${CORS_PROXY}${CHECK_PAYMENT_URL}/${paymentId}/check`, {}, {
            headers: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IndpbmF0YXRyaXN0YW4wNEBnbWFpbC5jb20iLCJhdXRoIjoiZ29vZ2xlIiwiaXNBY3RpdmUiOnRydWUsImFwaUtleSI6ImVlNGVkZTFmLTFjZjItNGFhYS05ODI2LWY5ZTc0Y2NlNDQ0ZSIsImlhdCI6MTczNjUzOTk4MywiZXhwIjoxNzM2NTU0MzgzfQ.ueSNDSd_1ATG3kgwsIkLez33iopJQcywvdIP__UzWcg`,
                'x-api-key': 'ee4ede1f-1cf2-4aaa-9826-f9e74cce444e',
                'Content-Type': 'application/json',
            },
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error checking payment status:', error);
        throw new Error('Failed to verify payment status.');
    }
};


