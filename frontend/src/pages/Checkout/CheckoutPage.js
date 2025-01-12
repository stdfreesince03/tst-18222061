import React from 'react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createOrder } from '../../services/orderService';
import classes from './checkoutPage.module.css';
import Title from '../../components/Title/Title';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import OrderItemsList from '../../components/OrderItemsList/OrderItemsList';
import Map from '../../components/Map/Map';

export default function CheckoutPage() {
    const { cart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState({ ...cart });

    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm();

    const submit = async data => {
        if (!order.addressLatLng) {
            toast.warning('Please select your location on the map');
            return;
        }

        // const orderData = await createOrder({ ...order, name: data.name, address: data.address });
        navigate('/payment',{state:{user,order:{...order,name:user.name,address:user.address}}});
    }

    return (
        <div className={classes.container}>
            {/* Form Section */}
            <div className={classes.formSection}>
                <form onSubmit={handleSubmit(submit)}>
                    <Title title="Order Form" fontSize="1.6rem" />
                    <div className={classes.inputs}>
                        <Input
                            defaultValue={user.name}
                            label="Name"
                            {...register('name')}
                            error={errors.name}
                        />
                        <Input
                            defaultValue={user.address}
                            label="Address"
                            {...register('address')}
                            error={errors.address}
                        />
                    </div>
                </form>
            </div>

            {/* Map and Order Section */}
            <div className={classes.mapOrderSection}>
                {/* Order List */}
                <div className={classes.orderList}>
                    <Title title="Your Order" fontSize="1.6rem" />
                    <OrderItemsList order={order} />
                </div>

                {/* Map */}
                <div className={classes.mapSection}>
                    <Title title="Choose Your Location" fontSize="1.6rem" />
                    <div className={classes.mapContainer}>
                        <Map
                            location={order.addressLatLng}
                            onChange={latlng => {
                                console.log(latlng);
                                setOrder({ ...order, addressLatLng: latlng });
                            }}
                        />
                    </div>
                </div>

                {/* Button */}
                <div className={classes.buttonContainer}>
                    <Button
                        type="submit"
                        text="Go To Payment"
                        width="100%"
                        height="3rem"
                        onClick={handleSubmit(submit)}
                    />
                </div>
            </div>
        </div>
    );
}
