import React, { useState, useEffect } from 'react';
import classes from './paymentPage.module.css';
import { getOrder } from '../../services/orderService';
import Title from '../../components/Title/Title';
import OrderItemsList from '../../components/OrderItemsList/OrderItemsList';
import Map from '../../components/Map/Map';
import PaypalButtons from '../../components/PaypalButtons/PaypalButtons';
import SolstraPayButton from "../../components/SolstraPayButton/SolstraPay";
import {useLocation, useNavigate, useParams} from "react-router-dom";

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const user = location.state?.user;


  useEffect(() => {
    if (!order) {
      navigate('/cart');
    }
  }, [order, navigate]);


  if (!order) {
    return null;
  }

  return (
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

        <div className={classes.buttons_container}>
          <div className={classes.buttons}>
            <SolstraPayButton order={order} user={user}></SolstraPayButton>
          </div>
        </div>
      </div>
  );
}
