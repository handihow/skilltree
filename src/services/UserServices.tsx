import { db } from '../firebase/firebase';
import IUser from '../models/user.model';

export const getRelevantUserIds = async (user: IUser) => {
    const userIds: string[] = []
    if(user.hostedDomain){
        const hostedUserSnap = await db.collection('users').where('hostedDomain', '==', user.hostedDomain).get();
        if(!hostedUserSnap.empty){
            hostedUserSnap.docs.forEach(doc => userIds.push(doc.id));
        }
        const userIndex = userIds.findIndex(hdu => hdu === user.uid);
        if(userIndex === -1) {
            userIds.push(user.uid);
        }
    } else {
        userIds.push(user.uid)
    }
    return userIds;
}
