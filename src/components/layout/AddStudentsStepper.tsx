import React from 'react'

export default function AddStudentsStepper(props: {step: number}) {
    return (
        <ul className="steps has-content-centered">
        <li className={props.step === 1 ? "steps-segment is-active" : "steps-segment"}>
            <span className="steps-marker"></span>
            <div className="steps-content">
            <p className="is-size-4">Step 1</p>
            <p>Enter the full names of your students</p>
            </div>
        </li>
        <li className={props.step === 2 ? "steps-segment is-active" : "steps-segment"}>
            <span className="steps-marker"></span>
            <div className="steps-content">
            <p className="is-size-4">Step 2</p>
            <p>Enter the email addresses of your students</p>
            </div>
        </li>
        <li className={props.step === 3 ? "steps-segment is-active" : "steps-segment"}>
            <span className="steps-marker"></span>
            <div className="steps-content">
            <p className="is-size-4">Step 3</p>
            <p>Check your input and create student list</p>
            </div>
        </li>
        </ul>
    )
}
