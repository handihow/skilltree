export default interface IUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    emailVerified: boolean;
    standardFeedback?: string;
    hostedDomain?: string;
    creationTime?: any;
    lastSignInTime?: any;
    type?: string;
    organisation?: string;
}