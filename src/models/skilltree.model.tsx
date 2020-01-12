export default interface ISkilltree {
    id: string;
    title: string;
    description: string;
    collapsible: boolean;
    order: number;
    composition?: string; //references the parent composition ID
    //make it compatible with treebeard
    name?: string;
    isSkill?: boolean;
    toggled?: boolean;
    children?: any;
    decorators?: any;
    countChildren?: number;
    path?: string;
}