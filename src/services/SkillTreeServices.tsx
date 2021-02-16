import { db, functions } from '../firebase/firebase';
import { toast } from 'react-toastify';
import ISkilltree from '../models/skilltree.model';
import { v4 as uuid } from "uuid";
import { standardRootSkill } from "./StandardData";
import {updateCompositionTimestamp} from './CompositionServices';
import firebase from 'firebase/app';

export const getNumberOfRootSkills = (skilltree: ISkilltree) => {
    return db
    .collection('compositions').doc(skilltree.composition)
    .collection('skilltrees').doc(skilltree.id)
    .collection('skills').get()
    .then(skills => {
        if(skills.empty){
            return 0;
        }
        return skills.docs.length;
    })
    .catch(err => {
        return 0;
    })
}

export const getNumberSkills = (skilltree: ISkilltree) => {
    return db
    .collectionGroup('skills')
    .where('skilltree', '==', skilltree.id)
    .get()
    .then(skills => {
        if(skills.empty){
            return 0;
        }
        return skills.docs.length;
    })
    .catch(err => {
        return 0;
    })
}

export const updateSkilltree = (skilltree: ISkilltree, 
    compositionId: string, 
    isEditingSkilltree: boolean, 
    rootSkillTitle: string) : Promise<any> => {
    let rootSkill = {...standardRootSkill};
    if(rootSkillTitle){
        rootSkill.title = rootSkillTitle
    };
    if (!isEditingSkilltree) {
        skilltree.composition = compositionId;
    }
    return db.collection('compositions')
        .doc(compositionId)
        .collection('skilltrees')
        .doc(skilltree.id).set(skilltree, { merge: true })
        .then(_ => {
            if (!isEditingSkilltree) {
                const newRootSkill = {
                    skilltree: skilltree.id,
                    composition: compositionId,
                    id: uuid(),
                    ...rootSkill
                };
                db.collection('compositions').doc(compositionId)
                    .collection('skilltrees').doc(skilltree.id)
                    .collection('skills').doc(newRootSkill.id).set(newRootSkill)
                    .then(_ => {
                        toast.info("Skilltree successfully created");
                    });
                db.collection('compositions').doc(compositionId).update({
                    skillcount: firebase.firestore.FieldValue.increment(1),
                    lastUpdate: firebase.firestore.Timestamp.now()
                });
            } else {
                toast.info("Skilltree successfully updated");
                updateCompositionTimestamp(compositionId)
            }
        })
        .catch(error => {
            toast.error('Something went wrong...' + error.message);
        })
}

export const deleteSkilltree = (compositionId: string, skilltree: ISkilltree, numberOfSkillsInSkilltree: number) => {
    const skilltreePath = `compositions/${compositionId}/skilltrees/${skilltree?.id}`;
    const deleteFirestorePathRecursively = functions.httpsCallable('deleteFirestorePathRecursively');
    return deleteFirestorePathRecursively({
        collection: 'Skilltree',
        path: skilltreePath
    }).then(function (result) {
        if (result.data.error) {
            toast.error(result.data.error);
        } else {
            toast.info('Skilltree and related child skills deleted successfully');
        }
        db.collection('compositions').doc(compositionId).update({
            skillcount: firebase.firestore.FieldValue.increment(-numberOfSkillsInSkilltree),
            lastUpdate: firebase.firestore.Timestamp.now()
        });
    }).catch(function (error) {
        toast.error(error.message);
    });
}

