import ILink from './link.model';

export default interface ISkill {
    composition?: string;        //references the composition ID
    skilltree?: string;          //references the skilltree ID
    id: string;
    title: string;
    description: string;        
    links: ILink[];
    order: number;
    optional: boolean;
    direction: string;
    //properties to track the parent and path
    parent?: string[];
    path?: string;
    //properties to assist in loading into treebeard
    name?: string;
    isSkill?: boolean;
    decorators?: any;
    toggled?: boolean;    

}