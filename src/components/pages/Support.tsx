import React from 'react'

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
                </p>
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
                    rel="noopener noreferrer" >contact HandiHow</a> directly if you have any questions or comments 
                    about the project, or you just want to get in touch.
            </div>
            <h3 className="title is-3">Why are some features locked?</h3>
            <div className="content">
                <p>
                    We gladly contributed to society with this open source project. However, some level of funding
                    will be required in the future if we want to keep maintaining the project and build great new features.
                </p>
                <p>
                    The unlock features will sponsor the project with $1 every time. 
                    You can use the software free of charge without the more advanced features.
                </p>
                <p>
                    All features of SkillTree will be completely free until summer 2020. 
                    We have provided a credit card number for anyone who wishes to unlock certain features until that time.
                </p>
            </div>
            </div>
        </section>
        </article>
    )
}
