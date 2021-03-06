import { SkillThemeType } from "beautiful-skill-tree";

export default interface IComposition {
    id?: string;
    title: string;
    user?: string; //refers to user uid
    username?: string; //refers to user email
    theme?: SkillThemeType;
    hasBackgroundImage?: boolean;
    backgroundImage?: string;
    thumbnailImage?: string;
    skillcount?: number;
    loggedInUsersOnly?: boolean;
    loggedInUsersCanEdit?: boolean;
    canCopy?: boolean;
    sharedUsers?: string[];
    lastUpdate?: any;
}