import React from 'react'
import Header from '../../layout/Header'

export default function OptionsEditor({
    composition,
    handleChange
}) {
    return (
        <div className="m-3">
        <Header header='Settings' icon="cogs"></Header>
        <hr></hr>
        <div className="field is-inline-block-desktop">
            <div className="field is-narrow">
                <label className="label">
                    Who can view skilltree
                </label>
                <div className="control">
                {["true", "false"].map((option, index) => (
                    <label className="radio" key={index}>
                        <input type="radio" name="loggedInUsersOnly" value={option}
                            checked={composition && 
                                composition.loggedInUsersOnly?.toString() ===  option ? 
                                true : false}
                            onChange={(event) => handleChange(event.currentTarget.name, event.currentTarget.value === 'true' ? true : false)} />
                        <span style={{marginLeft: "10px"}}>{option === 'true' ? 
                                                'Logged in users' : 'No need to log in'}</span>
                    </label>
                ))}
                </div>
            </div>
            {composition?.loggedInUsersOnly && 
            <React.Fragment>
            <div className="field is-narrow">
                <label className="label">
                    Logged in users can edit skilltree?
                </label>
                <div className="control">
                {["true", "false"].map((option, index) => (
                    <label className="radio" key={index}>
                        <input type="radio" name="loggedInUsersCanEdit" value={option}
                            checked={composition && 
                                composition.loggedInUsersCanEdit?.toString() ===  option ? 
                                true : false}
                            onChange={(event) => handleChange(event.currentTarget.name, event.currentTarget.value === 'true' ? true : false)} />
                        <span style={{marginLeft: "10px"}}>{option === 'true' ? 
                                                'Logged in users can mark skills as completed' : 'Only I can mark skills as completed'}</span>
                    </label>
                ))}
                </div>
            </div>
            <div className="field is-narrow">
                <label className="label">
                    Logged in users can copy skilltree?
                </label>
                <div className="control">
                {["true", "false"].map((option, index) => (
                    <label className="radio" key={index}>
                        <input type="radio" name="canCopy" value={option}
                            checked={composition && 
                                composition.canCopy?.toString() ===  option ? 
                                true : false}
                            onChange={(event) => handleChange(event.currentTarget.name, event.currentTarget.value === 'true' ? true : false)} />
                        <span style={{marginLeft: "10px"}}>{option === 'true' ? 
                                                'Logged in users can copy the skilltree' : 'Copying skilltree not allowed'}</span>
                    </label>
                ))}
                </div>
            </div>
            </React.Fragment>}
        </div>
        </div>
    )
}
