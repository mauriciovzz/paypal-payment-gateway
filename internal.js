import axios from 'axios';

import { ENV } from "./env.js";

const merchantId = ENV.PAYPAL_MERCHANT_ID;
const apiSecret = ENV.PAYPAL_SECRET_KEY;
const returnBase = ENV.HOST_URL;
const baseURL = "https://api-m.sandbox.paypal.com";

const calculateAmount = (amount) => {
  const paypalFeeRate = 5.4;
  const paypalFixedFee = 0.3;  
  return (Math.round(((amount + paypalFixedFee)/(1 - (paypalFeeRate / 100))) * 100 ) / 100).toString();
}

const createOrder = async function (amount) {
  const accessToken = await generateAccessToken();
  const url = `${baseURL}/v2/checkout/orders`;
  const returnUrl = `${returnBase}/public/success.html`; ;
  const response = await axios({
    method: 'post',
    url: url, 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: calculateAmount(parseFloat(amount)),
          },
        },
      ],
      application_context: {
        return_url: returnUrl
      }
    }),
  });
  return handleResponse(response);
}

const capturePayment = async function (orderId) {
  const accessToken = await generateAccessToken();
  const url = `${baseURL}/v2/checkout/orders/${orderId}/capture`;
  const response = await axios({
    method: 'post',
    url: url, 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return handleResponse(response);
}

const generateAccessToken = async function () {
  const auth = Buffer.from(merchantId + ":" + apiSecret).toString("base64"); 
  const response = await axios({
    method: 'post',
    url: `${baseURL}/v1/oauth2/token`,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: 'grant_type=client_credentials',
  });
  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}

const handleResponse = async function (response) {
  if (response.status === 200 || response.status === 201) {
    return response.data;
  }
  const errorMessage = response.statusText;
  throw new Error(errorMessage);
}

export default { createOrder, capturePayment, generateAccessToken, handleResponse };



