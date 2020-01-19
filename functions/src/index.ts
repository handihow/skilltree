import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const uuid = require('uuid');
const client = require('firebase-tools');
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

  exports.copyComposition = functions.https.onCall(async (data, context) => {

    const composition = data.composition;

    if(!context.auth || !context.auth.uid ){
        return {
            error: `Request denied. You are not authorized to copy ${composition?.title}.`
        }
    }

    const batch = db.batch();
    //first create a new composition and set it to the batch
    const newComposition = {...composition, user: context.auth.uid, id: uuid.v4(), sharedUsers: [], title: 'Copy of ' + composition.title};
    const newCompositionRef = db.collection('compositions').doc(newComposition.id);
    batch.set(newCompositionRef, newComposition);
    
    //then copy all the skilltrees
    const skilltreeSnapshot = await db.collection('compositions').doc(composition.id).collection('skilltrees').get();
    const skilltrees = skilltreeSnapshot.docs.map(snap => snap.data());
    for(let i = 0; i < skilltrees.length; i++){
      const newSkilltree = {...skilltrees[i], id: uuid.v4(), composition: newComposition.id};
      const newSkilltreeRef = db.collection('compositions').doc(newComposition.id)
                                .collection('skilltrees').doc(newSkilltree.id);
      batch.set(newSkilltreeRef, newSkilltree);
      
      //get the root skills and start copying
      const rootSkillSnapshot = await db.collection('compositions').doc(composition.id)
                                        .collection('skilltrees').doc(skilltrees[i].id)
                                        .collection('skills').get();
      const rootSkills = rootSkillSnapshot.empty ? [] : rootSkillSnapshot.docs.map(snap => snap.data());
      const rootSkillPaths = rootSkillSnapshot.empty ? [] : rootSkillSnapshot.docs.map(snap => snap.ref.path)
      for(let j = 0; j < rootSkills.length; j ++){

        const newRootSkill = {...rootSkills[j], composition: newComposition.id, skilltree: newSkilltree.id, id: uuid.v4()};
        const newRootSkillRef = db.collection('compositions').doc(newComposition.id)
                                  .collection('skilltrees').doc(newSkilltree.id)
                                  .collection('skills').doc(newRootSkill.id);
        batch.set(newRootSkillRef, newRootSkill);
        await copyChildSkills(rootSkills[j], rootSkillPaths[j], batch, newComposition.id, newSkilltree.id, newRootSkillRef);
      }
    }
    return batch.commit()
    .then(() => {
      return {
        result: `Successfully copied skilltree '${composition.title}'` 
      };
    })
    .catch((error: any) => {
        return {
            error: `Problem copying: ${error} ` 
        }
    });
  });

  const copyChildSkills = async (skill: any, path: string, batch: FirebaseFirestore.WriteBatch, newCompositionId: string, newSkilltreeId: string, newSkillRef: any) => {
    const childSkillSnapshot = await db.doc(path).collection('skills').get();
    if(childSkillSnapshot.empty){
      return;
    } else {
      const childSkills = childSkillSnapshot.docs.map(snap => snap.data());
      const childSkillPaths = childSkillSnapshot.docs.map(snap => snap.ref);
      for (let index = 0; index < childSkills.length; index++) {
        const newChildSkill = {...childSkills[index], composition: newCompositionId, skilltree: newSkilltreeId, id: uuid.v4()};
        const newChildSkillRef = newSkillRef.collection('skills').doc(newChildSkill.id);
        batch.set(newChildSkillRef, newChildSkill);
        await copyChildSkills(childSkills[index], childSkillPaths[index].path, batch, newCompositionId, newSkilltreeId, newChildSkillRef);
      }
    }
  }