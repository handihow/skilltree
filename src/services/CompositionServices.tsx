import { db } from '../firebase/firebase';
import IComposition from '../models/composition.model';
import firebase from 'firebase/app';

export const getComposition = async (compositionId: string) => {
    const compositionSnap = await db.collection("compositions").doc(compositionId).get();
    if(!compositionSnap.exists) {
        return null
    };
    return compositionSnap.data() as IComposition;
}

export const updateCompositionTimestamp = (compositionId) => {
    db.collection('compositions').doc(compositionId).update({
        lastUpdate: firebase.firestore.Timestamp.now()
    })
}

export const updateCompositionTitle = (compositionId: string, title: string) => {
    db.collection('compositions').doc(compositionId).update({
        title: title
    })
}
