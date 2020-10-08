import React, { Component } from "react";
import { Tabulator } from "survey-analytics/survey.analytics.tabulator.js";
import * as Survey from "survey-react";
import "survey-analytics/survey.analytics.tabulator.css";
import "tabulator-tables/dist/css/tabulator.min.css";

interface ISurveyTabulatorProps {
    json: any,
    data: any
}

export default class SurveyAnalyticsTabulator extends Component<ISurveyTabulatorProps>  {
  visPanel;
  componentDidMount() {
    const survey = new Survey.SurveyModel(this.props.json);
    const page = survey.currentPage;
    const displayQuestion = page.addNewQuestion('text', 'displayName',0);
    displayQuestion.title = 'Name';
    this.visPanel = new Tabulator(survey, this.props.data, 
    	{
    		allowDynamicLayout: false, 
    		haveCommercialLicense: true,
    		showEntries: 25
    	});
    this.visPanel.render(document.getElementById("summaryContainer"));
  }
  render() {
    return <div id="summaryContainer"></div>;
  }
}