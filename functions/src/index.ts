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
    if(event.type==='payment_intent.succeeded'){
      return db.collection('payments').add(event)
      .then((doc) => {
        return response.json({ received: true, ref: doc.id });
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
    const amount = data.amount;
    return stripe.paymentIntents.create({
        amount: amount,
        currency: 'eur',
        payment_method_types: ['card'],
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


