import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {storage, db} from '../../firebase/firebase';
import IComposition from '../../models/composition.model';
import { connect } from "react-redux";
import IResult from '../../models/result.model';
import {v4 as uuid} from "uuid"; 
import { toast } from 'react-toastify';
import firebase from 'firebase/app'

interface ICompositionItemProps {
    composition: IComposition;
    editCompositionTitle: Function;
    isAuthenticated: boolean;
    user: any
    deleteComposition: Function;
}

interface ICompositionItemState {
    thumbnail: string;
    progress: number;
}

export class CompositionItem extends Component<ICompositionItemProps, ICompositionItemState> {

    constructor(props: ICompositionItemProps){
        super(props);
        this.state = {
            thumbnail: 'https://via.placeholder.com/128x128.png?text=Skilltree',
            progress: 0
        };
    }
    
    copyComposition = async (composition) => {
        const toastId = uuid();
        toast.info('Copying skilltree and all related data is in progress... please wait', {
            toastId: toastId,
            autoClose: 5000
        });
        const batch = db.batch();
        //first create a new composition and set it to the batch
        const newComposition = {
          ...composition, 
          user: this.props.user.uid,
          username: this.props.user.email, 
          id: uuid(), 
          sharedUsers: [], 
          title: 'Copy of ' + composition.title,
          lastUpdate: firebase.firestore.Timestamp.now()
        };
        const newCompositionRef = db.collection('compositions').doc(newComposition.id);
        batch.set(newCompositionRef, newComposition);
        
        //then copy all the skilltrees
        const skilltreeSnapshot = await db.collection('compositions').doc(composition.id).collection('skilltrees').get();
        const skilltrees = skilltreeSnapshot.docs.map(snap => snap.data());
        for(let i = 0; i < skilltrees.length; i++){
          const newSkilltree = {
            ...skilltrees[i], 
            id: uuid(), 
            composition: newComposition.id
          };
          const newSkilltreeRef = db.collection('compositions').doc(newComposition.id)
                                    .collection('skilltrees').doc(newSkilltree.id);
          batch.set(newSkilltreeRef, newSkilltree);
          
          //get the root skills and start copying
          const rootSkillSnapshot = await db.collection('compositions').doc(composition.id)
                                            .collection('skilltrees').doc(skilltrees[i].id)
                                            .collection('skills').get();
          const rootSkills = rootSkillSnapshot.empty ? [] : rootSkillSnapshot.docs.map(snap => snap.data());
          const rootSkillPaths = rootSkillSnapshot.empty ? [] : rootSkillSnapshot.docs.map(snap => snap.ref.path)
          for(let j = 0; j < rootSkills.length; j ++){
    
            const newRootSkill = {...rootSkills[j], composition: newComposition.id, skilltree: newSkilltree.id, id: uuid()};
            const newRootSkillRef = db.collection('compositions').doc(newComposition.id)
                                      .collection('skilltrees').doc(newSkilltree.id)
                                      .collection('skills').doc(newRootSkill.id);
            batch.set(newRootSkillRef, newRootSkill);
            await this.copyChildSkills(rootSkills[j], rootSkillPaths[j], batch, newComposition.id, newSkilltree.id, newRootSkillRef);
          }
        }
        return batch.commit()
        .then(() => {
            toast.update(toastId, {
                render: `Successfully copied skilltree '${composition.title}'`
              });
        })
        .catch((error: any) => {
            toast.update(toastId, {
                render: toast.error(`Problem copying: ${error.message} `),
                type: toast.TYPE.ERROR
              });
        });
      };
    
      copyChildSkills = async (skill: any, path: string, batch: any, newCompositionId: string, newSkilltreeId: string, newSkillRef: any) => {
        const childSkillSnapshot = await db.doc(path).collection('skills').get();
        if(childSkillSnapshot.empty){
          return;
        } else {
          const childSkills = childSkillSnapshot.docs.map(snap => snap.data());
          const childSkillPaths = childSkillSnapshot.docs.map(snap => snap.ref);
          for (let index = 0; index < childSkills.length; index++) {
            const newChildSkill = {
              ...childSkills[index], 
              composition: newCompositionId, 
              skilltree: newSkilltreeId, 
              id: uuid()
            };
            const newChildSkillRef = newSkillRef.collection('skills').doc(newChildSkill.id);
            batch.set(newChildSkillRef, newChildSkill);
            await this.copyChildSkills(childSkills[index], childSkillPaths[index].path, batch, newCompositionId, newSkilltreeId, newChildSkillRef);
          }
        }
      }

      

    componentDidMount(){
        if(this.props.composition.hasBackgroundImage){
            const storageRef = storage.ref();
            const imageRef = storageRef.child(this.props.composition.thumbnailImage || '');
            imageRef.getDownloadURL()
            .then(url => {
                this.setState({thumbnail: url});
            });
        }
        if(this.props.isAuthenticated){
            db.collection('results')
            .doc(this.props.user.uid)
            .get()
            .then(snapShot => {
                const result = snapShot.data() as IResult;
                let progress = 0;
                try{
                    progress = result.progress[this.props.composition.id || ''];
                } catch(e){
                    console.error(e)
                }
                this.setState({
                    progress: progress ? progress : 0
                })
            })
        }
    }
    
    render() {
        const { id, title, username } = this.props.composition;
        return (
            <div className="box">
            <div className="media">
            <div className="media-left">
                <p className="image is-64x64">
                <img className="is-rounded" src={this.state.thumbnail} alt="thumbnail"></img>
                </p>
            </div>
            <div className="media-content">
                <div className="content">
                <p>
                    <Link to={this.props.user.uid === this.props.composition.user 
                              ? "/editor/"+id :
                              "compositions/"+id+"/viewer"} data-tooltip="To skilltree editor" style={{color: "black"}}> 
                    <strong>{title}</strong> 
                    </Link><small style={{marginLeft: "10px"}}>{username}</small>
                </p>
                </div>
                <nav className="level is-mobile">
                <div className="level-left">
                {this.props.user.uid === this.props.composition.user &&
                    <div className="level-item" data-tooltip="Edit skilltree title">
                        <a href="# " onClick={this.props.editCompositionTitle.bind(this, this.props.composition)}>
                            <FontAwesomeIcon icon='pen' /></a>
                    </div>}
                    {(this.props.composition.canCopy || this.props.user.uid === this.props.composition.user)  && <div className="level-item" data-tooltip="Copy skilltree">
                        <a href="# " onClick={() => this.copyComposition(this.props.composition)}>
                            <FontAwesomeIcon icon='copy' /></a>
                    </div>}
                    {this.props.user.uid === this.props.composition.user &&
                        <Link to={"/editor/"+id} className="level-item" data-tooltip="Skilltree editor">
                    <span className="icon is-small"><FontAwesomeIcon icon='edit' /></span>
                    </Link>}
                    <Link to={"/compositions/"+id+"/viewer"} className="level-item" data-tooltip="View skilltree">
                    <span className="icon is-small"><FontAwesomeIcon icon='eye' /></span>
                    </Link>
                    {this.props.user.uid === this.props.composition.user &&
                        <Link to={"/compositions/"+id+"/monitor"} className="level-item" data-tooltip="Monitor your students">
                    <span className="icon is-small"><FontAwesomeIcon icon='users' /></span>
                    </Link>}
                </div>
                <div className="level-right">
                <div className="level-item is-hidden-mobile">
                    <div className="tag is-primary">
                        {'Completed ' + this.state.progress + ' of ' + this.props.composition.skillcount + ' skills'}
                    </div>
                </div>
                </div>
                </nav>
                <progress className="progress is-primary"
                        value={this.state.progress} 
                        max={this.props.composition.skillcount}></progress>
            </div>
            <div className="media-right">
            <button className="delete" onClick={this.props.deleteComposition.bind(this, this.props.composition)}></button>
            </div>
            </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user
    };
  }
  

export default connect(mapStateToProps)(CompositionItem)
