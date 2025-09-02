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
    // Sandbox mode: mark paid immediately without a real payment
    order.status = 'in_progress';
    order.paymentMethod = 'sandbox';
    order.deadline = new Date(Date.now() + order.deliveryDays * 24 * 60 * 60 * 1000);
    await order.save();
    await notify(order.seller, 'Order started', `Payment received (sandbox) for ${order.gigTitle}`, `/dashboard/orders/${order._id}`, 'payment');
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

export const stripeWebhook = asyncHandler(async (req, res) => {
  if (!stripe || !config.stripeWebhookSecret) {
    return res.status(400).json({ error: 'Stripe webhook not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const order = await Order.findOne({ stripePaymentIntent: intent.id });
    if (order && order.status === 'pending') {
      order.status = 'in_progress';
      order.deadline = new Date(Date.now() + order.deliveryDays * 24 * 60 * 60 * 1000);
      await order.save();
      await notify(order.seller, 'Order started', `Payment received for ${order.gigTitle}`, `/dashboard/orders/${order._id}`, 'payment');
    }
  }

  res.json({ received: true });
});