import Fastify from 'fastify'
const fastify = Fastify({
  logger: false
});

import paypal from "./internal.js";
import webhook from "./webhook.js";   
import ngrok from 'ngrok';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fastifyStatic from '@fastify/static';
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
});

import process from 'node:process';
process.stdin.resume();
process.on('SIGINT', () => {
  console.log('\nexiting…');
  process.exit();
});

import { ENV } from "./env.js";

fastify.get('/', function (req, reply) {
  reply.sendFile('index.html') 
});

fastify.post("/api/invoices", async (req, res) => {
  try {    
    const invoiceInfo = await paypal.createDraftInvoice(req.body.value);
    const sentInvoice = await paypal.sendInvoice(invoiceInfo.id);    
    res.send(sentInvoice);
    
    // const paymentLink = sentInvoice.href;
    // const canceledInvoice = await paypal.cancelSentInvoice(invoiceInfo.id);
  }
  catch (err) {
    res.status(500).send(err.message);
  }
});
  
fastify.post("/api/invoices/paid", async (req, res) => {
  try {
    const invoiceId = req.body.resource.id;
    console.log(`-> Invoice ${invoiceId} has been paid.`);
    // Continue with payment process...
  }
  catch (err) {
    res.status(500).send(err.message);
  }
});

const handleWebhook = async (url) => {
  try {
    const ngrokURL = await ngrok.connect({
      addr: ENV.PORT, 
      authtoken: ENV.NGROK_AUTH_TOKEN
    });
    const handledWebhook = await webhook.handleWebhook(ngrokURL);  
    console.log(`Go to ${ngrokURL} to create an invoice.\n`)
  }
  catch (err) {
    res.status(500).send(err.message);
  }
};

fastify.listen({ port: ENV.PORT }, (err, address) => {
  if (err) throw err
  handleWebhook();
});
