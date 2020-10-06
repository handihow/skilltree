export default interface IAnswer {
    id: string;
    user?: string; //refers to user uid
    username?: string; //refers to user email
    displayName?: string; //refers to user display name
    quiz?: string //refers to quiz id
    data?: any;
    created?: any;
    lastUpdate?: any;
    isFinished?: boolean;
    correctAnswers?: number;
    incorrectAnswers?: number;
}