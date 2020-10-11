import React, { Component } from 'react'
import AddStudentStepper from '../layout/AddStudentsStepper';
import RichTextEditor from 'react-rte';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import {isEmail} from 'validator';
import {v4 as uuid} from "uuid"; 
import { toast } from 'react-toastify';
import { functions } from '../../firebase/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import generator from 'generate-password';
import {CSVLink} from 'react-csv';

type TParams =  { compositionId: string };

interface IStudentFormStep1 {
    toMonitor: boolean;
    step: number;
    option: string;
    displayNames: any;
    ghostAccounts: number;
    processedDisplayNames: string[];
    emailAddresses: any;
    processedEmailAddresses: string[];
    passwords: string[];
    hasDownloadedStudentList: boolean;
    showWarning: boolean;
}

const options = [
    {
        name: 'names_emails', 
        title: 'Full names and email addresses', 
        helpText: 'Recommended! Use this option if you want to create accounts for all your students so they can interact with this skilltree'
    },
    {
        name: 'names_only', 
        title: 'Full names only', 
        helpText: 'Use this option if you want to add students by name and let the system automatically assign usernames & passwords for their accounts. Afterwards you can send the login details to your students.'
    },
    {
        name: 'emails_only', 
        title: 'Email addresses only', 
        helpText: 'Use this option if you want to create accounts for all your students without entering full names. Names will be added automatically when students log in with Google or Microsoft, or they can be updated by the student in their profile.'
    },
    {
        name: 'ghost_accounts', 
        title: 'Ghost accounts', 
        helpText: 'Ghost accounts are an easy way to quickly generate accounts for your students. You can pass the created usernames/passwords to students and on first login they will be asked to update the account.'
    }
]

export class CompositionAddStudents extends Component<RouteComponentProps<TParams>, IStudentFormStep1> {
    constructor(props: RouteComponentProps<TParams>){
        super(props);
        this.state = {
            toMonitor: false,
            step: 1,
            option: 'names_emails',
            ghostAccounts: 10,
            displayNames: 
                    RichTextEditor.createEmptyValue(),
            processedDisplayNames: [],
            emailAddresses:
                    RichTextEditor.createEmptyValue(),
            processedEmailAddresses: [],
            passwords: [],
            hasDownloadedStudentList: false,
            showWarning: false
        };
    }

    backToMonitor = () => {
        this.setState({
            toMonitor: true
        })
    }

    handleChange = (value) => {
        const div = document.createElement("div");
        div.innerHTML = value.toString('html');
        const nodes = div.getElementsByTagName("p");
        const array : string[] = [];
        for(var i=0; i<nodes.length; i++) { 
            if(nodes[i].innerHTML !== '<br>') { 
                array.push(nodes[i].innerHTML);
            }; 
        }
        this.setState({
            displayNames: value,
            processedDisplayNames: array,
            passwords: this.autoCreatePasswords(array.length)
        })
        if(this.state.option === 'names_only') {
            //automatically create email accounts now
            this.setState({
                processedEmailAddresses: this.autoCreateEmails(array.length, array)
            });
        }
    }

    handleEmails = (value) => {
        const div = document.createElement("div");
        div.innerHTML = value.toString('html');
        const nodes = div.getElementsByTagName("p");
        const array : string[] = [];
        for(var i=0; i<nodes.length; i++) { 
            if(nodes[i].innerHTML !== '<br>' && isEmail(nodes[i].innerHTML)) { 
                array.push(nodes[i].innerHTML);
            }; 
        }
        this.setState({
            emailAddresses: value,
            processedEmailAddresses: array,
            passwords: this.autoCreatePasswords(array.length)
        });
        if(this.state.option === 'emails_only'){
            //automatically create names now
            this.setState({
                processedDisplayNames: this.autoCreateDisplayNames(array.length)
            });
        }
    }

    autoCreateEmails = (number: number, displayNames?: string[]) => {
        const emails: string[] = []
        for (let index = 0; index < number; index++) {
            const autostring = generator.generate({
                length: 10,
                uppercase: false
            })
            let email: string =  autostring + '@skilltree.student';
            if(typeof displayNames !== 'undefined'){
                email = displayNames[index].toLowerCase().split(' ').join('.') + '@skilltree.student';
            }
            emails.push(email);
        }
        return emails;
    }

    autoCreateDisplayNames = (number: number) => {
        const displayNames: string[] = [];
        for (let index = 0; index < number; index++) {
            const displayName = 'Student ' + (index < 9 ? '0' + (index + 1) : index + 1);
            displayNames.push(displayName);
        }
        return displayNames;
    }

    autoCreatePasswords = (number: number) => {
        return generator.generateMultiple(number, {
            length: 10,
            numbers: true
        });
    }

    generateCSVData = () => {
        const headers: string[] = ['Full name', 'Email', 'Password'];
        const data : string[][] = [];
        this.state.processedEmailAddresses.forEach((email, index)=> {
            data.push([
                this.state.processedDisplayNames[index],
                email,
                this.state.passwords[index]
            ]);
        });
        data.unshift(headers);
        return data;
    }

    incrementStep = () => {
        let add = 1;
        if(this.state.option === 'ghost_accounts' && this.state.step === 1){
            //need to create ghost accounts
            this.setState({
                processedDisplayNames: this.autoCreateDisplayNames(this.state.ghostAccounts),
                processedEmailAddresses: this.autoCreateEmails(this.state.ghostAccounts),
                passwords: this.autoCreatePasswords(this.state.ghostAccounts),
            })
        }
        if((this.state.step === 1 && this.state.option === 'emails_only') || 
            (this.state.step === 2 && this.state.option === 'names_only')){
                add = 2;
        } else if(this.state.option === 'ghost_accounts'){
            add = 3;
        }
        this.setState({
            step: this.state.step + add
        })
        
    }

    decrementStep = () => {
        let subtract = 1;
        if((this.state.step === 3 && this.state.option === 'emails_only') ||
            (this.state.step === 4 && this.state.option === 'names_only')){
            subtract = 2
        } else if(this.state.step === 4 && this.state.option === 'ghost_accounts'){
            subtract = 3
        }
        this.setState({
            step: this.state.step - subtract
        })
    }

    addStudentList = (wasWarned: boolean) => {
        if(this.state.hasDownloadedStudentList || wasWarned){
            const currentComponent = this;
            const toastId = uuid();
            toast.info('Adding student list in progress... please wait', {
                toastId: toastId,
                autoClose: 60000
            });
            const addStudentList = functions.httpsCallable('addStudentList');
            addStudentList({
                displayNames: this.state.processedDisplayNames,
                emailAddresses: this.state.processedEmailAddresses,
                passwords: this.state.passwords,
                compositionId: this.props.match.params.compositionId
            })
            .then(function(result) {
                console.log(result);
                if(result.data.error){
                    toast.update(toastId, {
                        render: result.data.error,
                        type: toast.TYPE.ERROR,
                        autoClose: 5000
                    });
                    currentComponent.setState({
                        showWarning: false
                    })
                } else {
                    toast.update(toastId, {
                    render: 'Student list added',
                    autoClose: 3000
                    });
                    currentComponent.setState({
                        toMonitor: true
                    })
                }
            })
            .catch(function(error) {
            toast.update(toastId, {
                render: error.message,
                type: toast.TYPE.ERROR,
                autoClose: 5000
            });
            currentComponent.setState({
                showWarning: false
            })
            });
        } else {
            this.setState({
                showWarning: true
            });
        }
        
      }

    handleOptionsChange = (option: string) => {
        this.setState({
            option: option,
            ghostAccounts: 10,
            displayNames: 
                    RichTextEditor.createEmptyValue(),
            processedDisplayNames: [],
            emailAddresses:
                    RichTextEditor.createEmptyValue(),
            processedEmailAddresses: []
        })
    }

    changeGhostAccounts =  (e : React.FormEvent<HTMLInputElement>) => {
        this.setState({
            ghostAccounts: parseInt(e.currentTarget.value)
        });
    };

    closeWarning = () => {
        this.setState({
            showWarning: false
        })
    }

    render() {
        return (
            this.state.toMonitor ? <Redirect to={`/compositions/${this.props.match.params.compositionId}/monitor`}  /> :
            <article style={{height:"95vh"}}>
            <section className="section" style={{maxHeight: "100%", overflowY: 'auto'}}>
                <div className="container">
                    <AddStudentStepper step={this.state.step} option={this.state.option}/>
                    <article className="message is-primary">
                    <div className="message-body">
                        {this.state.step === 1 && 
                        <React.Fragment>
                            <div>Choose how you want to add users.</div></React.Fragment>}
                        {this.state.step === 2 && 
                        <React.Fragment>
                            <div>Enter the full names of your students in the input box below.</div>
                        <div>Put each student on a new line.</div></React.Fragment>}
                        {this.state.step === 3 && 
                        <React.Fragment>
                            <div>Enter the email addresses of your students in the input box below.</div>
                            <div>Put each student email on a new line.</div>
                            </React.Fragment>}
                        {this.state.step === 4 && 
                        <React.Fragment>
                            <div>Go back to previous step if you see a mistake.</div>
                            <div>Download the list so you can share emails/passwords with your students.</div>
                            <div>You must save the student list to create the accounts.</div>
                            <div className="buttons is-right">
                                <CSVLink 
                                    data={this.generateCSVData()}
                                    filename="student-list.csv"
                                    className="button is-primary"
                                    onClick={() => {
                                        this.setState({
                                            hasDownloadedStudentList: true
                                        })
                                      }}>
                                        Download new accounts</CSVLink>
                            </div>
                            </React.Fragment>}
                    </div>
                    </article>
                    {this.state.step === 1 && 
                    <div className="columns">
                        <div className="column">
                    <div className="field is-inline-block-desktop">
                        <div className="field is-narrow">
                            <label className="label">
                                Add student options
                            </label>
                            <div className="control">
                            {options.map((option) => (
                                <label className="radio" key={option.name}>
                                    <input type="radio" name={option.name}
                                        checked={this.state.option===option.name}
                                        onChange={() => this.handleOptionsChange(option.name)} />
                                        <span style={{marginLeft: "5px"}}>{option.title}</span>
                                </label>
                            ))}
                            </div>
                        </div>
                    </div>
                    </div>
                    {this.state.option === 'ghost_accounts' && <div className="column is-3">
                    <div className="field">
                        <label className="label" htmlFor="ghostAccounts">Number of ghost accounts</label>
                        <div className="control">
                            <input className="input" 
                            name="ghostAccounts" type="number" 
                            onChange={this.changeGhostAccounts}
                            min={1} max={30}
                            value={this.state.ghostAccounts} />
                        </div>
                    </div>
                    </div>}
                    </div>
                    }
                    {this.state.step === 1 && 
                    <article className="message is-link">
                    <div className="message-body">
                        <React.Fragment>
                        <div>{options.find(o => o.name === this.state.option)?.helpText}</div>
                        </React.Fragment>
                    </div>
                    </article>}
                    {this.state.step === 2 && <RichTextEditor
                            value={this.state.displayNames}
                            onChange={this.handleChange}
                            toolbarConfig={{display: []}}
                            placeholder="Enter each students full name on a new line"
                        />}
                    {this.state.step === 3 && <RichTextEditor
                            value={this.state.emailAddresses}
                            onChange={this.handleEmails}
                            toolbarConfig={{display: []}}
                            placeholder="Enter each students email address on a new line"
                        />}
                    {this.state.step === 4 && 
                    <table className="table is-fullwidth is-hoverable">
                        <thead>
                        <tr>
                        <th>Full name 
                            {(this.state.option === 'emails_only' || this.state.option === 'ghost_accounts') &&
                            <FontAwesomeIcon icon="magic" style={{marginLeft: "10px"}}/>}
                        </th>
                        <th>Email address
                            {(this.state.option === 'names_only' || this.state.option === 'ghost_accounts') &&
                            <FontAwesomeIcon icon="magic" style={{marginLeft: "10px"}}/>}
                        </th>
                        <th>Password
                            <FontAwesomeIcon icon="magic" style={{marginLeft: "10px"}}/>
                        </th>
                        </tr>
                    </thead>
                    <tbody>
                    {this.state.processedEmailAddresses.map((email, index) => (
                        <tr key={index}>
                        <td>{this.state.processedDisplayNames[index]}</td>
                        <td>{email}</td>
                        <td>{this.state.passwords[index]}</td>
                        </tr>
                    ))}
                    </tbody>
                    </table>}
                    
                    <div className="level" style={{marginTop: "20px"}}>
                        <div className="level-left">
                        {this.state.step > 1 && <button className="button" onClick={this.decrementStep}>Back</button> }
                        {this.state.step === 1 && <button className="button" onClick={this.backToMonitor}>Cancel</button>}
                        </div>
                        <div className="level-right">
                        {this.state.step < 4 && <button 
                            className="button is-primary" onClick={this.incrementStep}>
                            Next step</button>}
                        {this.state.step === 4 && <button className="button is-primary" onClick={() =>this.addStudentList(false)}>
                        Save student list</button>}
                        </div>
                    </div>
                </div>
                <div className={`modal ${this.state.showWarning ? "is-active" : ""}`}>
                    <div className="modal-background"></div>
                    <div className="modal-card">
                    <header className="modal-card-head">
                        <p className="modal-card-title">Are you sure?</p>
                        <button className="delete" aria-label="close" onClick={this.closeWarning}></button>
                    </header>
                    <section className="modal-card-body">
                        <p>You have not downloaded the new accounts yet.</p> 
                        <p>You will not have access to the automatically generated passwords after this step.</p>
                    </section>
                    <footer className="modal-card-foot">
                        <button className="button is-danger" 
                        onClick={() =>this.addStudentList(true)}>
                            Proceed anyway</button>
                        <button className="button" onClick={this.closeWarning}>Cancel</button>
                    </footer>
                    </div>
                </div>
            </section>
            </article>
        )
    }
}

export default CompositionAddStudents
