import React, { useState, useEffect } from 'react';
import classes from './paymentTrackPage.module.css';
import {getOrder, updateOrderStatus} from '../../services/orderService';
import Title from '../../components/Title/Title';
import OrderItemsList from '../../components/OrderItemsList/OrderItemsList';
import Map from '../../components/Map/Map';
import PendingPaymentBottom from "../../components/PendingPaymentBottom/PendingPaymentBottom";
import {useNavigate, useParams} from 'react-router-dom';
import { checkPaymentStatus } from "../../services/paymentService";

export default function PaymentTrackPage() {
  const [order, setOrder] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getOrder(orderId).then((data) => setOrder(data));
  }, [orderId]);

  const handleVerify = async () => {
    setVerificationLoading(true);
    setVerificationFailed(false);
    try {
      const result = await checkPaymentStatus(order.statusData.paymentID);
      if (result.data.isExpired) {
        await updateOrderStatus(orderId, false, true);
        setStatusMessage('Payment expired. Please create a new order.');
        setOrder({ ...order, status: 'FAILED' });

      } else if (result.data.isPaid) {
        await updateOrderStatus(orderId, true, false);
        setStatusMessage('Payment completed successfully!');
        setOrder({ ...order, status: 'PAID' });
      } else {
        setStatusMessage('Payment still pending. Please complete it.');
      }
    } catch (error) {
      setStatusMessage('Failed to verify payment status. Try again later.');
      setVerificationFailed(true);
    } finally {
      setVerificationLoading(false);
    }
  };

  if (!order) return null;

  return (
      <div>
        <div className={classes.container}>
          <div className={classes.content}>
            <Title title="Order Form" fontSize="1.6rem" />
            <div className={classes.summary}>
              <div>
                <h3>Name:</h3>
                <span>{order.name}</span>
              </div>
              <div>
                <h3>Address:</h3>
                <span>{order.address}</span>
              </div>
            </div>
            <OrderItemsList order={order} />
          </div>

          <div className={classes.map}>
            <Title title="Your Location" fontSize="1.6rem" />
            <Map readonly={true} location={order.addressLatLng} />
          </div>



          {/* Conditional Bottom Rendering */}
          {order.status === 'PENDING' && !verificationFailed && (
              <PendingPaymentBottom
                  status={order.status}
                  wallet={order.statusData.recipientWallet}
                  onCopy={() => setStatusMessage('Wallet address copied!')}
                  onVerify={handleVerify}
                  loading={verificationLoading}
              />
          )}

          {statusMessage && (
              <div className={classes.message}>
                <p className={classes.statusMessage}>{statusMessage}</p>
                {verificationFailed && (
                    <button onClick={handleVerify} className={classes.retryButton}>
                      Retry Verification
                    </button>
                )}
              </div>
          )}
        </div>
        {order.status === 'PENDING' && (
            <div className={classes.amountToPay}>
              <p><strong>Amount to Pay:</strong></p>
              <p className={classes.solAmount}>{order.statusData.solAmount} SOL</p>
            </div>
        )}

        {order.status === 'PAID' && (
            <div className={classes.successMessage}>
              <p>Payment completed successfully! Thank you for your order.</p>
              <button
                  onClick={() => navigate(`/orders/${orderId}`)}
                  className={classes.viewOrderButton}
              >
                View Order
              </button>
            </div>
        )}

        {order.status === 'FAILED' && (
            <div className={classes.expiredMessage}>
              <p>Payment expired. Please create a new order.</p>
            </div>
        )}
      </div>
  );
}