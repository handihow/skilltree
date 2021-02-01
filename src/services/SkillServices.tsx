import { db, functions } from '../firebase/firebase';
import { toast } from 'react-toastify';
import ISkill from '../models/skill.model';
import ISkilltree from '../models/skilltree.model';
import { v4 as uuid } from "uuid";
// import { standardRootSkill } from "./StandardData";
// import {updateCompositionTimestamp} from './CompositionServices';
import firebase from 'firebase/app';

export const updateSkill = (updatedSkill: ISkill, parentSkilltree: ISkilltree, parentSkill?: ISkill, 
                             isAddingRootSkill?: boolean, isEditing?: boolean) => {
    let path = '';
    if(isEditing && updatedSkill.path){
        path = updatedSkill.path;
    } else if(!isEditing 
                && !isAddingRootSkill) {
        path = `${parentSkill?.path}/skills/${updatedSkill.id}`
    } else if(!isEditing 
                && isAddingRootSkill) {
        path = `${parentSkilltree?.path}/skills/${updatedSkill.id}`
    }
    let skill : ISkill = {
        id: updatedSkill.id,
        title: updatedSkill.title,
        description: updatedSkill.description,
        direction: updatedSkill.direction,
        links: updatedSkill.links,
        optional: updatedSkill.optional,
        countChildren: updatedSkill.countChildren,
        order: updatedSkill.order
    }
    if(!isEditing){
        skill.composition = parentSkilltree?.composition;
        skill.skilltree = parentSkilltree?.id;
        skill.order = isAddingRootSkill ? parentSkilltree?.countChildren : parentSkill?.countChildren;
    }
    if(path.length === 0) return;
    return db.doc(path).set(skill, {merge: true})
    .then( _ => {
        if(!isEditing && parentSkill?.path) {
            db.doc(parentSkill.path).update({
                countChildren: parentSkill?.countChildren + 1
            });
        } else if(!isEditing){
            db.collection('compositions').doc(skill.composition).update({
                // skillcount: this.state.skills.length,
                skillcount: firebase.firestore.FieldValue.increment(1),
                lastUpdate: firebase.firestore.Timestamp.now()
            });
        }
        toast.info(`${skill.title} updated successfully`);
    })
    .catch(err => {
        toast.error(err.message);
    });
    
}

export const deleteSkill = (skill: ISkill) => {
    const toastId = uuid();
    toast.info('Deleting skill all related child skills is in progress... please wait', {
      toastId: toastId
    })
    const skillPath = skill.path;
    const deleteFirestorePathRecursively = functions.httpsCallable('deleteFirestorePathRecursively');
    return deleteFirestorePathRecursively({
        collection: 'Skill',
        path: skillPath
    })
    .then(result => {
        if(result.data.error){
            toast.update(toastId, {
                render: result.data.error,
            });
        } else {
            db.collection('compositions').doc(skill.composition).update({
                // skillcount: this.state.skills.length,
                skillcount: firebase.firestore.FieldValue.increment(-1),
                lastUpdate: firebase.firestore.Timestamp.now()
            });
            toast.update(toastId, {
                render: 'Skill and related child skills deleted successfully'
            });
        }
    })
    .catch(error => {
        toast.update(toastId, {
            render: error.message,
            type: toast.TYPE.ERROR
        });
    });
}
