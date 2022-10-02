import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
});

import paypal from "./internal.js";
import webhooks from "./webhook.js";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fastifyStatic from '@fastify/static';
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
});

import { ENV } from "./env.js";

fastify.get('/index.html', function (req, reply) {
  reply.sendFile('index.html') 
});

fastify.get('/success.html', function (req, reply) {
  reply.sendFile('success.html') 
});

fastify.post("/api/orders", async (req, res) => {
  try {    
    const order = await paypal.createOrder(req.body.value);
    console.log(order);
    res.send(order);
  }
  catch (err) {
    res.status(500).send(err.message);
  }
});
  
fastify.post("/api/orders/capture", async (req, res) => {
  try {
    const captureData = await paypal.capturePayment(req.body.resource.id);
    console.log(captureData);
  }
  catch (err) {
    res.status(500).send(err.message);
  }
});

const handleWebhook = async () => {
  try {
    const captureData = await webhooks.handleWebhook();
    console.log(captureData);
  }
  catch (err) {
    res.status(500).send(err.message);
  }
};

// Start server
fastify.listen({ port: ENV.PORT }, (err, address) => {
  if (err) throw err
  handleWebhook();
})

