import React from 'react'
import CompositionExample from '../compositions/CompositionExample';

const physicsExampleCompositionId = '74b40838-1b5e-463c-a0d2-0fa0040c8ed4';
const soccerExampleCompositionId = '2b1c7bfc-ee23-455e-89e8-15d170d74aab';
const officeExampleCompositionId = '8a0decbb-c03e-4828-ae44-7e8633bf0418';

export default function About() {
    return (
        <article>
        <section className="section">
            <div className="container">
            <h1 className="title">Skill Tree</h1>
            <h3 className="subtitle">Support autonomy with gamification</h3>
            <article className="message is-primary">
                <div className="message-body">
                Gamification is the use of game design elements in non-game contexts.
                </div>
            </article>
            <div className="columns is-mobile">
                <div className="column is-3">
                    <figure className="image is-3by2">
                    <img alt="" 
                        src="https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/SelfDeterminationTheory.png?alt=media&token=06447e6b-5fac-4560-ad7e-707c1393f281" />
                    </figure>
                    
                </div>
                <div className="column">
                    <p>Self Determination Theory identifies three innate needs that, if satisfied, 
                    allow optimal function and growth:
                    Competence, Relatedness and Autonomy. 
                    Students can develop new cognitive skills better if they are intrinsically motivated to learn.
                    In this context, 
                    <strong style={{marginLeft:"5px"}}>Skill Trees</strong> can help 
                    increase the level of autonomy in the learning process.
                    They can be used as gamification element to help students acquire serious skills in a fun way.</p>
                    <h5 className="title is-6" style={{marginTop: "10px"}}>
                        This application makes it easy to create skill trees and monitor learning progress.</h5>
                </div>
            </div>
             
            </div>
        </section>
        <section className="section">
            <div className="container">
            <h1 className="title">Education</h1>
            <h3 className="subtitle">Application of Skill Trees in Education</h3>
            </div>
            <div className="columns" style={{marginTop: "10px"}}>
                <div className="column">
                <p>We all understand well the idea of a normal educational curricula: a series of classes that combined 
                together lead to some form of degree, all marked by specific explicit checks and markers. 
                While the specific of this educational approach are worth a review, 
                there are aspects of this approach that are sound:</p>
                <div className="content">
                    <ul>
                        <li>
                        clear markers of progress
                        </li>
                        <li>
                        shared understanding of the basic level of knowledge of an individual
                        </li>
                    </ul>
                </div>
                <p>The linear approach has limitation, especially in erasing individual interests and skills. 
                These skills can be connected and interrelated in trees, that build up in incremental steps.
                Borrowing from game design, skill trees can help regain the student's control to learn skills
                at their own pace and of their own interest.</p>
                </div>
                <div className="column">
                <CompositionExample compositionId={physicsExampleCompositionId}/>
                </div>
            </div>
            <div className="container">
            <article className="message is-primary">
                <div className="message-body">
                Give your students ownership and control over their learning path 
                </div>
            </article>
            <p>Teachers can create skill trees with this application and choose whether the students
                are allowed to update the skill tree themselves or keep full control over completion status.
                There is an overview page where you can view the progress of your students. The skill tree now allows students
                to choose the <strong style={{marginLeft: "5px"}}>path and the pace</strong> of their learning.
            </p>
            </div>
        </section>
        <section className="section">
            <div className="container">
            <h1 className="title">Business</h1>
            <h3 className="subtitle">Application of Skill Trees in Business</h3>
            </div>
            <div className="columns" style={{marginTop: "10px"}}>
                <div className="column">
                <CompositionExample compositionId={officeExampleCompositionId}/>
                </div>
                <div className="column">
                <p>
                    Motivate your employees by creating a clear path to reaching the next level.
                    You can create Skill Trees to define paths to master new skills and get promoted to the next job.
                </p>
                <div className="content">
                    <ul>
                        <li>
                        clear description of skills that are required
                        </li>
                        <li>
                        empower your employees to reach new heights
                        </li>
                    </ul>
                </div>
                <p>Employees can now get proficient in the areas of interest. 
                    As manager, you can monitor the progress of your team and mark skills as completed along the way.
                </p>
                </div>
            </div>
            <div className="container">
            <article className="message is-primary">
                <div className="message-body">
                Give clear guidance to your employees what is expected to reach a new level or promotion
                </div>
            </article>
            <p>Managers or company trainers can create skill trees with this application and choose whether the employees
                are allowed to update the skill tree themselves or keep full control over completion status.
                You can keep full control if you want to see which employee is more complete or
                comes to mind for a certain job or position. Otherwise, you can also have employees
                update the completion status and you can monitor their progress.
            </p>
            </div>
        </section>
        <section className="section">
            <div className="container">
            <h1 className="title">Sports</h1>
            <h3 className="subtitle">Application of Skill Trees in Sports</h3>
            </div>
            <div className="columns" style={{marginTop: "10px"}}>
                <div className="column">
                <CompositionExample compositionId={soccerExampleCompositionId}/>
                </div>
                <div className="column">
                <p>As trainer of a team, you can use skill trees to give team members a clear path to becoming a better player.
                    You can define each skill that is necessary for becoming a complete master, and increase the level of 
                    difficulty going down the tree.
                </p>
                <div className="content">
                    <ul>
                        <li>
                        clear description of skills
                        </li>
                        <li>
                        explanations and videos for every skill
                        </li>
                    </ul>
                </div>
                <p>Team members can now train more effectively and in the area of interest. As trainer of the team,
                    you can keep track of the progress of each player in the team. You can also mark skills completed
                     during training or games.
                </p>
                </div>
            </div>
            <div className="container">
            <article className="message is-primary">
                <div className="message-body">
                Give clear guidance to your team members and let them train more effectively 
                </div>
            </article>
            <p>Trainers can create skill trees with this application and choose whether the team members
                are allowed to update the skill tree themselves or keep full control over completion status.
                You can keep full control if you want to see (as trainer) which player is more complete or
                comes to mind for a certain position on the field. Otherwise, you can also have team
                members update the completion status and you can monitor their progress.
            </p>
            </div>
        </section>
        </article>
    )
}
