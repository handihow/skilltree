import React from 'react'
import CompositionExample from '../compositions/CompositionExample';
import YouTube from 'react-youtube';
import { Link } from 'react-router-dom';

const physicsExampleCompositionId = '579fa4b4-9bc9-4665-ba3a-a135b03a5aa8'; //74b40838-1b5e-463c-a0d2-0fa0040c8ed4
const soccerExampleCompositionId = '2b1c7bfc-ee23-455e-89e8-15d170d74aab';
const officeExampleCompositionId = '8a0decbb-c03e-4828-ae44-7e8633bf0418';

export default function About() {
    return (
        <article>
        <section className="section">
            <div className="container">
            <h1 className="title">SkillTree</h1>
            <h3 className="subtitle">Support autonomy with gamification</h3>
            <article className="message is-primary">
                <div className="message-body">
                Gamification is the use of game design elements in non-game contexts.
                </div>
            </article>
            <div className="columns">
                <div className="column is-two-fifths">
                    <div className="content">
                    <p>Self Determination Theory identifies three innate needs that, if satisfied, 
                    allow optimal function and growth:
                    Competence, Relatedness and Autonomy. 
                    Students can develop new cognitive skills better if they are intrinsically motivated to learn.</p>
                    <p>In this context, 
                    <strong style={{marginLeft:"5px"}}>Skill Trees</strong> can help 
                    increase the level of autonomy in the learning process.
                    They can be used as gamification element to help students acquire serious skills in a fun way.</p>
                    <h5 className="title is-6" style={{marginTop: "10px"}}>
                        This application makes it easy to create skill trees and monitor learning progress.</h5>
                        <Link to="/login" className="button is-large is-primary is-outlined is-rounded">Start Now</Link>
                    </div>
                </div>
                <div className="column is-three-fifths">
                <YouTube
                    videoId="RGJJt1Vl3Ro"
                    opts = {{height: '300', width: '550'}}/>
                </div>
            </div>
            </div>
        </section>
        <section className="section">
            <div className="container">
            <h1 className="title">Roadmap</h1>
            <h3 className="subtitle">Tips on creating your own skilltree step by step</h3>
            <div className="content">
                <ol>
                    <li>
                    Start with a definition of the skill tree: how big will it be? For how long will it be used? 
                    Does this skill tree cover one assignment, a chapter or perhaps the entire grade? 
                    Is it used cross-curricular? The definition of a skill tree must be clear.
                    </li>
                    <li>
                    Promise something nice. Give the students a goal to go to to work. 
                    This can be an outing, a fun assignment or watch a movie. 
                    </li>
                    <li> 
                    Identify which parts belong in the skill tree. Make a
                    list of all chapters, skills or knowledge covered.
                    For each part, remember: what should I know before I start the next skill? 
                    Where does the skill tree lead towards?
                    </li>
                    <li>
                    Create connections. Which skills belong together? Which
                    parts have a causal relationship? Which in-depth material can
                    I offer and how does this relate to the trunk of the skill tree?
                    </li>
                    <li>
                    Clean up. Make sure all skills work towards the end goal or
                    an interesting in-depth branch. Make sure everything is together
                    is connected.
                    </li>
                
                </ol>

            </div>
            </div>
        </section>
        <section className="section">
            <div className="container">
            <h1 className="title">Education</h1>
            <h3 className="subtitle">Application of Skill Trees in Education</h3>
            <div className="content">
                <p>We all understand well the idea of a normal educational curricula: a series of classes that combined 
                together lead to some form of degree, all marked by specific explicit checks and markers. 
                While the specific of this educational approach are worth a review, 
                there are aspects of this approach that are sound:</p>
            
                <ul>
                    <li>
                    clear markers of progress
                    </li>
                    <li>
                    shared understanding of the basic level of knowledge of an individual
                    </li>
                </ul>
            
                <p>The linear approach has limitation, especially in erasing individual interests and skills. 
                These skills can be connected and interrelated in trees, that build up in incremental steps.
                Borrowing from game design, skill trees can help regain the student's control to learn skills
                at their own pace and of their own interest.</p>
                <h5 className="title is-6" style={{marginTop: "10px"}}>
                        Example of SkillTree for Physics Education</h5>
            </div>
            </div>
            <div style={{maxWidth: '95%', marginLeft:"auto", marginRight:"auto", marginBottom: "20px"}}>
                <CompositionExample compositionId={physicsExampleCompositionId} />
            </div>
            <div className="container">
                <div className="content">
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
                <Link to="/login" className="button is-large is-primary is-outlined is-rounded">Start Now</Link>
            </div>
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
                <div className="content">
                    <p>
                        Motivate your employees by creating a clear path to reaching the next level.
                        You can create Skill Trees to define paths to master new skills and get promoted to the next job.
                    </p>
                
                    <ul>
                        <li>
                        clear description of skills that are required
                        </li>
                        <li>
                        empower your employees to reach new heights
                        </li>
                    </ul>
                
                    <p>Employees can now get proficient in the areas of interest. 
                        As manager, you can monitor the progress of your team and mark skills as completed along the way.
                    </p>
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
                    <Link to="/login" className="button is-large is-primary is-outlined is-rounded">Start Now</Link>
                </div>
                </div>
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
                <div className="content">
                    <p>As trainer of a team, you can use skill trees to give team members a clear path to becoming a better player.
                        You can define each skill that is necessary for becoming a complete master, and increase the level of 
                        difficulty going down the tree.
                    </p>
                    <ul>
                        <li>
                        clear description of skills
                        </li>
                        <li>
                        explanations and videos for every skill
                        </li>
                    </ul>
                    <p>Team members can now train more effectively and in the area of interest. As trainer of the team,
                        you can keep track of the progress of each player in the team. You can also mark skills completed
                        during training or games.
                    </p>
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
                    <Link to="/login" className="button is-large is-primary is-outlined is-rounded">Start Now</Link>
                </div>
                </div>
            </div>
        </section>
        <section className="section">
            <div className="container">
                <h1 className="title">
                    Track your students
                </h1>
                <h3 className="subtitle">Track the progress of students on their SkillTree</h3>
                <div className="content">
                <p>You can create student accounts in the application and assign your SkillTree to each student.
                    You can then keep track of the progress on the student monitoring page. 
                </p>
                <p>
                    Optionally, you can keep full control over the completed state of each skill. 
                    You can adjust the settings of your SkillTree and not allow students to mark skills as complete.
                </p>
                
                </div>
                <figure className="image is-16by9" style={{marginBottom:"20px"}} >
                    <img 
                     alt="Student monitoring page"
                     src="https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/Schermafbeelding%202020-03-28%20om%2011.48.22.png?alt=media&token=12679ba7-182f-4d23-bdb4-01bef60506e4"></img>
                </figure>
                
                <h3 className="title is-3">Monitor progress</h3>
                <p>Learn how to add students and monitor their progress by viewing the video below.</p>
                <YouTube
                    videoId="nO3VHR9aezc"
                    opts = {{height: '300', width: '550'}}/>
                <Link to="/login" className="button is-large is-primary is-outlined is-rounded">Start Now</Link>
            </div>
        </section>
        </article>
    )
}
