export default interface IResult {
    id?: string;
    user: string; //refers to the user uid
    displayName: string;
    email: string;
    photoURL?: string;
    compositions: string[]; //refers to composition ID's
    progress: any;  //combination of composition ID and completed skills
}