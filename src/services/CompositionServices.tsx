import { db } from '../firebase/firebase';
import firebase from 'firebase/app';

import IComposition from '../models/composition.model';

export const getComposition = async (compositionId: string) => {
    const compositionSnap = await db.collection("compositions").doc(compositionId).get();
    if(!compositionSnap.exists) {
        return null
    };
    return {...compositionSnap.data(), id: compositionSnap.id} as IComposition;
}

export const updateCompositionTimestamp = (compositionId) => {
    db.collection('compositions').doc(compositionId).update({
        lastUpdate: firebase.firestore.Timestamp.now()
    })
}

export const updateCompositionProperty = (compositionId: string, property: string, value: string) => {
    db.collection('compositions').doc(compositionId).update({
        [property]: value
    })
}
