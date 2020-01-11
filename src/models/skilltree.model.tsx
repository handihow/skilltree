export default interface ISkilltree {
    id: string;
    title: string;
    description: string;
    collapsible: boolean;
    order: number;
    //make it compatible with treebeard
    name?: string;
    isSkill?: boolean;
    toggled?: boolean;
    children?: any;
}