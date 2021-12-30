import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const client = require('firebase-tools');
admin.initializeApp(functions.config().firebase);

const stripe = require("stripe")("sk_live_uXZpRqj2QizXeAsNIoqiHOrq00WJpeRCwL");
const db = admin.firestore();

exports.events = functions.https.onRequest((request:any, response:any) => {
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
      console.log(intent);
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

  exports.deleteFirestorePathRecursively = functions.https.onCall((data, context) => {

    const collection : string = data.collection;

    if(!context.auth || !context.auth.uid ){
        return {
            error: `Request denied. You are not authorized to delete this ${collection.toLowerCase()}.`
        }
    }
    
    const path : string = data.path;

    return client.firestore
          .delete(path, {
            project: process.env.GCLOUD_PROJECT,
            recursive: true,
            yes: true
          })
          .then(() => {
            return {
              result: `${collection} deleted successfully` 
            };
          })
          .catch((error: any) => {
              return {
                  error: `Problem deleting ${collection.toLowerCase()}: ${error} ` 
              }
          });
  });

  exports.onCreateUser = functions.auth.user().onCreate((user) => {
    return db.collection('users').doc(user.uid).set({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL ? user.photoURL : `https://eu.ui-avatars.com/api/?name=${user.displayName}`,
      provider: user?.providerData[0]?.providerId || null,
      creationTime: user?.metadata?.creationTime || null
    }, {merge: true});
  })

  exports.editUser = functions.https.onCall((data, context) => {
    if(!context.auth || !context.auth.uid ){
        return {
            error: 'Request denied. You are not logged in.'
        }
    }
    const uid = context.auth.uid;
    const email : string = data.email;
    const displayName : string = data.displayName;
    const password : string = data.password;

    return admin.auth().updateUser(uid, {
      email: email,
      password: password,
      displayName: displayName,
    })
      .then( _ => {
        return db.collection('users').doc(uid).set({
          email: email,
          displayName: displayName
        }, {merge: true})
        .then( __ => {
          return {
            result: `User record for ${displayName} was updated successfully` 
          };
        })
        .catch( err => {
          return {
            error: 'Something went wrong ... ' + err.message
          }
        })
      })
      .catch(error => {
        return {
          error: 'Something went wrong ... ' + error.message
        }
      });
  })

  exports.deleteUser = functions.https.onCall((data, context) => {
    if(!context.auth || !context.auth.uid ){
        return {
            error: 'Request denied. You are not logged in.'
        }
    }
    const uid = context.auth.uid;

    return admin.auth().deleteUser(uid)
      .then( _ => {
        return {
          result: 'Account was deleted' 
        };
      })
      .catch( err => {
        return {
          error: 'Something went wrong ... ' + err.message
        }
      })
  })

  exports.addStudentList = functions.https.onCall(async (data,context) => {
    if(!context.auth || !context.auth.uid ){
        return {
            error: 'Request denied. You are not logged in.'
        }
    }
    const emailAddresses : string[] = data.emailAddresses || [];
    const displayNames : string[] = data.displayNames || [];
    const passwords : string[] = data.passwords || [];
    const compositionId : string = data.compositionId || '';
    if(emailAddresses.length !== displayNames.length){
      return {
          error: 'Number of email addresses does not match the number of full names'
      }
    }

    const errorMessages : string[] = [];
    for (let index = 0; index < emailAddresses.length; index++) {
      const email = emailAddresses[index];
      let user: admin.auth.UserRecord;
      try{
        user = await admin.auth().getUserByEmail(email);
        await addCompositionToResults(user, compositionId);
        await addUserToCompositionSharedUsers(user, compositionId);
      } catch(err){
        try{
          //user record needs to be created
          user = await admin.auth().createUser({
            email: email,
            displayName: displayNames[index],
            password: passwords[index]
          });
          await addCompositionToResults(user, compositionId);
          await addUserToCompositionSharedUsers(user, compositionId);
        } catch(err){
          errorMessages.push("Error creating user with email address " + email + ".");
        }
      }
    }

    return {
        result: errorMessages.length === 0 ? 'Student list added successfully' :
          'Student list added with errors: ' + errorMessages.join(', ')
    }

  })

  const addCompositionToResults = (user: admin.auth.UserRecord, compositionId: string) => {
    return db.collection('results').doc(user.uid).set({
      user: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL ? user.photoURL : '',
      compositions: admin.firestore.FieldValue.arrayUnion(compositionId),
      progress: {
            [compositionId]: 0 
        }
    }, {merge: true});
  }

  const addUserToCompositionSharedUsers = (user: admin.auth.UserRecord, compositionId: string) => {
    return db.collection('compositions').doc(compositionId).update({
      sharedUsers: admin.firestore.FieldValue.arrayUnion(user.uid)
    })
  }

  
  