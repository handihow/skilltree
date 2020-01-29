import React from 'react'

export default function AddStudentsStepper(props: {step: number, option: string}) {
    return (
        <ul className="steps has-content-centered">
        <li className={props.step === 1 ? "steps-segment is-active" : "steps-segment"}>
            <span className="steps-marker"></span>
            <div className="steps-content">
            <p className="is-size-4">Options</p>
            <p>Choose how you want to add students</p>
            </div>
        </li>
        {(props.option === 'names_emails' || props.option === 'names_only') && <li className={props.step === 2 ? "steps-segment is-active" : "steps-segment"}>
            <span className="steps-marker"></span>
            <div className="steps-content">
            <p className="is-size-4">Names</p>
            <p>Enter the full names of your students</p>
            </div>
        </li>}
        {(props.option === 'names_emails' || props.option === 'emails_only') &&<li className={props.step === 3 ? "steps-segment is-active" : "steps-segment"}>
            <span className="steps-marker"></span>
            <div className="steps-content">
            <p className="is-size-4">Emails</p>
            <p>Enter the email addresses of your students</p>
            </div>
        </li>}
        <li className={props.step === 4 ? "steps-segment is-active" : "steps-segment"}>
            <span className="steps-marker"></span>
            <div className="steps-content">
            <p className="is-size-4">Verify</p>
            <p>Check your input and create student list</p>
            </div>
        </li>
        </ul>
    )
}
