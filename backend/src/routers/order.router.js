import { Router } from 'express';
import handler from 'express-async-handler';
import auth from '../middleware/auth.mid.js';
import { BAD_REQUEST } from '../constants/httpStatus.js';
import { OrderModel } from '../models/order.model.js';
import { OrderStatus } from '../constants/orderStatus.js';
import { UserModel } from '../models/user.model.js';

const router = Router();
router.use(auth);

router.post(
  '/create',
  handler(async (req, res) => {
    const order = req.body;

    if (order.items.length <= 0) res.status(BAD_REQUEST).send('Cart Is Empty!');

    await OrderModel.deleteOne({
      user: req.user.id,
      status: OrderStatus.NEW,
    });

    const newOrder = new OrderModel({ ...order, user: req.user.id });
    await newOrder.save();
    res.send(newOrder);
  })
);

router.put(
  '/pay',
  handler(async (req, res) => {
    const { paymentId } = req.body;
    const order = await getNewOrderForCurrentUser(req);
    if (!order) {
      res.status(BAD_REQUEST).send('Order Not Found!');
      return;
    }

    order.paymentId = paymentId;
    order.status = OrderStatus.PAYED;
    await order.save();

    res.send(order._id);
  })
);

// router.get(
//   '/track/:orderId',
//   handler(async (req, res) => {
//     const { orderId } = req.params;
//     const user = await UserModel.findById(req.user.id);
//
//     const filter = {
//       _id: orderId,
//     };
//
//     if (!user.isAdmin) {
//       filter.user = user._id;
//     }
//
//     const order = await OrderModel.findOne(filter);
//
//     if (!order) return res.send(UNAUTHORIZED);
//
//     return res.send(order);
//   })
// );

router.get(
    '/track/:orderId',
    handler(async (req, res) => {
        const { orderId } = req.params;

        // First validate if orderId is valid MongoDB id
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).send({ error: 'Order not found' });
        }

        const user = await UserModel.findById(req.user.id);

        const filter = {
            _id: orderId,
        };

        // Only add user filter if not admin
        if (!user.isAdmin) {
            filter.user = user._id;
        }

        const order = await OrderModel.findOne(filter);

        // Simply return 404 if order doesn't exist
        if (!order) {
            return res.status(404).send({ error: 'Order not found' });
        }

        return res.send(order);
    })
);

router.get(
    '/newOrderForCurrentUser',
    handler(async (req, res) => {
        try {
            let order = await getNewOrderForCurrentUser(req);

            if (!order) {
                await new Promise(resolve => setTimeout(resolve, 5));
                order = await getNewOrderForCurrentUser(req);
            }

            if (!order) {
                return res.status(BAD_REQUEST).send();
            }

            return res.send(order);
        } catch (error) {
            console.error('Error fetching order:', error);
            return res.status(500).send('Internal Server Error');
        }
    })
);

const getNewOrderForCurrentUser = async req =>
  await OrderModel.findOne({ user: req.user.id, status: OrderStatus.NEW });
export default router;
