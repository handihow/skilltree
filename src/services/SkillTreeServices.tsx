import { db, functions } from '../firebase/firebase';
import { toast } from 'react-toastify';
import ISkilltree from '../models/skilltree.model';
import { v4 as uuid } from "uuid";
import { standardRootSkill } from "./StandardData";
import {updateCompositionTimestamp} from './CompositionServices';

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
    console.log(skilltree);
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
            } else {
                toast.info("Skilltree successfully updated");
            }
            updateCompositionTimestamp(compositionId)
        })
        .catch(error => {
            toast.error('Something went wrong...' + error.message);
        })
}

export const deleteSkilltree = (compositionId: string, skilltree: ISkilltree) => {
    const toastId = uuid();
    toast.info('Deleting skilltree all related child skills is in progress... please wait', {
        toastId: toastId
    })
    const skilltreePath = `compositions/${compositionId}/skilltrees/${skilltree?.id}`;
    const deleteFirestorePathRecursively = functions.httpsCallable('deleteFirestorePathRecursively');
    return deleteFirestorePathRecursively({
        collection: 'Skilltree',
        path: skilltreePath
    }).then(function (result) {
        updateCompositionTimestamp(compositionId)
        if (result.data.error) {
            toast.update(toastId, {
                render: result.data.error,
            });
        } else {
            toast.update(toastId, {
                render: 'Skilltree and related child skills deleted successfully'
            });
        }
    }).catch(function (error) {
        toast.update(toastId, {
            render: error.message,
            type: toast.TYPE.ERROR
        });
    });
}

