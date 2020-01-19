import { SkillThemeType } from "beautiful-skill-tree";

export default interface ICompostion {
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
    sharedUsers?: string[];
}