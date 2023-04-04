/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51Mt1siSJGoZ9kNnzI73cZj6NdgIeE7EAJCGlHRDS26VTzn4H4rmaSayn1vBFl5NkrcjiiJa7UTF7FdvvYwk74PI500drmYPWGl');

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log({session});

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log({err});
    showAlert('error', err);
  }
};
