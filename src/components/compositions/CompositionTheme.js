import React, { Component } from 'react';
import { db, storage, googleFontAPIKey } from '../../firebase/firebase';
import CompositionMenu from '../layout/CompositionMenu';
import { Redirect } from 'react-router-dom';
import FontPicker from "font-picker-react";
import './CompositionStyles.css';

export class CompositionTheme extends Component {
    
    state = {
        compositionId: this.props.match.params.compositionId,
        toEditor: false,
        activeFontFamily: "Nunito"
    }
    
    render() {
        return (
            this.state.toEditor ? 
            <Redirect to={`/compositions/${this.state.compositionId}`}/> :
            <div className="columns">
                <div className="column is-one-fifth">
                    <CompositionMenu id={this.state.compositionId} />
                </div>
                <div className="column">
                    <div className="container" style={{marginTop: "10px"}}>
                        <div className="title">Customize Appearance</div>
                        <form className="columns is-multiline">
                        <div className="column">
                            <div className="field">
                            <label className="label">Box width</label>
                            <div className="control">
                                <div className="select is-primary">
                                <select>
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
                            <label className="label">Box height</label>
                            <div className="control">
                                <div className="select is-primary">
                                <select>
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
                            <label className="label">Font</label>
                            <div className="control">
                                <FontPicker
                                    apiKey={googleFontAPIKey}
                                    activeFontFamily={this.state.activeFontFamily}
                                    onChange={nextFont =>
                                        this.setState({
                                            activeFontFamily: nextFont.family,
                                        })
                                    }
                                />
                                </div>
                            </div>
                        </div>
                        <div className="column">
                            <div className="field">
                            <label className="label">Font size</label>
                            <div className="control">
                                <div className="select is-primary">
                                <select>
                                    <option value="12px">Small</option>
                                    <option value="16px">Normal</option>
                                    <option value="24px">Big</option>
                                    <option value="32px">Huge</option>
                                </select>
                                </div>
                            </div>
                            </div>
                        </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default CompositionTheme
