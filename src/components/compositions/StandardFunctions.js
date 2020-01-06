import React from 'react'
import SkillContent from '../layout/SkillContent';

export const skillTreeToSkillArray = (skills) => {
    const skillArray = [];
    skills.forEach((child, index) => {
        addToSkillArray(skillArray, child, [{parentId: 'root', childIndex: index}]);
    })
    return skillArray;
}

export const skillArrayToSkillTree = (skills, saveToDb) => {
    //first, extract all the root skills
    let skilltree = [];
    skills.forEach((skill, index) => {
        if(skill.parent.length===1){
            //this is a root skill
            skilltree.push(skill);
        } else {
            let parentSkill;
            skill.parent.forEach((p, i, arr) => {
                if(i===0){
                    parentSkill = skilltree[p.childIndex];
                } else if(parentSkill.id === p.parentId && i === arr.length - 1){
                    //remove the calculated parent and tooltip content properties
                    delete skill.parent;
                    if(typeof saveToDb !== 'undefined' && saveToDb){
                        delete skill.tooltip.content;
                    }
                    //now add the skill to the children of this parent
                    parentSkill.children.push(skill);
                } else {
                    parentSkill = parentSkill.children[p.childIndex];
                }
            })
        }
    })
    return(skilltree);
}

const addToSkillArray = (arr, child, parent) => {
    let flatSkill = {
        id: child.id,
        title: child.title,
        optional: child.optional ? true : false,
        tooltip: {
            content: <SkillContent description={child.tooltip.description} links={child.tooltip.links}/>,
            description: child.tooltip.description,
            links: child.tooltip.links,
        },
        parent: parent,
        children: []
    };
    if(child.icon){
        flatSkill.icon = child.icon
    }
    if(child.direction){
        flatSkill.direction = child.direction
    }
    arr.push(flatSkill);
    if(child.children.length>0){
        child.children.forEach((nestedChild, index) => {
            addToSkillArray(arr, nestedChild, [...flatSkill.parent, {parentId: flatSkill.id, childIndex: index}]);
        })
    }
}