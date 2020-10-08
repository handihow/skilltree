import React, { Component } from "react";
import { VisualizationPanel, SelectBasePlotly, VisualizationManager, WordCloud } from "survey-analytics";
import "survey-analytics/survey.analytics.css";
import * as Survey from "survey-react";
import "./AfterSurvey.css";

interface ISurveyAnalyticsProps {
    json: any,
    data: any
}

SelectBasePlotly.types = ["bar"];
VisualizationManager.unregisterVisualizerForAll(WordCloud);

export default class SurveyAnalytics extends Component<ISurveyAnalyticsProps> {
  visPanel;
  componentDidMount() {
    const survey = new Survey.SurveyModel(this.props.json);
    // survey.SelectBasePlotly.types = ["bar"];
    // survey.VisualizationManager.unregisterVisualizerForAll(survey.WordCloud);
    this.visPanel = new VisualizationPanel(
    	survey.getAllQuestions(), 
    	this.props.data, 
    	{
    		allowDynamicLayout: false, 
    		labelTruncateLength:60, 
    		haveCommercialLicense: true, 
    		answersOrder: "desc",
    		allowHideQuestions: false
    	});
    this.visPanel.showHeader = false;
    this.visPanel.render(document.getElementById("summaryContainer"));
    const questionElements = document.getElementsByClassName("sa-question");
    for(let i = 0, all = questionElements.length; i < all; i++){   
         questionElements[i].classList.add('box');
         questionElements[i].classList.add('has-background-link');
     }
  }
  render() {
    return <div id="summaryContainer"></div>;
  }
}