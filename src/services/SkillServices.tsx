import { db, functions } from '../firebase/firebase';
import { toast } from 'react-toastify';
import ISkill from '../models/skill.model';
import ISkilltree from '../models/skilltree.model';
import { v4 as uuid } from "uuid";
// import { standardRootSkill } from "./StandardData";
// import {updateCompositionTimestamp} from './CompositionServices';
import firebase from 'firebase/app';
import { getFlatDataFromTree } from 'react-sortable-tree';

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

export const deleteSkill = (path: string, compositionId: string) => {
    if(path.length === 0 || compositionId.length === 0) {
        toast.error('Missing path or composition Id for destroy operation');
        return;
    };
    const deleteFirestorePathRecursively = functions.httpsCallable('deleteFirestorePathRecursively');
    return deleteFirestorePathRecursively({
        collection: 'Skill',
        path: path
    })
    .then(result => {
        console.log(result);
        if(result.data.error){
            toast.error(result.data.error);
        } else {
            db.collection('compositions').doc(compositionId).update({
                // skillcount: this.state.skills.length,
                skillcount: firebase.firestore.FieldValue.increment(-1),
                lastUpdate: firebase.firestore.Timestamp.now()
            });
        }
    })
    .catch(error => {
        toast.error(error.message);
    });
}

export const reorderSkills = (data: any) => {
    let batch = db.batch();
    //find the parent skill
    const flatSkills = getFlatDataFromTree({
        treeData: data.treeData,
        getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
        ignoreCollapsed: false // Makes sure you traverse every node in the tree, not just the visible ones
    });

    const parentSkill = flatSkills[data.nextTreeIndex].parentNode;
   
    //update the order of skills under the new parent
    parentSkill.children.forEach((child, index) => {
        batch.update(db.doc(child.path),{order: index});
    })
    batch.commit();
}

export const moveSkill = (data: any, skilltree: ISkilltree) => {
    //define a new ID for the skill and define the database batch
    const newSkillId = uuid();
    let batch = db.batch();
    //find the parent skill
    const flatSkills = getFlatDataFromTree({
        treeData: data.treeData,
        getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
        ignoreCollapsed: false // Makes sure you traverse every node in the tree, not just the visible ones
    });

    const parentSkill = flatSkills[data.nextTreeIndex].parentNode;
    let newSkillIndexInParent; let parentsChildren;
    if(parentSkill){
        newSkillIndexInParent = parentSkill.children.findIndex(child => child.id === data.node.id);
        parentsChildren = parentSkill.children;
    } else {
        //parent is the root
        newSkillIndexInParent = data.nextTreeIndex;
        parentsChildren = data.treeData;
    }
    //get the index of the current skill in the parent
    //update the order of skills under the new parent
    parentsChildren.forEach((child, index) => {
        if(index !== newSkillIndexInParent){
            batch.update(db.doc(child.path),{order: index});
        }
    })
    //first make new record for skill 
    let newPath = `${skilltree.path}/skills/`;
    data.nextPath.forEach((skillId, index, arr) => {
        if(index < arr.length - 1){
            newPath += `${skillId}/skills/`
        } else {
            newPath += newSkillId;
        }
    });
    console.log(newPath);
    let skill = cleanSkill(data.node, newSkillId, newSkillIndexInParent);
    skill.id = newSkillId;
    batch.set(db.doc(newPath), skill);
    //make new record for all children
    if(data.node.children && data.node.children?.length>0){
        data.node.children.forEach((child, index) => {
            copyChildSkill(child, newPath, batch, index);
        })
    }
    //then delete skill including all child skills
    let previousPath = `${skilltree.path}/skills/`;
    data.prevPath.forEach((skillId, index, arr) => {
        previousPath += skillId;
        if(index < arr.length - 1){
            previousPath += '/skills/'
        }
    });
    batch.delete(db.doc(previousPath));
    //and delete all children
    if(data.node.children && data.node.children?.length>0){
        data.node.children.forEach(child => {
            deleteChildSkill(child, previousPath, batch);
        })
    }
    batch.commit();
}

const cleanSkill = (dirtySkill: ISkill, newSkillId: string, order: number) => {
    let skill : ISkill = {
        id: newSkillId,
        title: dirtySkill.title,
        description: dirtySkill.description,
        direction: dirtySkill.direction,
        links: dirtySkill.links,
        optional: dirtySkill.optional,
        countChildren: dirtySkill.children ? dirtySkill.children.length : 0,
        order: order,
        composition: dirtySkill.composition,
        skilltree: dirtySkill.skilltree
    }
    return skill;
}

const copyChildSkill = (child: ISkill, newParentPath: string,  batch: firebase.firestore.WriteBatch, index: number) => {
    const newSkillId = uuid();
    let skill = cleanSkill(child, newSkillId, index);
    const newPath = newParentPath + '/skills/' + newSkillId;
    batch.set(db.doc(newPath), skill);
    if(child.children && child.children.length>0){
        child.children.forEach((grandchild, gci) => {
            copyChildSkill(grandchild, newPath, batch, gci);
        });
    }
}

const deleteChildSkill = (child: ISkill, previousPath: string,  batch: firebase.firestore.WriteBatch) => {
    const deletePath = previousPath + '/skills/' + child.id;
    batch.delete(db.doc(deletePath));
    if(child.children && child.children.length>0){
        child.children.forEach(grandchild => {
            deleteChildSkill(grandchild, deletePath, batch);
        });
    }
}

// export const moveSkillToDifferentParent = (skill: ISkill, skills: ISkill[], parentSkill?: ISkill, parentSkilltree?: ISkilltree, countChildren?: number) => {
//    console.log(skill);
//    console.log(skills);
//    console.log(parentSkill);
//    console.log(parentSkilltree)
//     const prevPath = skill.path || '';
//     console.log(prevPath);
//     const compositionId = skill.composition || '';
//     //find the skill or the skilltree that is the new parent
//     let batch = db.batch();
//     //the new parent is a skill
//     let newPath = '';
//     const newID = uuid();
//     if(parentSkill){
//         newPath = `${parentSkill.path}/skills/${newID}`;
//         skill.order = parentSkill.countChildren;
//     } else if(parentSkilltree){
//         newPath =  `${parentSkilltree.path}/skills/${newID}`;
//         skill.order = countChildren;
//     }
//     console.log(newPath);
//     // let documentRef = db.doc(newPath);
//     // skill.skilltree = parentSkilltree?.id || '';
//     // skill.composition = parentSkilltree?.composition || '';
//     // skill.id = newID;
//     // delete skill.path;
//     // delete skill.parent;
//     // batch.set(documentRef, skill);
//     // if(skill && skill.children && skill.children.length > 0 && skill.path){
//     //     copyChildSkills(skill.path, newPath, batch, skills);
//     // }
//     // batch.commit()
//     //     .then( _ => {
//     //         //skill and child skills are copied, now we need to recursively delete the items from the previous location
//     //         deleteSkill(prevPath, compositionId);
//     //     }, (err) => {
//     //         toast.error(err.message);
//     //     })
//     //     .catch(err => {
//     //         toast.error(err.message);
//     //     })
// }


// const copyChildSkills = (path: string, newPath: string, batch: firebase.firestore.WriteBatch, skills: ISkill[]) => {
//     let childSkills = skills.filter(s => s.parent && checkIfParent(s.parent,path.split('/')));
//     childSkills.forEach(child => {
//         const newID = uuid();
//         const newChildPath = `${newPath}/skills/${newID}`;
//         let childDocumentRef = db.doc(newChildPath);
//         const childPath = child.path || '';
//         delete child.path;
//         delete child.name;
//         delete child.isSkill;
//         delete child.decorators;
//         delete child.toggled;
//         delete child.parent;
//         child.skilltree = newChildPath.split('/')[3];
//         child.composition = newChildPath.split('/')[1];
//         child.id = newID;
//         batch.set(childDocumentRef, child);
//         if(child.countChildren > 0){
//             copyChildSkills(childPath, newChildPath, batch, skills);
//         }
//     })
// }


// const checkIfParent = (arr1: string[], arr2: string[]) => {
//     if(arr1.length !== arr2.length + 2)
//         return false;
//     for(var i = arr2.length; i--;) {
//         if(arr1[i] !== arr2[i])
//             return false;
//     }

//     return true;
// }