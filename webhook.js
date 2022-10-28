import axios from 'axios';
import paypal from "./internal.js";

import { ENV } from "./env.js";

const baseURL = ENV.BASE_URL;

const getWebhookList = async function () {
  const accessToken = await paypal.generateAccessToken();
  const url = `${baseURL}/v1/notifications/webhooks`;
  const response = await axios({
    method: 'get',
    url: url, 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }
  });
  return paypal.handleResponse(response);  
}

const createWebhook = async function (ngrokURL) {
  const accessToken = await paypal.generateAccessToken();
  const url = `${baseURL}/v1/notifications/webhooks`;
  const endPoint = `${ngrokURL}/api/invoices/paid`;    
  const response = await axios({
    method: 'post',
    url: url, 
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
    },    
    data: JSON.stringify({
        "url": endPoint,
        "event_types": [
          {
            "name": "INVOICING.INVOICE.PAID"
          },
        ]
      }),      
  });
  return paypal.handleResponse(response);    
}

const updateWebhook = async function (ngrokURL, webhookId) {
  const accessToken = await paypal.generateAccessToken();
  const url = `${baseURL}/v1/notifications/webhooks/${webhookId}`;
  const endPoint = `${ngrokURL}/api/invoices/paid`;   
  const response = await axios({
    method: 'patch',
    url: url, 
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
    },    
    data: JSON.stringify([
      {
        "op": "replace",
        "path": "/url",
        "value": endPoint
      },
      {
        "op": "replace",
        "path": "/event_types",
        "value": [
          {
            "name": "INVOICING.INVOICE.PAID"
          }]
      }
    ]),      
  });
  return paypal.handleResponse(response);    
}

export const handleWebhook = async function (ngrokURL) {
  const responseData = await getWebhookList();
  if (responseData.webhooks.length === 0) {
    return createWebhook(ngrokURL);
  }
  else {
    return updateWebhook(ngrokURL,responseData.webhooks[0].id);
  }
}

export default { handleWebhook };