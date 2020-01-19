import React, { Component } from 'react';
import axios from 'axios';
import { db, googleFontAPIKey } from '../../firebase/firebase';
import CompositionMenu from '../layout/CompositionMenu';
import { Redirect, Link, RouteComponentProps } from 'react-router-dom';
import { SketchPicker } from 'react-color';
import SelectFieldWithColumn from '../layout/SelectFieldWithColumn';
import CompositionDisplay from '../layout/CompositionDisplay';
import {standardSkilltree, allColors, gradients} from './StandardData';
import features from '../payments/Features';
import { toast } from 'react-toastify';

type TParams =  { compositionId: string };

interface ICompositionThemeState {
    toEditor: boolean;
    doneLoading: boolean;
    hasUnlockedAllCustomThemeOptions: boolean;
    fontFamilies?: any[];
    theme?: any;
    unsubscribe?: any;
}

const featureId = 'custom-theme-options';

export class CompositionTheme extends Component<RouteComponentProps<TParams>, ICompositionThemeState> {

    constructor(props: RouteComponentProps<TParams>){
        super(props);
        this.state = {
            toEditor: false,
            doneLoading: false,
            hasUnlockedAllCustomThemeOptions: false
        }
    }
    

    handleChange = ({ target }) => {
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
        db.collection('compositions').doc(this.props.match.params.compositionId).set({
                theme: this.state.theme
        }, {merge: true})
        .then(_ => {
            this.setState({
                toEditor: true
            });
        })
        .catch(e => {
            console.error(e);
        })
    }

    componentDidMount() {
        const currentComponent = this;
        axios.get(`https://www.googleapis.com/webfonts/v1/webfonts?key=${googleFontAPIKey}&sort=popularity&limit=50`)
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
            toast.error('Could not load Google fonts');
        })

        db.collection('compositions').doc(currentComponent.props.match.params.compositionId).get()
            .then(doc => {
                const data = doc.data();
                currentComponent.setState({
                    theme: data?.theme
                });
            })
            .catch(e => {
                toast.error(e.message);
            })
        const unsubscribe = db.collection('compositions')
            .doc(currentComponent.props.match.params.compositionId)
            .collection('payments')
            .doc(featureId)
            .onSnapshot(function(doc) {
                if(doc.exists){
                    const paymentRecord = doc.data();
                    if(paymentRecord?.success){
                        currentComponent.setState({
                            hasUnlockedAllCustomThemeOptions: true
                        })
                    }
                }
            });
        currentComponent.setState({
            unsubscribe: unsubscribe
        })
    }
    
    componentWillUnmount(){
        this.state.unsubscribe();
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
            this.state.toEditor ?
                <Redirect to={`/compositions/${this.props.match.params.compositionId}`} /> :
                this.state.doneLoading && <div className="columns">
                    <div className="column is-2">
                        <CompositionMenu id={this.props.match.params.compositionId} />
                    </div>
                    <div className="column" style={{ marginTop: "10px" }}>
                        <div className="title">Customize Appearance</div>
                        <button className="button" onClick={this.saveChanges}>Save Changes</button>
                        {!this.state.hasUnlockedAllCustomThemeOptions && 
                        <Link to={`/compositions/${this.props.match.params.compositionId}/unlock/custom-theme-options`} 
                        className="button">Unlock all options ${features[featureId].amount}</Link>}
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
                                {this.state.hasUnlockedAllCustomThemeOptions && 
                                additionalSelectOptions.map((selectOption) => (
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
                                {this.state.theme && <CompositionDisplay
                                showController={false}
                                compositionId={this.props.match.params.compositionId} 
                                theme={this.state.theme} 
                                skilltrees={[standardSkilltree]}
                                title='' />} 
                            </div>
                        </div>
                        
                        </div>
                    </div>
                    
        )
    }
}

export default CompositionTheme
