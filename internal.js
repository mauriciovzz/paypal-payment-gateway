import axios from 'axios';

import { ENV } from "./env.js";

const merchantId = ENV.PAYPAL_MERCHANT_ID;
const apiSecret = ENV.PAYPAL_SECRET_KEY;
const baseURL = ENV.BASE_URL;

const calculateFinalAmount = (amount) => {
  const paypalFeeRate = 5.4;
  const paypalFixedFee = 0.3;  
  return (Math.round(((amount + paypalFixedFee)/(1 - (paypalFeeRate / 100))) * 100 ) / 100).toString();
}

const formatDate = date => date.toISOString().slice(0, 10);

const createDraftInvoice = async function (amount) {
  const accessToken = await generateAccessToken();
  const invoiceNumber = await generateInvoiceNumber();
  const invoiceDate = formatDate(new Date());
  const finalAmount = calculateFinalAmount(parseFloat(amount));
  const url = `${baseURL}/v2/invoicing/invoices`;
  const response = await axios({
    method: 'post',
    url: url, 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      Prefer: "return=representation",
    },
    data: JSON.stringify({
      detail: {
          invoice_number: invoiceNumber.invoice_number,
          invoice_date: invoiceDate,
          payment_term: {
              term_type: "DUE_ON_RECEIPT",
              due_date: invoiceDate
          },
          currency_code: "USD",
          reference: "<The reference data. Includes a post office (PO) number.>",
          note: "<A note to the invoice recipient. Also appears on the invoice notification email.>",
          terms_and_conditions: "<The general terms of the invoice. Can include return or cancellation policy and other terms and conditions.>",
          memo: "<A private bookkeeping note for merchant.>"
      },
      invoicer: {
          name: {
              given_name: "Ibis Payments LLC"
          },
          address: {
              address_line_1: "<123 Townsend St>",
              address_line_2: "<Floor 6>",
              admin_area_2: "<San Francisco>",
              admin_area_1: "<CA>",
              postal_code: "<94107>",
              country_code: "US"
          },
          phones: [
              {
                  country_code: "058",
                  national_number: "4167871710",
                  phone_type: "MOBILE"
              }
          ],
          website: "https://usaibis.com/",
          logo_url: "https://usaibis.com/build/q-b260e052.png",
          additional_notes: "<Any additional information. Includes business hours.>"
      },
      items: [
          {
              name: "Cambio",
              description: "Cambio de Paypal a Bolivares.",
              quantity: 1,
              unit_amount: {
                  currency_code: "USD",
                  value: finalAmount
              },
              unit_of_measure: "QUANTITY"
          }
      ],
      configuration: {
          partial_payment: {
              allow_partial_payment: false
          },
          allow_tip: false,
          tax_calculated_after_discount: false,
          tax_inclusive: false
      }
    }),
  });
  return handleResponse(response);
}

const sendInvoice = async function (invoiceId) {
  const accessToken = await generateAccessToken();
  const url = `${baseURL}/v2/invoicing/invoices/${invoiceId}/send`;
  const response = await axios({
    method: 'post',
    url: url, 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      Prefer: "return=representation",
    },
    data: JSON.stringify({
      send_to_recipient: false,
      send_to_invoicer: false
    })
  });
  return handleResponse(response);
}

const cancelSentInvoice = async function (invoiceId) {
  const accessToken = await generateAccessToken();
  const url = `${baseURL}/v2/invoicing/invoices/${invoiceId}/cancel`;
  const response = await axios({
    method: 'post',
    url: url, 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: JSON.stringify({
      send_to_recipient: false,
      send_to_invoicer: false
    })
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

const generateInvoiceNumber = async function () {
  const accessToken = await generateAccessToken();
  const url = `${baseURL}/v2/invoicing/generate-next-invoice-number`;
  const response = await axios({
    method: 'post',
    url: url, 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }
  });
  return handleResponse(response);
}

const handleResponse = async function (response) {
  if (response.status === 200 || response.status === 201 || response.status === 204) {
    return response.data;
  }
  const errorMessage = response.statusText;
  throw new Error(errorMessage);
}

export default { createDraftInvoice, sendInvoice, cancelSentInvoice, generateAccessToken, handleResponse };



