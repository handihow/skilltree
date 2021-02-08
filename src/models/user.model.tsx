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
    isTeacher?: boolean;
    isStudent?: boolean;
}