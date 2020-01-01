import React, { Component } from 'react'

export class SelectFieldWithColumn extends Component {
    render() {
        return (
            <div className="column is-one-quarter">
                <div className="field">
                <label className="label">{this.props.title}</label>
                    <div className="control">
                        <div className="select is-primary">
                            <select name={this.props.name}
                                value={this.props.value}
                                onChange={this.props.onChange}>
                                {this.props.options.map((option) => (
                                <option key={option.value} value={option.value}>{option.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SelectFieldWithColumn
