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
    onValueChanged: Function,
    onComplete: Function
}

interface ISurveyState {
    doneLoading?: boolean;
}

class SurveyPage extends Component<ISurveyProps, ISurveyState> {
    constructor(props: ISurveyProps){
        super(props);
        this.state = {
            doneLoading: false
        }
    }

    model;
    componentDidMount() {
        if(!this.props.json){
            this.setState({
                doneLoading: false
            });
            return;
        }
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
            console.log(urls);
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
        this.setState({
            doneLoading: true
        });
    }

    render() {
          return (
                this.state.doneLoading ?
                <section className="section">
                <div className="container">
                <Survey.Survey
                    model={this.model}
                    onComplete={this.props.onComplete}
                    onValueChanged={this.props.onValueChanged}
                  />
                </div>
                </section> :
                <Loading />
      );
    }
  }

  export default SurveyPage;
