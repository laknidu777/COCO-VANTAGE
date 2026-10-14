
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is missing from the environment configuration.',
      );
    }

    if (!secretKey.startsWith('sk_test_') &&
        !secretKey.startsWith('sk_live_')) {
      throw new Error('STRIPE_SECRET_KEY has an invalid format.');
    }

    this.stripe = new Stripe(secretKey);
  }

  getClient(): Stripe {
    return this.stripe;
  }
}
