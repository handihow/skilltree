import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

const stripe = require("stripe")("sk_test_NBsrImMpFMEJboledtXIgBni00M9Z3A95l");
const db = admin.firestore();

exports.events = functions.https.onRequest((request, response) => {
  // Get the signature from the request header
  let event;
  try {
    event = request.body;
    if((event.type==='payment_intent.succeeded' || event.type==='payment_intent.payment_failed') && 
        event.data && event.data.object &&
        event.data.object.metadata && 
        event.data.object.metadata.compositionId && 
        event.data.object.metadata.featureId){
      const compositionId = event.data.object.metadata.compositionId;
      const featureId = event.data.object.metadata.featureId;
      return db.collection('compositions').doc(compositionId).collection('payments').doc(featureId).set({
        event,
        success: event.type==='payment_intent.succeeded' ? true : false
      })
      .then((doc) => {
        return response.json({ received: true, ref: compositionId + '_' + featureId });
      })
      .catch((err) => {
        console.error(err);
        response.status(500).end();
        return;
      });
    } else {
      return response.json({ received: true });
    }
  } catch (err) {
    console.error(err);
    response.status(400).end()
    return;
  }
});

exports.secret = functions.https.onCall((data, context) => {
    if(!context.auth){
        return {
            error: "Request denied. You need to be logged in to request Stripe payment intent."
        }
    }
    const amount = data.amount * 100; //amount is in cents
    const currency = data.currency;
    const compositionId = data.compositionId;
    const featureId = data.featureId;
    return stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        payment_method_types: ['card'],
        metadata: {
          compositionId,
          featureId
        }
    })
    .then((intent: any) => {
        return {
            result: intent.client_secret
        }
    })
    .catch((error: any) => {
        return {
            error: "Problem requesting Stripe payment intent " + error
        }
    });
  });


