import React, { Component } from 'react'

interface ISelectFieldWithColumnProps {
    title: string;
    name: string;
    value: string;
    onChange: Function;
    options: any[];
}

export class SelectFieldWithColumn extends Component<ISelectFieldWithColumnProps> {
    render() {
        return (
            <div className="column is-one-third">
                <div className="field">
                <label className="label">{this.props.title}</label>
                    <div className="control">
                        <div className="select">
                            <select name={this.props.name}
                                value={this.props.value}
                                onChange={() => this.props.onChange()}>
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
