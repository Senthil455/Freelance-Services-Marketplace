import Stripe from 'stripe';
import Order from '../models/Order.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import { config } from '../config/index.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { notify } from './authController.js';

let stripe = null;
if (config.stripeSecretKey) {
  stripe = new Stripe(config.stripeSecretKey);
}

export const isStripeEnabled = () => !!stripe;

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.buyer.toString() !== req.user._id.toString()) throw new AppError('Not your order', 403);
  if (order.status !== 'pending') throw new AppError('This order is not pending payment', 400);

  if (!stripe) {
    order.status = 'in_progress';
    order.paymentMethod = 'sandbox';
    order.deadline = new Date(Date.now() + order.deliveryDays * 24 * 60 * 60 * 1000);
    await order.save();
    await notify(order.seller, 'Order started', 'Payment received (sandbox) for ' + order.gigTitle, '/dashboard/orders/' + order._id, 'payment');
    return res.json({ success: true, sandbox: true, order, clientSecret: null });
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100),
    currency: 'usd',
    metadata: { orderId: order.orderId },
    automatic_payment_methods: { enabled: true },
  });

  order.stripePaymentIntent = intent.id;
  order.paymentMethod = 'card';
  await order.save();

  res.json({ success: true, sandbox: false, clientSecret: intent.client_secret, order });
});
