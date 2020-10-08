import React, { Component } from 'react'
import Header from '../layout/Header';
import { db } from '../../firebase/firebase';
import IQuiz from '../../models/quiz.model';
import IAnswer from '../../models/answer.model';
import { connect } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { RouteComponentProps } from 'react-router-dom';
import Loading from '../layout/Loading';
import SurveyPage from "../surveyjs/Survey";

type TParams =  { quizId: string };

interface IQuizResultsProps extends RouteComponentProps<TParams> {
  isAuthenticated: boolean;
  user: any
}

interface IQuizResultsState {
  quiz: IQuiz | undefined;
  answers: IAnswer[];
  activeTab: string;
  doneLoading: boolean;
  activeAnswerIndex: number;
}


class QuizResults extends Component<IQuizResultsProps, IQuizResultsState> {
    constructor(props: IQuizResultsProps){
        super(props)
        this.state = {
          quiz: undefined,
          answers: [],
          activeTab: 'individual',
          doneLoading: false,
          activeAnswerIndex: 0
        }
      }

    componentDidMount() {
      const quizId = this.props.match.params.quizId;
        db.collection("quizzes").doc(quizId).get()
        .then(doc => {
            const quiz = doc.data() as IQuiz;
            this.setState({quiz});
            db.collection("answers").where("quiz", "==", quizId).get()
            .then(docs => {
            	if(!docs.empty){
            		const answers : IAnswer[] = [];
            		docs.forEach(doc => {
            			const answer = doc.data() as IAnswer;
            			answers.push(answer);
            		});
            		this.setState({
            			answers: answers,
            			doneLoading: true
            		});
            	} else {
            		this.setState({
            			doneLoading: true
            		})
            	}
            })
        });
    } 
    changeActiveTab = (tab: string) => {
	    this.setState({
	        activeTab: tab
	    });
	  }
	changeActiveAnswerIndex = (change: number) => {
		if(this.state.activeAnswerIndex === 0 && change === -1){
			return;
		} else if(this.state.activeAnswerIndex === this.state.answers.length - 1 && change === 1){
			return;
		} else {
			this.setState({
				activeAnswerIndex: this.state.activeAnswerIndex + change
			});
		}
	}
    render() {
        const header = "Quiz Results"
        
          return (
          	this.state.doneLoading ?
            <section className="section has-background-white-ter" style={{minHeight: "100vh"}}>
            <div className="container">
              <div className="level is-mobile">
                <div className="level-left">
                <Header header={header} icon='poll-h'/>
                
                </div>
                
              </div>
              <div className="tabs">
	          <ul>
	              <li className={this.state.activeTab ==='individual' ? "is-active" : undefined}>
	                  <a href="# " onClick={() => this.changeActiveTab('individual')}>Individual records</a>
	              </li>
	              <li className={this.state.activeTab ==='charts' ? "is-active" : undefined}>
	                  <a href="# " onClick={() => this.changeActiveTab('charts')}>Overview charts</a>
	              </li>
	          </ul>
	          </div>
	          {this.state.answers.length === 0 && 
	          	<article className="message is-primary">
		            <div className="message-header">No answers yet.. </div>
		        <div className="message-body">
		            <div className="content">
		                <p>Answers will appear here once people have submitted the quiz.</p>
		            </div>
		        </div>
		        </article>}
		       {this.state.activeTab === 'individual' && this.state.answers.length > 0  && 
		   		<article>
		   			<div className="buttons has-addons is-centered">
					  <button className="button" onClick={() => this.changeActiveAnswerIndex(-1)}><span className="icon">
		                <FontAwesomeIcon icon='backward' />
		              </span></button>
					  <button className="button is-info">
					  	{this.state.activeAnswerIndex + 1} / {this.state.answers.length}
					  </button>
					  <button className="button" onClick={() => this.changeActiveAnswerIndex(1)}><span className="icon">
		                <FontAwesomeIcon icon='forward' />
		              </span></button>
  					</div>
  					<div className="has-text-centered">
						<h4 className="title is-4 has-text-primary">
			              <span className="icon">
			                <FontAwesomeIcon icon='user' />
			              </span>
			              <span className="ml-5">{this.state.answers[this.state.activeAnswerIndex].displayName}</span>
			            </h4>
			            <h6 className="subtitle is-6">{this.state.answers[this.state.activeAnswerIndex].username}</h6>
		            </div>
  					<SurveyPage 
  			            json={this.state.quiz?.data} 
  			            data={this.state.answers[this.state.activeAnswerIndex].data}
  			            viewmode={true} /> 
  		   		</article>}

            </div> 
            </section>
            : <Loading />    
          );
        }
      
} 

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user
  };
}

export default connect(mapStateToProps)(QuizResults);
