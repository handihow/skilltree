export default interface IQuiz {
    id: string;
    user?: string; //refers to user uid
    username?: string; //refers to user email
    title: string;
    data?: any;
    created?: any;
    lastUpdate?: any;
    canCopy?: boolean;
}