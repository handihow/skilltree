export default interface IResult {
    email: string;
    user: string; //refers to the user uid
    displayName: string;
    compositions: string[]; //refers to composition ID's
    skilltrees: string[]; //refers to skilltree ID's
    progress: any;  //combination of composition ID and completed skills
}