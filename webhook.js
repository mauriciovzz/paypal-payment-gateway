import axios from 'axios';
import paypal from "./internal.js";

import { ENV } from "./env.js";

const webhookId = ENV.WEBHOOK_ID;
const returnBase = ENV.HOST_URL;
const baseURL = "https://api-m.sandbox.paypal.com";

const getWebhookInfo= async () => {
  const accessToken = await paypal.generateAccessToken();
  const url = `${baseURL}/v1/notifications/webhooks/${webhookId}`;
  const response = await axios({
    method: 'get',
    url: url, 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
    },         
  });
  return paypal.handleResponse(response);
}

export const updateWebhook = async function () {
  const accessToken = await paypal.generateAccessToken();
  const url = `${baseURL}/v1/notifications/webhooks/${webhookId}`;
  const newURL = `${returnBase}/api/orders/capture`;    
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
        "value": newURL
      },
      {
        "op": "replace",
        "path": "/event_types",
        "value": [
          {
            "name": "CHECKOUT.ORDER.APPROVED"
          }]
      }
    ]),      
  });
  return paypal.handleResponse(response);    
}

export const handleWebhook = async function () {
  const webhook = await getWebhookInfo();
  const newURL = `${returnBase}/api/orders/capture`;   
  if (webhook.url === newURL) {
    console.log("webhook link up to date");
    return;       
  }
  else {
    console.log("webhook link updated");
    return updateWebhook()
  }

}

export default { handleWebhook };