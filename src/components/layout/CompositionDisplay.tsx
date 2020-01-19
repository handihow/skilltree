import React, { Component } from 'react';
import ISkilltree from '../../models/skilltree.model';
import {
    SkillTreeGroup,
    SkillTree,
    SkillProvider,
    // SkillType,
    SkillGroupDataType,
    SavedDataType
  } from 'beautiful-skill-tree';
import { ContextStorage } from 'beautiful-skill-tree/dist/models';
import { db } from '../../firebase/firebase';
import { connect } from "react-redux";
import firebase from "firebase/app";
import { toast } from 'react-toastify';

interface ICompositionDisplayProps {
    theme: any;
    compositionId: string;
    skilltrees: ISkilltree[];
    user: any;
    showController: boolean;
    title: string;
}

interface ICompositionDisplayState {
    unsubscribe?: any;
    data?: any[];
    doneLoading: boolean;
    skillQuery?: string;
}

class CompositionDisplay extends Component<ICompositionDisplayProps, ICompositionDisplayState> {
    progress: React.RefObject<HTMLSpanElement>;
    // the state of the skill tree, as per my custom implementation
    
    constructor(props: ICompositionDisplayProps){
        super(props);
        this.state = {
            doneLoading: false
        };
        this.handleSave = this.handleSave.bind(this);
        this.progress = React.createRef()
    }

    componentDidMount(){
        if(this.props.user && this.props.user.uid){
            const unsubscribe = db.collection('results').doc(this.props.user.uid)
            .collection('skilltrees').where('compositionId', '==', this.props.compositionId).onSnapshot((querySnapshot) =>{
                if(!querySnapshot.empty && querySnapshot.size !== 0){
                    const results = querySnapshot.docs.map(snap => snap.data());
                    const data : SavedDataType[]= [];
                    this.props.skilltrees.forEach((skilltree) => {
                        const dataIndex = results.findIndex(r => r.id === skilltree.id);
                        if(dataIndex > -1){
                            data.push(results[dataIndex].skills as SavedDataType);
                        } else {
                            data.push({});
                        }
                    });
                    this.setState({
                        unsubscribe: unsubscribe,
                        data: data,
                        doneLoading: true
                    });
                } else {
                    //no data yet
                    this.setState({
                        data: [],
                        doneLoading: true
                    })
                }
                
            });
        } else {
            //no user is logged in
            this.setState({
                data: [],
                doneLoading: true
            })
        }
    }

    componentWillUnmount(){
        if(this.state.unsubscribe){
            this.state.unsubscribe();
        }
        
    }

    updateQueryValue = (e : React.FormEvent<HTMLInputElement>) => {
        this.setState({
            skillQuery: e.currentTarget.value
        })
    }

    handleSave(
        storage: ContextStorage,
        treeId: string,
        skills: SavedDataType,
        progress?: number
    ) {
        
        if(this.props.user && this.props.user.uid && treeId && this.state.doneLoading){
            db.collection('results')
            .doc(this.props.user.uid)
            .collection('skilltrees')
            .doc(treeId)
            .set({
                skills, 
                id: treeId,
                compositionId: this.props.compositionId
            })
            .then( _ => {
                db.collection('results').doc(this.props.user.uid).set({
                    user: this.props.user.uid,
                    email: this.props.user.email,
                    displayName: this.props.user.displayName,
                    compositions: firebase.firestore.FieldValue.arrayUnion(this.props.compositionId),
                    skilltrees: firebase.firestore.FieldValue.arrayUnion(treeId),
                    progress: {
                        [this.props.compositionId]: 
                        parseInt(this.progress.current?.textContent ? this.progress.current?.textContent : '0') 
                    }
                }, {merge: true})
                .catch(err => {
                    toast.error(err.message);
                });
            })
            .catch(err => {
                toast.error(err.message);
            })
        } else if (this.state.doneLoading){
            //not logged in
            storage.setItem(`skills-${treeId}`, JSON.stringify(skills));
        }
    }

    render(){
        return (
            this.state.data ? 
            <SkillProvider>
                <SkillTreeGroup theme={this.props.theme}>
                {(treeData: SkillGroupDataType) => (
                    <React.Fragment>
                      {this.props.showController && this.state.doneLoading && 
                      <div className="message is-primary" style={{marginTop: "15px"}}>
                      <div className="message-header">{this.props.title}</div>
                          <div className="message-body">
                              <div className="level">
                                  <div className="level-left">
                                    <h6 className="title is-6">Completed skills: 
                                    <span style={{marginLeft: "5px"}} ref={this.progress}>
                                        {treeData.selectedSkillCount.required + treeData.selectedSkillCount.optional}
                                    </span>
                                    /{treeData.skillCount.required + treeData.skillCount.optional}</h6>
                                  </div>
                                  <div className="level-right">
                                    <button className="button" onClick={treeData.resetSkills}>Reset</button>
                                  </div>
                              </div>
                              <div className="field is-fullwidth has-addons">
                                <div className="control">
                                <input 
                                    className="input" 
                                    type="text" 
                                    placeholder="Filter by skill name..."
                                    onChange={this.updateQueryValue}
                                    value={this.state.skillQuery ? this.state.skillQuery : ""}/>
                                <p className="help">Only show branches that contain a skill that matches your query</p>
                                </div>
                                <p className="control">
                                    <button className="button" onClick={() => treeData.handleFilter(this.state.skillQuery || '')}>
                                    Filter
                                    </button>
                                </p>
                            </div>
                         </div>
                      </div>}
                      {this.state.doneLoading && this.props.skilltrees.map((skilltree, index) =>(
                        <SkillTree
                            key={skilltree.id}
                            treeId={skilltree.id}
                            title={skilltree.title}
                            data={skilltree.data}
                            collapsible={skilltree.collapsible}
                            description={skilltree.description}
                            handleSave={this.handleSave}
                            savedData={this.state.data ? this.state.data[index] : {}}
                        />
                      ))}
                    </React.Fragment>
                )}
                </SkillTreeGroup>
            </SkillProvider> : null
        )
    }
}

function mapStateToProps(state) {
    return {
      user: state.auth.user
    };
  }

  export default connect(mapStateToProps)(CompositionDisplay);
