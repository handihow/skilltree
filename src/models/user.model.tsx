export interface IFLContent {
    id: string;
    name: string;
}

export interface IFLUserContent {
    subjects: IFLContent[];
    groups: IFLContent[];
    programs: IFLContent[];
}

export default interface IUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    emailVerified: boolean;
    standardFeedback?: string;
    hostedDomain?: string;
    provider?: string;
    creationTime?: any;
    lastSignInTime?: any;
    type?: string;
    organisation?: string;
    subjects?: string;
    groups?: string;
    programs?: string;
    flUserContent?: IFLUserContent;
}