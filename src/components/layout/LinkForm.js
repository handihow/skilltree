import React, { Component } from 'react'

export class LinkForm extends Component {
    render() {
        return (
                <React.Fragment>
                <div className="field is-horizontal">
                    <div className="field-label">
                    <label className="label">Link type?</label>
                    </div>
                    <div className="field-body">
                    <div className="field is-narrow">
                        <div className="control">
                        <label className="radio">
                            <input type="radio" name={`icon/${index}`} value='youtube' 
                                checked={this.state.links[index].icon === 'youtube'}
                                onChange={this.changeLink} />
                            <span style={{marginLeft: "5px"}}>YouTube</span>
                        </label>
                        <label className="radio">
                            <input type="radio" name={`icon/${index}`} value='file'
                            checked={this.state.links[index].icon === 'file'}
                            onChange={this.changeLink}/>
                            <span style={{marginLeft: "5px"}}>File</span>
                        </label>
                        <label className="radio">
                            <input type="radio" name={`icon/${index}`} value='link'
                            checked={this.state.links[index].icon === 'link'}
                            onChange={this.changeLink}/>
                            <span style={{marginLeft: "5px"}}>URL</span>
                        </label>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="field is-horizontal">
                    <div className="field-label">
                    <label className="label">Link</label>
                    </div>
                    <div className="field-body">
                        <div className="field is-inline-block">
                            <div className="control">
                                <input className="input" type="text" placeholder="title will display on the link"
                                    name={`title/${index}`} value={this.state.links[index].title}
                                    onChange={this.changeLink}
                                />
                            </div>
                        </div>
                        <div className="field is-inline-block">
                            <div className="control">
                                <input className="input" type="text" placeholder="url to the video or file or link"
                                    name={`reference/${index}`} value={this.state.links[index].reference}
                                    onChange={this.changeLink}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="field is-horizontal">
                <div className="field-label">
                </div>
                <div className="field-body">
                    <div className="field">
                    <div className="control">
                        <button type="button" className="button is-danger is-small"
                            onClick={() => this.removeLink(index)}>
                        Remove link
                        </button>
                    </div>
                    </div>
                </div>
                </div>    
            </React.Fragment>
        )
    }
}

export default LinkForm
