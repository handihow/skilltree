import React from 'react'
import SkillContent from '../layout/SkillContent';
import ISkill from '../../models/skill.model';

export const skillTreeToSkillArray = (skills) => {
    const skillArray = [];
    skills.forEach((child, index) => {
        addToSkillArray(skillArray, child, [{parentId: 'root', childIndex: index}]);
    })
    return skillArray;
}

const filterChildren = (skill, skills) => {
    const children : any[] = [];
    let rawChildren = skills.filter(s => s.parent.length === skill.parent.length + 2 && s.parent.includes(skill.id));
    rawChildren.forEach(rawChild => {
        let childSkill = {
            tooltip: {
                content: <SkillContent description={rawChild.description} links={rawChild.links ? rawChild.links : []}/>,
                direction: rawChild.direction ? rawChild.direction : 'top'
            },
            children: filterChildren(rawChild, skills),
            links: rawChild.links? rawChild.links : [],
            ...rawChild
        };
        children.push(childSkill);
    });
    return children
}

export const skillArrayToSkillTree = (skills) => {
    //first, extract all the root skills
    let skilltree : any[] = [];
    skills.forEach((skill, index) => {
        if(skill.parent.length===6){
            let rootSkill = {
                tooltip: {
                    content: <SkillContent description={skill.description} links={skill.links ? skill.links : []}/>,
                    direction: skill.direction ? skill.direction : 'top'
                },
                children: filterChildren(skill, skills),
                ...skill
            };

            //this is a root skill
            skilltree.push(rootSkill);
        }
    })
    return(skilltree);
}

const addToSkillArray = (arr, child, parent) => {
    let flatSkill : ISkill = {
        id: child.id,
        title: child.title,
        optional: child.optional ? true : false,
        tooltip: {
            content: <SkillContent description={child.tooltip.description} links={child.tooltip.links}/>,
            description: child.tooltip.description,
            links: child.tooltip.links,
        },
        parent: parent,
        children: [],
        countChildren: child.children.length
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
            addToSkillArray(arr, nestedChild, [...flatSkill.parent || [], {parentId: flatSkill.id, childIndex: index}]);
        })
    }
}