import { db } from '../../../firebase/firebase';
import IComposition from '../../../models/composition.model';

export const getComposition = async (compositionId: string) => {
    const compositionSnap = await db.collection("compositions").doc(compositionId).get();
    if(!compositionSnap.exists) {
        return null
    };
    return compositionSnap.data() as IComposition;
}