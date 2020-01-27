import React, { Component } from 'react'
import AddStudentStepper from '../layout/AddStudentsStepper';
import RichTextEditor from 'react-rte';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import {isEmail} from 'validator';
import uuid from 'uuid';
import { toast } from 'react-toastify';
import { functions } from '../../firebase/firebase';

type TParams =  { compositionId: string };

interface IStudentFormStep1 {
    toMonitor: boolean;
    step: number;
    displayNames: any;
    processedDisplayNames: string[];
    emailAddresses: any;
    processedEmailAddresses: string[];
}

export class CompositionAddStudents extends Component<RouteComponentProps<TParams>, IStudentFormStep1> {
    constructor(props: RouteComponentProps<TParams>){
        super(props);
        this.state = {
            toMonitor: false,
            step: 1,
            displayNames: 
                    RichTextEditor.createEmptyValue(),
            processedDisplayNames: [],
            emailAddresses:
                    RichTextEditor.createEmptyValue(),
            processedEmailAddresses: []
        };
    }

    backToMonitor = () => {
        this.setState({
            toMonitor: true
        })
    }

    handleChange = (value) => {
        var div = document.createElement("div");
        div.innerHTML = value.toString('html');
        var nodes = div.getElementsByTagName("p");
        var array : string[] = [];
        for(var i=0; i<nodes.length; i++) { 
            if(nodes[i].innerHTML !== '<br>') { array.push(nodes[i].innerHTML) }; 
        }
        this.setState({
            displayNames: value,
            processedDisplayNames: array
        })
    }

    handleEmails = (value) => {
        var div = document.createElement("div");
        div.innerHTML = value.toString('html');
        var nodes = div.getElementsByTagName("p");
        var array : string[] = [];
        for(var i=0; i<nodes.length; i++) { 
            if(nodes[i].innerHTML !== '<br>' && isEmail(nodes[i].innerHTML)) { array.push(nodes[i].innerHTML) }; 
        }
        this.setState({
            emailAddresses: value,
            processedEmailAddresses: array
        })
    }

    incrementStep = () => {
        this.setState({
            step: this.state.step + 1
        })
    }

    decrementStep = () => {
        this.setState({
            step: this.state.step - 1
        })
    }

    addStudentList = () => {
        const currentComponent = this;
        const toastId = uuid.v4();
        toast.info('Adding student list in progress... please wait', {
          toastId: toastId,
          autoClose: 30000
        });
        const addStudentList = functions.httpsCallable('addStudentList');
        addStudentList({
            displayNames: this.state.processedDisplayNames,
            emailAddresses: this.state.processedEmailAddresses,
            compositionId: this.props.match.params.compositionId
        })
        .then(function(result) {
          if(result.data.error){
              toast.update(toastId, {
                render: result.data.error
              });
          } else {
            toast.update(toastId, {
              render: 'Student list added'
            });
            currentComponent.setState({
                toMonitor: true
            })
          }
        })
        .catch(function(error) {
          toast.update(toastId, {
            render: error.message,
            type: toast.TYPE.ERROR
          });
        });
      }

    render() {
        const nextButtonText = this.state.step === 1 ? 'Step 2 - Add email addresses' : 'Step 3 - Verify student list';
        const nextButtonDisabled =  this.state.step === 1 && this.state.processedDisplayNames.length===0 ? true :
                                    this.state.step === 2 
                                    && this.state.processedEmailAddresses.length !== this.state.processedDisplayNames.length 
                                    ? true : false;
        return (
            this.state.toMonitor ? <Redirect to={`/compositions/${this.props.match.params.compositionId}/monitor`}  /> :
            <section className="section">
                <div className="container">
                    <AddStudentStepper step={this.state.step}/>
                    <article className="message is-primary">
                    <div className="message-body">
                        {this.state.step === 1 && 
                        <React.Fragment>
                            <div>Enter the full names of your students in the input box below.</div>
                        <div>Put each student on a new line.</div></React.Fragment>}
                        {this.state.step === 2 && 
                        <React.Fragment>
                            <div>Enter the email addresses of your students in the input box below.</div>
                            <div>Put each student email on a new line.</div>
                            <div>Next button is enabled when number of valid email address equals the number of student names.
                                </div></React.Fragment>}
                        {this.state.step === 3 && 
                        <React.Fragment>
                            <div>Verify the list below.</div>
                            <div>Go back to previous step if names do not match the email address or you see another mistake.</div>
                            </React.Fragment>}
                        
                    </div>
                    </article>
                    {this.state.step === 1 && <RichTextEditor
                            value={this.state.displayNames}
                            onChange={this.handleChange}
                            toolbarConfig={{display: []}}
                            placeholder="Enter each students full name on a new line"
                        />}
                    {this.state.step === 2 && <RichTextEditor
                            value={this.state.emailAddresses}
                            onChange={this.handleEmails}
                            toolbarConfig={{display: []}}
                            placeholder="Enter each students email address on a new line"
                        />}
                    {this.state.step === 3 && 
                    <table className="table is-fullwidth is-hoverable">
                        <thead>
                        <tr>
                        <th>Position</th>
                        <th>Full name</th>
                        <th>Email address</th>
                        </tr>
                    </thead>
                    <tbody>
                    {this.state.processedEmailAddresses.map((email, index) => (
                        <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{this.state.processedDisplayNames[index]}</td>
                        <td>{email}</td>
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
                        {this.state.step < 3 && <button 
                            className="button is-primary" onClick={this.incrementStep}
                            disabled={nextButtonDisabled}>
                            {nextButtonText}</button>}
                        {this.state.step === 3 && <button className="button is-primary" onClick={this.addStudentList}>
                        Save student list</button>}
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default CompositionAddStudents
