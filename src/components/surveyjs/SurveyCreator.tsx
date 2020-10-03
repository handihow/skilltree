import React, { Component } from "react";
import * as SurveyKo from "survey-knockout";
import * as SurveyJSCreator from "survey-creator";
import "./ExtraSurvey.css";
import "survey-creator/survey-creator.css";
import "survey-react/modern.css";

var mainColor = "#27405f";
var mainHoverColor = "#d4823a";
var textColor = "#4a4a4a";
var headerColor = "#4a4a4a";
var headerBackgroundColor = "#4a4a4a";
var bodyContainerBackgroundColor = "#f8f8f8";

var defaultThemeColorsSurvey = SurveyKo
    .StylesManager
    .ThemeColors["default"];
defaultThemeColorsSurvey["$main-color"] = mainColor;
defaultThemeColorsSurvey["$main-hover-color"] = mainHoverColor;
defaultThemeColorsSurvey["$text-color"] = textColor;
defaultThemeColorsSurvey["$header-color"] = headerColor;
defaultThemeColorsSurvey["$header-background-color"] = headerBackgroundColor;
defaultThemeColorsSurvey["$body-container-background-color"] = bodyContainerBackgroundColor;

var defaultThemeColorsEditor = SurveyJSCreator
    .StylesManager
    .ThemeColors["default"];
defaultThemeColorsEditor["$primary-color"] = mainColor;
defaultThemeColorsEditor["$secondary-color"] = mainColor;
defaultThemeColorsEditor["$primary-hover-color"] = mainHoverColor;
defaultThemeColorsEditor["$primary-text-color"] = textColor;
defaultThemeColorsEditor["$selection-border-color"] = mainColor;

SurveyKo
    .StylesManager
    .applyTheme("modern");
SurveyJSCreator
    .StylesManager
    .applyTheme("modern");

const options = {
    showLogicTab: true,
    showJSONEditorTab: false,
    questionTypes: [
        "text",
        "checkbox",
        "radiogroup",
        "dropdown",
        "comment",
        "rating",
        "imagepicker",
        "boolean",
        "html",
        "image",
    ],
    // pageEditMode: "single",
    // showTitlesInExpressions: true,
    // allowEditExpressionsInTextEditor: false,
    // showSurveyTitle: "always", 
    haveCommercialLicense: true
};

class SurveyCreator extends Component {
  surveyCreator;
  componentDidMount() {
    this.surveyCreator = new SurveyJSCreator.SurveyCreator(
      null,
      options
    );
    this.surveyCreator.saveSurveyFunc = this.saveMySurvey;
    this.surveyCreator.showToolbox = "right";
    // Show property grid in the right container, combined with toolbox
    this.surveyCreator.showPropertyGrid = "right";
    // Make toolbox active by default
    this.surveyCreator.rightContainerActiveItem("toolbox");

    this.surveyCreator.render("surveyCreatorContainer");
  }
  render() {
    return (<div id="surveyCreatorContainer" />);
  }
  saveMySurvey = () => {
    console.log(JSON.stringify(this.surveyCreator.text));
  };
}

export default SurveyCreator;