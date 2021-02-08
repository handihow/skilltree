import React from 'react'
import YouTube from 'react-youtube';

export default function Support() {
    return (
        <article>
        <section className="section">
            <div className="container">
            <h1 className="title">Support</h1>
            <h3 className="subtitle">SkillTree is Open Source software</h3>
            <article className="message is-primary">
                <div className="message-body">
                Free to use, free to contribute
                </div>
            </article>
            <div className="content">
                <p>
                    SkillTree is an open source project maintained by HandiHow - Education Developers. 
                    Check out the short introduction video to learn more.
                </p>
                <YouTube
                                videoId="XgAQkkm6MpA"
                                opts = {{height: '270', width: '450'}}/>
                <p>
                    You can create <a href="https://github.com/handihow/skilltree/issues" 
                    target="_blank"
                    rel="noopener noreferrer">support tickets</a> if you find any irregularities or bugs in the software.
                    The link will redirect you to the Github repository of the source code.
                    You can then open a support ticket.
                    Feel free to send modification requests via the same link.

                </p>
                    You can also 
                    <a href="https://handihow.com/en/contact/" 
                    target="_blank"
                    rel="noopener noreferrer" style={{marginLeft:"5px"}}>contact HandiHow</a> directly if you have any questions or comments 
                    about the project, or you just want to get in touch.
            </div>
            <h3 className="title is-3">Supporting SkillTree</h3>
            <div className="content">
                <p>
                    We gladly contributed to society with this open source project. However, some level of funding
                    is desired if we want to keep maintaining the project and build great new features.
                </p>
                <p>
                    You can support us by
                <a href="https://www.patreon.com/bePatron?u=32959269" data-patreon-widget-type="become-patron-button" style={{marginLeft:"5px"}}>becoming a Patron!</a><script async src="https://c6.patreon.com/becomePatronButton.bundle.js"></script>
                </p>
            </div>
            <h3 className="title is-3">Credits</h3>
            <div className="content">
                <p>
                    We would not have been able to create this application without the javascript library "Beautiful Skill Tree".
                </p>
                <p>
                    This javascript library provides the core functionality of SkillTree application: creating online skill trees.
                </p>
                <p>
                    Please give a big hand to Andrico Karoulla, visit 
                    <a href="https://github.com/andrico1234/beautiful-skill-tree" 
                    target="_blank"
                    rel="noopener noreferrer" style={{marginLeft:"5px"}}>his project on Github </a>
                    and give him the credits that he deserves!
                </p>
                
            </div>
            </div>
        </section>
        </article>
    )
}
