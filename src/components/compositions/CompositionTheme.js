import React, { Component } from 'react';
import { db, storage, googleFontAPIKey } from '../../firebase/firebase';
import CompositionMenu from '../layout/CompositionMenu';
import { Redirect } from 'react-router-dom';
import FontPicker from "font-picker-react";
import './CompositionStyles.css';
import { SketchPicker } from 'react-color';

export class CompositionTheme extends Component {

    state = {
        compositionId: this.props.match.params.compositionId,
        toEditor: false,
        primaryFont: '',
        nodeDesktopTextNodeWidth: '',
        nodeDesktopTextNodeHeight: '',
        nodeDesktopFontSize: '',
        treeBackgroundColor: ''
    }

    handleChange = ({ target }) => {
        this.setState({
            [target.name]: target.value
        });
    };

    handleBackgroundColorChange = (color, event) => {
        console.log(`rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`);
        this.setState({
            treeBackgroundColor: `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`
        })
    }

    saveChanges = () => {
        db.collection('compositions').doc(this.state.compositionId).set({
                theme: {
                    primaryFont : this.state.primaryFont,
                    nodeDesktopTextNodeWidth : this.state.nodeDesktopTextNodeWidth,
                    nodeDesktopTextNodeHeight: this.state.nodeDesktopTextNodeHeight,
                    nodeDesktopFontSize: this.state.nodeDesktopFontSize,
                    treeBackgroundColor: this.state.treeBackgroundColor
                }
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
        db.collection('compositions').doc(this.state.compositionId).get()
            .then(doc => {
                const data = doc.data();
                this.setState({
                    primaryFont: data.theme.primaryFont,
                    nodeDesktopTextNodeWidth: data.theme.nodeDesktopTextNodeWidth,
                    nodeDesktopTextNodeHeight: data.theme.nodeDesktopTextNodeHeight,
                    nodeDesktopFontSize: data.theme.nodeDesktopFontSize,
                    treeBackgroundColor: data.theme.treeBackgroundColor
                });
            })
            .catch(e => {
                console.error(e)
            })
    }

    render() {
        return (
            this.state.toEditor ?
                <Redirect to={`/compositions/${this.state.compositionId}`} /> :
                <div className="columns">
                    <div className="column is-one-fifth">
                        <CompositionMenu id={this.state.compositionId} />
                    </div>
                    <div className="column">
                        <div className="container" style={{ marginTop: "10px" }}>
                            <div className="title">Customize Appearance</div>
                            <button className="button" onClick={this.saveChanges}>Save Changes</button>
                            <hr></hr>
                            <div className="columns is-multiline">
                                <div className="column">
                                    <div className="field">
                                        <label className="label">Node width</label>
                                        <div className="control">
                                            <div className="select is-primary">
                                                <select name="nodeDesktopTextNodeWidth"
                                                    value={this.state.nodeDesktopTextNodeWidth}
                                                    onChange={this.handleChange}>
                                                    <option value="120px">Narrow</option>
                                                    <option value="144px">Normal</option>
                                                    <option value="188px">Wide</option>
                                                    <option value="222px">Very wide</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="column">
                                    <div className="field">
                                        <label className="label">Node height</label>
                                        <div className="control">
                                            <div className="select is-primary">
                                                <select name="nodeDesktopTextNodeHeight"
                                                    value={this.state.nodeDesktopTextNodeHeight}
                                                    onChange={this.handleChange}>
                                                    <option value="22px">Short</option>
                                                    <option value="28px">Normal</option>
                                                    <option value="36px">Tall</option>
                                                    <option value="48px">Very tall</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="column">
                                    <div className="field">
                                        <label className="label">Node Font</label>
                                        <div className="control">
                                            <FontPicker
                                                apiKey={googleFontAPIKey}
                                                activeFontFamily={this.state.primaryFont}
                                                onChange={nextFont =>
                                                    this.setState({
                                                        primaryFont: nextFont.family
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="column">
                                    <div className="field">
                                        <label className="label">Node Font size</label>
                                        <div className="control">
                                            <div className="select is-primary">
                                                <select name="nodeDesktopFontSize"
                                                    value={this.state.nodeDesktopFontSize}
                                                    onChange={this.handleChange}>
                                                    <option value="12px">Small</option>
                                                    <option value="16px">Normal</option>
                                                    <option value="24px">Big</option>
                                                    <option value="32px">Huge</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="column">
                                    <div className="field">
                                        <label className="label">Tree background</label>
                                        <div className="control">
                                            <SketchPicker
                                                color={ this.state.treeBackgroundColor }
                                                onChangeComplete={ this.handleBackgroundColorChange }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        )
    }
}

export default CompositionTheme
