import { db, functions } from "../firebase/firebase";
import { toast } from "react-toastify";
import ISkill from "../models/skill.model";
import ISkilltree from "../models/skilltree.model";
import { v4 as uuid } from "uuid";
import firebase from "firebase/app";
import { getFlatDataFromTree } from "react-sortable-tree";

export const getSkillById = (skillId: string) => {
  return db
    .collectionGroup("skills")
    .where("id", "==", skillId)
    .get()
    .then((snap) => {
      if (snap.empty) {
        return null;
      } else {
        return {
          ...snap.docs[0].data(),
          path: snap.docs[0].ref.path,
          id: snap.docs[0].id,
        } as ISkill;
      }
    })
    .catch((err) => {
      toast.error("Error finding skill ..." + err.message);
      return null;
    });
};

export const importMultipleSkills = async (
  importedSkills: ISkill[],
  parentSkilltree: ISkilltree,
  isAddingRootSkillsAtIndex: number
) => {
  for (let index = 0; index < importedSkills.length; index++) {
    const skill = importedSkills[index];
    await updateSkill(
      skill,
      parentSkilltree,
      undefined,
      isAddingRootSkillsAtIndex + index
    );
  }
};

export const updateSkill = (
  updatedSkill: ISkill,
  parentSkilltree: ISkilltree,
  parentSkill?: ISkill,
  isAddingRootSkillAtIndex?: number,
  isEditing?: boolean
) => {
  let path = "";
  let order = 0;
  if (isEditing) {
    path = updatedSkill.path || "";
    order = updatedSkill.order || 0;
  } else if (typeof isAddingRootSkillAtIndex !== 'undefined' && isAddingRootSkillAtIndex > -1) {
    path = `${parentSkilltree?.path}/skills/${updatedSkill.id}`;
    order = isAddingRootSkillAtIndex;
  } else {
    path = `${parentSkill?.path}/skills/${updatedSkill.id}`;
    order = parentSkill?.countChildren || 0;
  }
  let skill: ISkill = {
    id: updatedSkill.id,
    title: updatedSkill.title,
    description: updatedSkill.description || "",
    direction: updatedSkill.direction || "top",
    links: updatedSkill.links || [],
    optional: updatedSkill.optional ? true : false,
    countChildren: updatedSkill.countChildren || 0,
    order: order,
  };
  if (!isEditing) {
    skill.composition = parentSkilltree?.composition;
    skill.skilltree = parentSkilltree?.id;
  }
  if (path.length === 0) return;
  try {
    return db.doc(path)
      .set(skill, { merge: true })
      .then((_) => {
        if (!isEditing && parentSkill?.path) {
          db.doc(parentSkill.path).update({
            countChildren: firebase.firestore.FieldValue.increment(1),
          });
        }
        if (!isEditing) {
          db.collection("compositions")
            .doc(skill.composition)
            .update({
              // skillcount: this.state.skills.length,
              skillcount: firebase.firestore.FieldValue.increment(1),
              lastUpdate: firebase.firestore.Timestamp.now(),
            });
        }
        toast.info(
          `${skill.title} ${isEditing ? "updated" : "added"} successfully`
        );
      })
      .catch((err) => {
        toast.error(err.message);
      });
  } catch (e) {
    toast.error("Error saving skill");
    return;
  }
};

export const deleteSkill = (path: string, compositionId: string) => {
  if (path.length === 0 || compositionId.length === 0) {
    toast.error("Missing path or composition Id for destroy operation");
    return;
  }
  const deleteFirestorePathRecursively = functions.httpsCallable(
    "deleteFirestorePathRecursively"
  );
  return deleteFirestorePathRecursively({
    collection: "Skill",
    path: path,
  })
    .then((result) => {
      console.log(result);
      if (result.data.error) {
        toast.error(result.data.error);
      } else {
        toast.info(result.data.result);
        db.collection("compositions")
          .doc(compositionId)
          .update({
            // skillcount: this.state.skills.length,
            skillcount: firebase.firestore.FieldValue.increment(-1),
            lastUpdate: firebase.firestore.Timestamp.now(),
          });
      }
    })
    .catch((error) => {
      toast.error(error.message);
    });
};

export const reorderSkills = (data: any) => {
  let batch = db.batch();
  //find the parent skill
  const flatSkills = getFlatDataFromTree({
    treeData: data.treeData,
    getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
    ignoreCollapsed: false, // Makes sure you traverse every node in the tree, not just the visible ones
  });

  const parentSkill = flatSkills[data.nextTreeIndex].parentNode;
  let parentsChildren;
  if (parentSkill) {
    parentsChildren = parentSkill.children;
  } else {
    //parent is the root
    parentsChildren = data.treeData;
  }

  //update the order of skills under the new parent
  parentsChildren.forEach((child, index) => {
    batch.update(db.doc(child.path), { order: index });
  });
  batch.commit();
};

export const moveSkill = (data: any, skilltree: ISkilltree) => {
  //define a new ID for the skill and define the database batch
  const newSkillId = uuid();
  let batch = db.batch();
  //find the parent skill
  const flatSkills = getFlatDataFromTree({
    treeData: data.treeData,
    getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
    ignoreCollapsed: false, // Makes sure you traverse every node in the tree, not just the visible ones
  });

  const parentSkill = flatSkills[data.nextTreeIndex].parentNode;
  let newSkillIndexInParent;
  let parentsChildren;
  if (parentSkill) {
    newSkillIndexInParent = parentSkill.children.findIndex(
      (child) => child.id === data.node.id
    );
    parentsChildren = parentSkill.children;
  } else {
    //parent is the root
    newSkillIndexInParent = data.nextTreeIndex;
    parentsChildren = data.treeData;
  }
  //get the index of the current skill in the parent
  //update the order of skills under the new parent
  parentsChildren.forEach((child, index) => {
    if (index !== newSkillIndexInParent) {
      batch.update(db.doc(child.path), { order: index });
    }
  });
  //first make new record for skill
  let newPath = `${skilltree.path}/skills/`;
  data.nextPath.forEach((skillId, index, arr) => {
    if (index < arr.length - 1) {
      newPath += `${skillId}/skills/`;
    } else {
      newPath += newSkillId;
    }
  });
  let skill = cleanSkill(data.node, newSkillId, newSkillIndexInParent);
  skill.id = newSkillId;
  batch.set(db.doc(newPath), skill);
  //make new record for all children
  if (data.node.children && data.node.children?.length > 0) {
    data.node.children.forEach((child, index) => {
      copyChildSkill(child, newPath, batch, index);
    });
  }
  //then delete skill including all child skills
  let previousPath = `${skilltree.path}/skills/`;
  data.prevPath.forEach((skillId, index, arr) => {
    previousPath += skillId;
    if (index < arr.length - 1) {
      previousPath += "/skills/";
    }
  });
  batch.delete(db.doc(previousPath));
  //and delete all children
  if (data.node.children && data.node.children?.length > 0) {
    data.node.children.forEach((child) => {
      deleteChildSkill(child, previousPath, batch);
    });
  }
  batch.commit();
};

const cleanSkill = (dirtySkill: ISkill, newSkillId: string, order: number) => {
  let skill: ISkill = {
    id: newSkillId,
    title: dirtySkill.title,
    description: dirtySkill.description,
    direction: dirtySkill.direction,
    links: dirtySkill.links,
    optional: dirtySkill.optional,
    countChildren: dirtySkill.children ? dirtySkill.children.length : 0,
    order: order,
    composition: dirtySkill.composition,
    skilltree: dirtySkill.skilltree,
  };
  return skill;
};

const copyChildSkill = (
  child: ISkill,
  newParentPath: string,
  batch: firebase.firestore.WriteBatch,
  index: number
) => {
  const newSkillId = uuid();
  let skill = cleanSkill(child, newSkillId, index);
  const newPath = newParentPath + "/skills/" + newSkillId;
  batch.set(db.doc(newPath), skill);
  if (child.children && child.children.length > 0) {
    child.children.forEach((grandchild, gci) => {
      copyChildSkill(grandchild, newPath, batch, gci);
    });
  }
};

const deleteChildSkill = (
  child: ISkill,
  previousPath: string,
  batch: firebase.firestore.WriteBatch
) => {
  const deletePath = previousPath + "/skills/" + child.id;
  batch.delete(db.doc(deletePath));
  if (child.children && child.children.length > 0) {
    child.children.forEach((grandchild) => {
      deleteChildSkill(grandchild, deletePath, batch);
    });
  }
};
