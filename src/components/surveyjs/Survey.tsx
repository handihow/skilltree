import React, { Component } from "react";

import * as Survey from "survey-react";
import Loading from '../layout/Loading';
import { storage } from '../../firebase/firebase';
import {v4 as uuid} from "uuid"; 

import "./BeforeSurvey.css";
import "survey-react/modern.css";
import "./AfterSurvey.css";

const mainColor = "#27405f";
const mainHoverColor = "#d4823a";
const textColor = "#4a4a4a";
const headerColor = "#4a4a4a";
const headerBackgroundColor = "#4a4a4a";
var bodyContainerBackgroundColor = "#f8f8f8";

const defaultThemeColorsSurvey = Survey
    .StylesManager
    .ThemeColors["default"];
defaultThemeColorsSurvey["$main-color"] = mainColor;
defaultThemeColorsSurvey["$main-hover-color"] = mainHoverColor;
defaultThemeColorsSurvey["$text-color"] = textColor;
defaultThemeColorsSurvey["$header-color"] = headerColor;
defaultThemeColorsSurvey["$header-background-color"] = headerBackgroundColor;
defaultThemeColorsSurvey["$body-container-background-color"] = bodyContainerBackgroundColor;
Survey.JsonObject.metaData.findProperty("file", "storeDataAsText").defaultValue = false;
Survey.StylesManager.applyTheme("modern");

interface ISurveyProps {
    json: any,
    data: any,
    onValueChanged?: Function,
    onComplete?: Function,
    onFinishPreview?: Function,
    isQuizOwner?: boolean
    viewmode?: boolean;
    providingFeedback: boolean;
}

interface ISurveyState {
    doneLoading?: boolean;
    customCss?: any;
}

class SurveyPage extends Component<ISurveyProps, ISurveyState> {
    constructor(props: ISurveyProps){
        super(props);
        this.state = {
            doneLoading: false,
            customCss: undefined
        }
    }

    model;
    componentDidMount() {
        this.model = new Survey.Model(this.props.json);
        this.model.onUploadFiles.add(async function(survey, options) {
            const urls : string[] = [];
            for (let i = 0; i < options.files.length; ++i) {
                const extension = options.files[i].name.split('.').pop();
                const filename = uuid() + '.' + extension;
                const storageRef = storage.ref().child('@uploads/'+filename);
                await storageRef.put(options.files[i])
                .then(_ => {
                      return storageRef.getDownloadURL()
                      .then((url:string) => {
                            urls.push(url);
                      })
                });
            }
            options.callback("success", options.files.map((f,i) => {
                return {
                    file: f,
                    content: urls[i]
                }
            }));  
        });
        if(this.props.data){
            this.model.data = this.props.data;
        }
        if(this.props.viewmode){
            this.model.mode = 'display';
            this.model
            .onAfterRenderQuestion
            .add(function (survey, options) {
                if(options.question.correctAnswer){
                    try{
                        const header = options.htmlElement.getElementsByClassName("sv-question__header")[0];
                        const div = document.createElement("div");
                        const isCorrect = options.question.isAnswerCorrect();
                        div.innerHTML = isCorrect ? "Correct" : "Incorrect";
                        div.className = isCorrect ? "has-background-success has-text-white has-text-centered" : "has-background-danger has-text-white has-text-centered";
                        // // header.classList.add("has-background-success")
                        header.appendChild(div);

                    } catch(e){
                        console.log(e)
                    }

                    
                }
            });
        }
        if(this.props.providingFeedback){
            this.setState({
                customCss: {
                    "navigation": {
                        "complete": "is-hidden"
                    }
                }
            })
        }
        this.setState({
            doneLoading: true
        });
    }

    render() {
          return (
                this.state.doneLoading ?
                <React.Fragment>
                {this.props.isQuizOwner && <article className="message is-info">
                  <div className="message-header">
                    Preview your quiz
                    <button className="delete" onClick={() => this.props.onFinishPreview ?
                         this.props.onFinishPreview() : () => {}}></button>
                  </div>
                  <div className="message-body">
                    Close or complete the quiz to finish previewing and return to the quiz builder. Your answers will be stored.
                  </div>
                </article>}
                <Survey.Survey
                    model={this.model}
                    onComplete={this.props.onComplete}
                    onValueChanged={this.props.onValueChanged}
                    css={this.state.customCss}
                  /> 
                  </React.Fragment> :
                <Loading />
      );
    }
  }

  export default SurveyPage;
