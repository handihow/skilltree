export default interface IUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    emailVerified: boolean;
    standardFeedback?: string;
    isTeacher?: boolean;
    isStudent?: boolean;
}