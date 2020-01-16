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

interface ICompositionDisplayProps {
    theme: any;
    compositionId: string;
    skilltrees: ISkilltree[];
    user: any;
}

interface ICompositionDisplayState {
    unsubscribe?: any;
    data?: any[];
    doneLoading: boolean;
}

class CompositionDisplay extends Component<ICompositionDisplayProps, ICompositionDisplayState> {
    // the state of the skill tree, as per my custom implementation
    
    constructor(props: ICompositionDisplayProps){
        super(props);
        this.state = {
            doneLoading: false
        };
        this.handleSave = this.handleSave.bind(this);
    }

    componentDidMount(){
        const unsubscribe = db.collection('results').doc(this.props.user.uid)
        .collection('skilltrees').where('compositionId', '==', this.props.compositionId).onSnapshot((querySnapshot) =>{
            const results = querySnapshot.docs.map(snap => snap.data());
            const data : any[]= [];
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
        });
        
    }

    componentWillUnmount(){
        this.state.unsubscribe();
    }

    handleSave(
        storage: ContextStorage,
        treeId: string,
        skills: SavedDataType
    ) {
        if(this && this.props.user && this.props.user.uid && treeId && this.state.doneLoading){
            db.collection('results').doc(this.props.user.uid).set({
                user: this.props.user.uid,
                email: this.props.user.email,
                skilltrees: firebase.firestore.FieldValue.arrayUnion(treeId)
            }, {merge: true})
            .then( _ => {
                db.collection('results')
                .doc(this.props.user.uid)
                .collection('skilltrees')
                .doc(treeId)
                .set({
                    skills, 
                    id: treeId,
                    compositionId: this.props.compositionId
                });
            })
        }
    }

    render(){
        return (
            this.state.data ? 
            <SkillProvider>
                <SkillTreeGroup theme={this.props.theme}>
                {(treeData: SkillGroupDataType) => (
                    <React.Fragment>
                      {this.props.skilltrees.map((skilltree, index) =>(
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
