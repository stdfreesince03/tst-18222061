import axios from 'axios';

const BASE_API_URL = 'http://localhost:8000/api/orders';

export const createOrder = async order => {
  try {
    const  {data}  = await axios.post('/api/orders/create', order);
    return data;
  } catch (error) {
     console.log(error);
  }
};

export const getOrder = async (orderId) => {
  const { data } = await axios.get(`/api/orders/order/${orderId}`);
  return data;
};

export const pay = async paymentId => {
  try {
    const { data } = await axios.put('/api/orders/pay', { paymentId });
    return data;
  } catch (error) {}
};

export const trackOrderById = async orderId => {
  const { data } = await axios.get('/api/orders/track/' + orderId);
  return data;
};

export const getAll = async state => {
  const { data } = await axios.get(`/api/orders/${state ?? ''}`);
  return data;
};

export const getAllStatus = async () => {
  const { data } = await axios.get(`/api/orders/allstatus`);
  return data;
};

export const updateOrderStatus = async (orderId, isPaid, isExpired) => {
  try {
    const { data } = await axios.put(`/api/orders/${orderId}/status`, {
      isPaid,
      isExpired,
    });
    console.log('updateOrderStatus', data);
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status.');
  }
};