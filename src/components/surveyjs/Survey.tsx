import React from "react";

import * as Survey from "survey-react";

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

Survey.StylesManager.applyTheme("modern");

Survey
    .Serializer.addProperty("question", {
      name: "score:number",
    })
Survey
    .Serializer.addProperty("itemvalue", {
      name: "score:number",
    });

export function SurveyPage(props) {
    const model = new Survey.Model(props.json);
    return (
        <section className="section">
        <div className="container">
        <Survey.Survey
            model={model}
            onComplete={props.onComplete}
            onValueChanged={props.onValueChanged}
          />
        </div>
        </section>
    );
  }