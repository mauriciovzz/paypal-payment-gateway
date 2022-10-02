import * as dotenv from 'dotenv'
dotenv.config()

export const ENV = {
  PORT: process.env.PORT,
  PAYPAL_MERCHANT_ID: process.env.PAYPAL_MERCHANT_ID,
  PAYPAL_SECRET_KEY: process.env.PAYPAL_SECRET_KEY,
  HOST_URL: process.env.HOST_URL,
  WEBHOOK_ID: process.env.WEBHOOK_ID,
};

