import { db } from '../firebase/firebase';
import IUser from '../models/user.model';

export const getRelevantUserIds = async (user: IUser) => {
    const userIds: string[] = [user.uid]
    if(user.hostedDomain){
        const hostedUserSnap = await db.collection('users')
                                        .where('hostedDomain', '==', user.hostedDomain)
                                        .limit(9)
                                        .get();
        if(!hostedUserSnap.empty){
            hostedUserSnap.docs.forEach(doc => {
                if(user.uid !== doc.id){
                    userIds.push(doc.id)
                }
            });
        }
    }
    return userIds;
}
