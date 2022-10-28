import * as dotenv from 'dotenv'
dotenv.config()

export const ENV = {  
  PORT: process.env.PORT,
  NGROK_AUTH_TOKEN: process.env.NGROK_AUTH_TOKEN,
  PAYPAL_MERCHANT_ID: process.env.PAYPAL_MERCHANT_ID,
  PAYPAL_SECRET_KEY: process.env.PAYPAL_SECRET_KEY,
  BASE_URL: process.env.BASE_URL
};

