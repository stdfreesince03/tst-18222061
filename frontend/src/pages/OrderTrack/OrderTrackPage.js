import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { trackOrderById } from '../../services/orderService';
import NotFound from '../../components/NotFound/NotFound';
import classes from './orderTrackPage.module.css';
import DateTime from '../../components/DateTime/DateTime';
import OrderItemsList from '../../components/OrderItemsList/OrderItemsList';
import Title from '../../components/Title/Title';
import Map from '../../components/Map/Map';

export default function OrderTrackPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) {
      setError('Order ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await trackOrderById(orderId);
      setOrder(data);
      setError('');
    } catch (error) {
      setOrder(null);
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (error || !order) {
    return <NotFound message={error || "Order Not Found"} linkRoute={"/"} linkText="Go To Home Page" />;
  }

  return (
      <div className={classes.container}>
        <div className={classes.content}>
          <h1>Order #{order.id}</h1>
          <div className={classes.header}>
            <div>
              <strong>Date</strong>
              <DateTime date={order.createdAt} />
            </div>
            <div>
              <strong>Name</strong>
              {order.name}
            </div>
            <div>
              <strong>Address</strong>
              {order.address}
            </div>
            <div>
              <strong>State</strong>
              {order.status}
            </div>
            {order.paymentId && (
                <div>
                  <strong>Payment ID</strong>
                  {order.paymentId}
                </div>
            )}
          </div>

          <OrderItemsList order={order} />
        </div>

        <div>
          <Title title="Delivery Status" fontSize="1.6rem" />
          <Map location={order.addressLatLng} readonly={true} />
        </div>

        {order.status === 'PENDING' && (
            <div className={classes.payment}>
              <p className={classes.pendingMessage}>
                This order is still <strong>pending</strong>. You need to complete the payment to proceed.
                Failure to complete payment within the given time may result in order cancellation.
              </p>
              <Link to={`/payment/${orderId}`} className={classes.paymentLink}>
                Go To Payment
              </Link>
            </div>
        )}
      </div>
  );
}