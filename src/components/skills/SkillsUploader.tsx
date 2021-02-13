import React, { Component } from 'react'
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import CsvStepper from '../layout/CsvStepper';
import {arraysEqual} from '../../services/StandardFunctions'; 
import { Redirect } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import {v4 as uuid} from "uuid"; 


interface ISkillsUploaderProps {
    isAuthenticated: boolean;
    user: any
}

interface ISkillsUploaderState {
    data: any;
    columns: any;
    step: number;
    mapped: any;
    toSkillsList: boolean;
  }

const availableColumns = ['title', 'description', 'category', 'reference'];

class SkillsUploader extends Component<ISkillsUploaderProps, ISkillsUploaderState>  {
    constructor(props: ISkillsUploaderProps){
        super(props)
        this.state = {
            step: 1,
            data: [],
            columns: [],
            mapped: {},
            toSkillsList: false
        }
    }

    handleForce = (data) => {
        const templateWasUsed = arraysEqual(Object.keys(data[0]), availableColumns);
        let columns;
        if(templateWasUsed) {
            columns = availableColumns.map(ac => {
                return {
                    Header: ac.charAt(0).toUpperCase() + ac.slice(1),
                    accessor: ac
                }
            });
            toast.info('We detected the use of data template. Skipping step 2 and 3');
        } else {
            columns = Object.keys(data[0]).map(value => {
                return {
                    Header: value,
                    accessor: value
                }
            })
        }
        this.setState({
            data,
            columns,
            step: templateWasUsed ? 4 : 2
        });
    }

    onSelectedData = (items) => {
        if(this.state.step === 2){
            this.setState({
                data: items,
                step: 3
            });
        } else {
            const batch = db.batch();
            items.forEach(item => {
                const id = uuid();
                const newSkillRef = db.collection('skills').doc(id);
                batch.set(newSkillRef, {id: id, composition: this.props.user.uid, ...item});
            });
            batch.commit()
            .then(_ => {
                toast.info('Successfully created skills');
                this.setState({
                    toSkillsList: true
                })
            })
            .catch(error => {
                toast.error(error.message);
                this.startAgain();
            })
        }
    }

    mappedColumn = (event) => {
        let {name, value} = event.target;
        if(value === 'Select option') return;
        this.setState({
            mapped: {
                ...this.state.mapped,
                [value]: name
            }
        });
    }

    doneMapping = () => {
        if(!this.state.mapped.title){
            toast.error('Title is a mandatory field. You must map it to at least one column.');
        } else {
            const columns:any[] = [];
            const data = this.state.data.map(record =>  {
                return {title: record[this.state.mapped.title]}
            });
            availableColumns.forEach(ac => {
                if(this.state.mapped[ac]){
                    columns.push({
                        Header: ac.charAt(0).toUpperCase() + ac.slice(1),
                        accessor: ac
                    });
                    data.forEach(record => {
                        try{
                            data[ac] = record[this.state.mapped[ac]];
                        } catch(e){
                            data[ac] = '';
                        }
                    })
                }
            })
            this.setState({
                columns,
                data,
                step: 4
            })
        }
    }

    startAgain = () => {
        this.setState({
            step: 1,
            data: [],
            columns: [],
            mapped: {}
        });
    }

    render() {
        return (
                this.state.toSkillsList ?
                <Redirect to={'/skills'} /> :
                <CsvStepper 
                step={this.state.step} 
                data={this.state.data} 
                columns={this.state.columns} 
                availableColumns={availableColumns}
                header={'Results of csv import'}
                handleForce={this.handleForce}
                onSelectedData={this.onSelectedData}
                mappedColumn={this.mappedColumn}
                doneMapping={this.doneMapping}
                startAgain={this.startAgain}
                templateLink={'https://firebasestorage.googleapis.com/v0/b/skilltree-b6bba.appspot.com/o/templates%2FTemplate%20skills%20upload.xlsx?alt=media&token=b77e96c6-fcc9-4289-9faa-6c341818091d'}/>

            
        )
    }
}

function mapStateToProps(state) {
    return {
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user
    };
}
  
export default connect(mapStateToProps)(SkillsUploader);