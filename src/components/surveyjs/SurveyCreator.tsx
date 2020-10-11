import React, { Component } from "react";

import * as SurveyKo from "survey-knockout";
import * as SurveyJSCreator from "survey-creator";
import "./BeforeSurvey.css";
import "survey-react/modern.css";
import "survey-creator/survey-creator.css";
import "./AfterSurvey.css";
import {v4 as uuid} from "uuid"; 
import IQuiz from '../../models/quiz.model';
import Loading from '../layout/Loading';
import { db, storage } from '../../firebase/firebase';
import { toast } from 'react-toastify';

const mainColor = "#27405f";
const mainHoverColor = "#d4823a";
const textColor = "#4a4a4a";
const headerColor = "#4a4a4a";
const headerBackgroundColor = "#4a4a4a";
var bodyContainerBackgroundColor = "#f8f8f8";

const defaultThemeColorsSurvey = SurveyKo
    .StylesManager
    .ThemeColors["default"];
defaultThemeColorsSurvey["$main-color"] = mainColor;
defaultThemeColorsSurvey["$main-hover-color"] = mainHoverColor;
defaultThemeColorsSurvey["$text-color"] = textColor;
defaultThemeColorsSurvey["$header-color"] = headerColor;
defaultThemeColorsSurvey["$header-background-color"] = headerBackgroundColor;
defaultThemeColorsSurvey["$body-container-background-color"] = bodyContainerBackgroundColor;

const defaultThemeColorsEditor = SurveyJSCreator
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
    showLogicTab: false,
    showJSONEditorTab: false,
    showTestSurveyTab: false,
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
        "file"
    ],
    pageEditMode: "single",
    // showTitlesInExpressions: true,
    // allowEditExpressionsInTextEditor: false,
    // showSurveyTitle: "always", 
    haveCommercialLicense: true,
    isAutoSave: true
};

// Hide some properties of the itemvalue object
// Design itemvalue[] property editor
// Hide visbileIf, enableIf and text properties
SurveyKo
    .Serializer
    .findProperty("itemvalue", "visibleIf")
    .visible = false;
SurveyKo
    .Serializer
    .findProperty("itemvalue", "enableIf")
    .visible = false;
SurveyKo
    .Serializer
    .findProperty("itemvalue", "text")
    .visible = false;
// Make the detail editor for itemvalue invisible, hide Edit button
SurveyJSCreator
    .SurveyQuestionEditorDefinition
    .definition["itemvalue[]@choices"]
    .tabs = [
        {
            name: "general",
            visible: false
        }
    ];

SurveyJSCreator.SurveyQuestionEditorDefinition.definition = {}

//Define visibleIndex for properties we want to show and set attribute that marks we want to show this property
let maxVisibleIndex = 0;
function showTheProperty(className, propertyName, visibleIndex?) {
    if (!visibleIndex) 
        visibleIndex = ++maxVisibleIndex;
    else {
        if (visibleIndex > maxVisibleIndex) 
            maxVisibleIndex = visibleIndex;
        }
    //Use Survey Serializer to find the property, it looks for property in the class and all it's parents
    var property = SurveyKo
        .Serializer
        .findProperty(className, propertyName)
    if (!property) {
        console.log(propertyName + ' not found for ' + className );
        return;
    }
    property.visibleIndex = visibleIndex;
    //Custom JavaScript attribute that we will use in onShowingProperty event
    property.showProperty = true;
}

showTheProperty("question", "name");
showTheProperty("question", "title");
showTheProperty("question", "description");
showTheProperty("question", "visible");
showTheProperty("question", "isRequired");
showTheProperty("checkbox", "choices");
showTheProperty("checkbox", "hasOther");
showTheProperty("checkbox", "hasSelectAll");
showTheProperty("checkbox", "hasNone");
showTheProperty("imagepicker", "choices");
showTheProperty("imagepicker", "hasOther");
showTheProperty("radiogroup", "choices");
showTheProperty("radiogroup", "hasOther");
showTheProperty("dropdown", "choices");
showTheProperty("dropdown", "hasOther");
showTheProperty("dropdown", "hasSelectAll");
showTheProperty("text", "inputType");
showTheProperty("comment", "placeHolder");
showTheProperty("comment", "rows");
showTheProperty("image", "imageLink");
showTheProperty("image", "imageWidth");
showTheProperty("image", "imageHeight");
showTheProperty("html", "html");
showTheProperty("question", "correctAnswer");
showTheProperty("file", "allowMultiple");

interface ISurveyCreatorProps {
    quiz: IQuiz | undefined;
    dotest: Function;
    goback: Function;
    builder: string;
    userId: string;
}


class SurveyCreator extends Component<ISurveyCreatorProps> {
  
  surveyCreator;
  componentDidUpdate() {
    if(!this.props.quiz){
        return
    }
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
    //Use it to show properties that has our showProperty custom attribute equals to true
    this.surveyCreator
    .onShowingProperty
    .add(function (sender, options) {
        options.canShow = options.property.showProperty === true;
    });
    // Remove toolbar items except undo/redo buttons
    this.surveyCreator
        .toolbarItems
        .splice(2, 5);
    // Set custom designer placeholder
    this.surveyCreator.placeholderHtml = '<div style="position: absolute; top: 30%; left: 50%; transform: translate(-50%, -50%); text-align: center;"><img style="height: 250px; width: 250px" src="https://cdn.pixabay.com/photo/2018/11/13/21/44/instagram-3814061_1280.png" /><div style="font-size: 16px; max-width: 210px;">Drag and drop a question to start designing your quiz</div></div>';
    // Adorners for item inplace editing edit itemvalue.value and not itemvalue.text
    this.surveyCreator.inplaceEditForValues = true;
    // Hide Fast Entry option for ItemValue[] editor
    this.surveyCreator
        .onSetPropertyEditorOptions
        .add(function (sender, options) {
            options.editorOptions.showTextView = false;
        });
    if(this.props.builder === 'quiz'){
        this.surveyCreator
            .toolbarItems
            .push({
                id: "do-test",
                visible: true,
                title: "Preview Quiz",
                action: this.props.dotest
            });
    } else if(this.props.builder === 'feedback'){
        this.surveyCreator
            .toolbarItems
            .push({
                id: "do-test",
                visible: true,
                title: "Set as default",
                action: this.setDefault
            });
    }
    this.surveyCreator
            .toolbarItems
            .push({
                id: "go-back",
                visible: true,
                title: "Back",
                action: this.props.goback
            });
    
    this.surveyCreator.saveSurveyFunc =this.saveMySurvey;

    this.surveyCreator.onModified.add(function(sender, options){
        if(options.name === 'imageLink' 
            && options.newValue !== options.oldValue
            && !options.newValue.includes('https://')){
            
            let extension : string = '';
            // do something like this
            var lowerCase = options.newValue.toLowerCase();
            if (lowerCase.indexOf("png") !== -1) extension = "png"
            else if (lowerCase.indexOf("jpg") !== -1 || lowerCase.indexOf("jpeg") !== -1)
                extension = "jpg"
            else extension = "tiff";
            const filename = uuid() + '.' + extension;
            const storageRef = storage.ref().child('@uploads/'+filename);
            const indexOfComma = options.newValue.indexOf(',') + 1;
            const base64String = options.newValue.substring(indexOfComma);
            storageRef
              .putString(base64String, 'base64')
              .then(_ => {
                  storageRef.getDownloadURL().then(url => {
                        console.log(url);
                        options.target.imageLink = url;
                    })
              });
        }
    })

    this.surveyCreator.render("surveyCreatorContainer");

    if(this.props.quiz.data && this.props.builder === 'quiz'){
        this.surveyCreator.text = this.props.quiz.data;
    } else if(this.props.quiz.feedback && this.props.builder === 'feedback'){
        this.surveyCreator.text = this.props.quiz.feedback;
    }
  }
  setDefault = () => {
      db.collection("users").doc(this.props.userId).update({
          standardFeedback: this.surveyCreator.text
      }).then(_ => {
          toast('Successfully set the current feedback form to your default feedback')
      })
  }
  render() {
    return (
        this.props.quiz ? 
        <div id="surveyCreatorContainer" />
        : <Loading />
        );
  }
  saveMySurvey = () => {
      if(!this.props.quiz){
          return
      } else if(this.props.builder === 'quiz'){
          db.collection("quizzes").doc(this.props.quiz.id).update({data: this.surveyCreator.text})
      } else if(this.props.builder === 'feedback'){
          db.collection("quizzes").doc(this.props.quiz.id).update({feedback: this.surveyCreator.text})
      }
  }
}

export default SurveyCreator;

