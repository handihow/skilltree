import React, { Component } from 'react';
import axios from 'axios';
import { db, googleFontAPIKey } from '../../../firebase/firebase';
import { SketchPicker } from 'react-color';
import SelectFieldWithColumn from '../../layout/SelectFieldWithColumn';
import CompositionDisplay from '../../layout/CompositionDisplay';
import {standardSkilltree, allColors, gradients} from '../../../services/StandardData';
import { toast } from 'react-toastify';
import firebase from 'firebase/app';
import IComposition from '../../../models/composition.model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Header from '../../layout/Header';

interface IThemeEditorProps {
    compositionId: string;
    doneUpdatingTheme: Function;
}

interface IThemeEditorState {
    doneLoading: boolean;
    fontFamilies?: any[];
    theme?: any;
    composition?: IComposition;
}

export class ThemeEditor extends Component<IThemeEditorProps, IThemeEditorState> {

    constructor(props: IThemeEditorProps){
        super(props);
        this.state = {
            doneLoading: false
        }
    }
    

    handleChange = ({target}) => {
        this.setState({
            theme: {
                ...this.state.theme,
                [target.name]: target.value
            }
        });
    };

    handleBackgroundColorChange = (color, event) => {
        console.log(`rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`);
        this.setState({
            theme: {
                ...this.state.theme,
                treeBackgroundColor: `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`
            }
        })
    }

    saveChanges = () => {
        db.collection('compositions').doc(this.props.compositionId).set({
                theme: this.state.theme,
                lastUpdate: firebase.firestore.Timestamp.now()
        }, {merge: true})
        .then(_ => {
            this.props.doneUpdatingTheme();
        })
        .catch(e => {
            console.error(e);
        })
    }

    componentDidMount() {
        const currentComponent = this;
        axios.get(`https://www.googleapis.com/webfonts/v1/webfonts?key=${googleFontAPIKey}&sort=popularity`)
        .then(response => {
            const fontFamilyResponse = response.data.items.map(i => {
                return {value: i.family, title: i.family}
            }).slice(0,50);
            currentComponent.setState({
                fontFamilies: fontFamilyResponse,
                doneLoading: true
            })
        })
        .catch(e => {
            toast.error('Could not load Google fonts ' + e);
        })

        db.collection('compositions').doc(currentComponent.props.compositionId).get()
            .then(doc => {
                const data = doc.data() as IComposition;
                currentComponent.setState({
                    composition: data,
                    theme: data?.theme
                });
            })
            .catch(e => {
                toast.error(e.message);
            })

    }

    render() {
        const defaultSelectOptions = [
            {
                title: "Node desktop width",
                name: "nodeDesktopTextNodeWidth",
                value: this.state.theme ? this.state.theme.nodeDesktopTextNodeWidth : '',
                options: [{value: "120px", title: "Narrow"}, {value:"144px", title: "Normal"},
                {value:"188px", title:"Wide"}, {value: "222px", title: "Very wide"}]
            },
            {
                title: "Node desktop height",
                name: "nodeDesktopTextNodeHeight",
                value: this.state.theme ? this.state.theme.nodeDesktopTextNodeHeight : '',
                options: [{value: "22px", title: "Short"}, {value:"28px", title: "Normal"},
                {value:"36px", title:"Tall"}, {value: "48px", title: "Very tall"}]
            },
            {
                title: "Node font",
                name: "primaryFont",
                value: this.state.theme ?this.state.theme.primaryFont : '',
                options: this.state.fontFamilies
            },
            {
                title: "Node font size",
                name: "nodeDesktopFontSize",
                value: this.state.theme ? this.state.theme.nodeDesktopFontSize : '',
                options: [{value: "12px", title: "Small"}, {value:"16px", title: "Normal"},
                {value:"24px", title:"Big"}, {value: "32px", title: "Huge"}]
            }
        ];


        const additionalSelectOptions = [
            {
                title: "Node font color",
                name: "primaryFontColor",
                value: this.state.theme ? this.state.theme.primaryFontColor : '',
                options: allColors
            },
            {
                title: "Node border color",
                name: "nodeBorderColor",
                value: this.state.theme ? this.state.theme.nodeBorderColor : '',
                options: allColors
            },
            {
                title: "Node active gradient",
                name: "nodeActiveBackgroundColor",
                value: this.state.theme ? this.state.theme.nodeActiveBackgroundColor : '',
                options: gradients
            },
            {
                title: "Node hover border gradient",
                name: "nodeHoverBorderColor",
                value: this.state.theme ? this.state.theme.nodeHoverBorderColor : '',
                options: gradients
            },
            {
                title: "Node mobile width",
                name: "nodeMobileTextNodeWidth",
                value: this.state.theme ? this.state.theme.nodeMobileTextNodeWidth : '',
                options: [{value: "92px", title: "Narrow"}, {value:"108px", title: "Normal"},
                {value:"144px", title:"Wide"}, {value: "188px", title: "Very wide"}]
            },
            {
                title: "Node mobile height",
                name: "nodeMobileTextNodeHeight",
                value: this.state.theme ? this.state.theme.nodeMobileTextNodeHeight : '',
                options: [{value: "24px", title: "Short"}, {value:"32px", title: "Normal"},
                {value:"38px", title:"Tall"}, {value: "52px", title: "Very tall"}]
            },
            {
                title: "Node mobile font size",
                name: "nodeMobileFontSize",
                value: this.state.theme ? this.state.theme.nodeMobileFontSize : '',
                options: [{value: "10px", title: "Small"}, {value:"14px", title: "Normal"},
                {value:"18px", title:"Big"}, {value: "24px", title: "Huge"}]
            },
            {
                title: "Heading font",
                name: "headingFont",
                value: this.state.theme ? this.state.theme.headingFont : '',
                options: this.state.fontFamilies
            },
            {
                title: "Heading font size",
                name: "headingFontSize",
                value: this.state.theme ? this.state.theme.headingFontSize : '',
                options: [{value: "16px", title: "Small"}, {value:"24px", title: "Normal"},
                {value:"32px", title:"Big"}, {value: "48px", title: "Huge"}]
            },
            {
                title: "Heading font color",
                name: "headingFontColor",
                value: this.state.theme ? this.state.theme.headingFontColor : '',
                options: allColors
            }
        ];
        
        return (
                this.state.doneLoading && 
                <div className="p-5 has-background-white">
                <div className="level is-mobile">
                    <div className="level-left">
                        <Header header='Theme editor' icon="sliders-h"></Header>
                    </div>
                    <div className="level-right">
                        <div className="level-item">
                            <button className="button is-medium is-primary is-outlined is-rounded" 
                            onClick={this.saveChanges} data-tooltip="Save Changes">
                                <FontAwesomeIcon icon='save' />
                            </button>
                        </div>
                    </div>
                </div>
                <hr></hr>
                <div className="columns">
                    <div className="column">
                        <div className="columns is-multiline">
                        {defaultSelectOptions.map((selectOption) => (
                            <SelectFieldWithColumn
                            key={selectOption.name}
                            title={selectOption.title}
                            name={selectOption.name}
                            value={selectOption.value}
                            onChange={this.handleChange}
                            options={selectOption.options || []}/>
                        ))}
                        {additionalSelectOptions.map((selectOption) => (
                            <SelectFieldWithColumn
                            key={selectOption.name}
                            title={selectOption.title}
                            name={selectOption.name}
                            value={selectOption.value}
                            onChange={this.handleChange}
                            options={selectOption.options || []}/>
                        ))}
                        <div className="column">
                            <div className="field">
                                <label className="label">Tree background</label>
                                <div className="control">
                                    <SketchPicker
                                        color={ this.state.theme ? this.state.theme.treeBackgroundColor : '' }
                                        onChangeComplete={ this.handleBackgroundColorChange }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                    <div className="column is-narrow">
                        {this.state.theme && this.state.composition && <CompositionDisplay
                        showController={false}
                        composition={this.state.composition} 
                        theme={this.state.theme} 
                        skilltrees={[standardSkilltree]}
                        title='' />} 
                    </div>
                </div>
            </div>         
        )
    }
}

export default ThemeEditor
