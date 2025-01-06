import axios from 'axios';

export const createOrder = async order => {
  try {
    const { data } = axios.post('/api/orders/create', order);
    return data;
  } catch (error) {}
};

export const getNewOrderForCurrentUser = async () => {
  const { data } = await axios.get('/api/orders/newOrderForCurrentUser');
  return data;
};

export const pay = async paymentId => {
  try {
    const { data } = await axios.put('/api/orders/pay', { paymentId });
    return data;
  } catch (error) {}
};

// export const trackOrderById = async orderId => {
//   const { data } = await axios.get('/api/orders/track/' + orderId);
//   return data;
// };

export const trackOrderById = async orderId => {
  try {
    const { data } = await axios.get('/api/orders/track/' + orderId);
    return data;
  } catch (error) {
    throw error;
  }
};
