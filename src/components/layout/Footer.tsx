import React from 'react'

export default function Footer() {
    return (
        <footer className="footer" style={{
            position:'absolute',
            bottom:'-60',
            width:'100%',
            height:'60px',   /* Height of the footer */
         }}>
        <div className="content has-text-centered">
            <p>
            <strong>SkillTree</strong> by 
            <a href="https://handihow.com"
            target="_blank" rel="noopener noreferrer" style={{marginLeft:"5px"}}>HandiHow</a>. The source code is licensed
            <a href="http://opensource.org/licenses/mit-license.php" 
            target="_blank" rel="noopener noreferrer" style={{marginLeft:"5px"}}>MIT</a> and
            is located on <a href="https://github.com/handihow/skilltree" 
            target="_blank" rel="noopener noreferrer">Github</a>.
            </p>
            <p>
                You can submit
                <a href="https://github.com/handihow/skilltree/issues" 
                    target="_blank"
                    rel="noopener noreferrer" style={{marginLeft:"5px", marginRight:"5px"}}>support and improvement request tickets</a>
                    on our Github repo, or fill the <a href="https://handihow.com/en/contact/" 
                    target="_blank"
                    rel="noopener noreferrer" style={{marginLeft:"5px"}}>contact form</a> of HandiHow.
                <a href="https://www.patreon.com/bePatron?u=32959269" data-patreon-widget-type="become-patron-button" style={{marginLeft:"5px"}}>Become a Patron!</a><script async src="https://c6.patreon.com/becomePatronButton.bundle.js"></script>
            </p>
        </div>
        </footer>
    )
}
