import React, { Component } from 'react'
import { db } from '../../firebase/firebase';
import ISkill from '../../models/skill.model';
import IComposition from '../../models/composition.model';
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import Loading from '../layout/Loading';
import Table from '../layout/Table';
import EditableCell from '../layout/EditableCell';
import { Link } from 'react-router-dom';
import { propertyInArrayEqual } from '../../services/StandardFunctions';
import { getRelevantUserIds } from '../../services/UserServices';
import Header from '../layout/Header';
import {v4 as uuid} from "uuid"; 
import { showWarningModal, completedAfterWarning } from '../../actions/ui';

interface ISkillsProps {
  isAuthenticated: boolean;
  user: any;
  hasDismissedWarning: boolean;
  dispatch: any;
}

interface ISkillsState {
  skills: ISkill[];
  selectedSkills: ISkill[];
  currentSkill?: ISkill;
  doneLoading: boolean;
  showEditMultipleModal: boolean;
  categoryTitle: string;
  activeTab: string;
  destroyInProgress: boolean;
}

const columns = [
    {
        Header: 'Title',
        accessor: 'title', // accessor is the "key" in the data,
        Cell: EditableCell
    },
    {
        Header: 'Icon',
        accessor: 'icon', // accessor is the "key" in the data,
        Cell: (tableInfo) => (
            tableInfo.data[tableInfo.row.index].icon ? <p className="image is-32x32">
            <img
            src={ tableInfo.data[tableInfo.row.index].icon } alt="thumbnail"></img>
            </p> : null
        )
    },
    {
        Header: 'Category',
        accessor: 'category',
        Cell: EditableCell
    },
    {
        Header: 'Reference',
        accessor: 'reference',
        Cell: EditableCell
    }
]

const hierarchyColumn = {
    Header: 'Hierarchy',
    accessor: 'hierarchy',
    // Cell: EditableCell
};

const compositionColumn = {
    Header: 'Composition',
    accessor: 'compositionTitle'
};

const actionsColumn = {
    Header: "Actions",
    Cell: (tableInfo) => (
        <Link to={`/skills/${tableInfo.data[tableInfo.row.index].id}`} className="button">Open</Link>
    )
}


class Skills extends Component<ISkillsProps, ISkillsState> {
    constructor(props: ISkillsProps){
        super(props)
        this.state = {
          activeTab: 'master',
          skills: [],
          selectedSkills: [],
          doneLoading: false,
          showEditMultipleModal: false,
          categoryTitle: '',
          destroyInProgress: false
        }
        this.prepareDeleteSkills = this.prepareDeleteSkills.bind(this);
      }

    async componentDidMount() {
        const userIds = await getRelevantUserIds(this.props.user);
        db.collection("compositions")
        .where('user', 'in', userIds).get()
        .then(collectionsSnap => {
            if(collectionsSnap.empty){
                this.setState({
                    doneLoading: true
                })
            } else {
                const compositions = collectionsSnap.docs.map(doc => {
                    const composition = {
                        ...doc.data() as IComposition,
                        id: doc.id
                    }
                    return composition
                });
                
                db.collectionGroup("skills").where("composition", "in", [ this.props.user.uid, ...compositions.map(c => c.id) ])
                .get()
                .then(skillsSnap => {
                    if(skillsSnap.empty){
                        this.setState({
                            doneLoading: true
                        })
                    } else {
                        const skills = skillsSnap.docs.map(doc => {
                            let hierarchy = 0;
                            const splittedPath = doc.ref.path.split('/').length;
                            if(splittedPath > 5) {
                                hierarchy = (doc.ref.path.split('/').length - 4) / 2;
                            }
                            let skill: ISkill = {
                                category: 'None',
                                reference: 'None',
                                ...doc.data() as ISkill,
                                hierarchy,
                                path: doc.ref.path
                            }
                            skill.compositionTitle = 'Master';
                            const compositionIndex = compositions.findIndex(c => c.id === skill.composition);
                            if(compositionIndex > -1){
                                skill.compositionTitle = compositions[compositionIndex].title;
                                skill.table = compositions[compositionIndex].user === this.props.user.uid ? 'skilltrees' : 'domain';
                            } else {
                                skill.table = 'master';
                            }
                            return skill;
                        });
                        
                        this.setState({
                            doneLoading: true,
                            skills
                        });
                    }
                })
                .catch(err => {
                    toast.error(err.message);
                    this.setState({
                        doneLoading: true
                    })
                })
            }
        })
        .catch(err => {
            toast.error(err.message);
            this.setState({
                doneLoading: true
            })
        })
    } 

    componentDidUpdate(_prevProps) {
        if(this.props.hasDismissedWarning && !this.state.destroyInProgress){
            this.deleteMasterSkills();
        }
    }

    onEdit = (items) => {
        //check if items have a common title
        let categoryTitle = '';
        const haveCommonCategoryTitle = propertyInArrayEqual(items, 'category');
        if(haveCommonCategoryTitle){
            categoryTitle = items[0].category;
        }
        this.setState({
            selectedSkills: items,
            categoryTitle
        })
        this.toggleEditMultipleModal();
    }  
    
    toggleEditMultipleModal = () => {
        this.setState({
            showEditMultipleModal: !this.state.showEditMultipleModal
        })
    }

    onChangeCategoryTitle = (e) => this.setState({categoryTitle: e.target.value});

    setCategory = () => {
        const batch = db.batch();
        this.state.selectedSkills.forEach(skill => {
            const ref = db.doc(skill.path || '');
            batch.update(ref, {category: this.state.categoryTitle} );
        });
        batch.commit().then(_ => {
            //update the skills
            const skills = this.state.skills.map(skill => {
                const found = this.state.selectedSkills.findIndex(ss => ss.id === skill.id) > -1;
                if(found){
                    return {
                        ...skill,
                        category: this.state.categoryTitle
                    }
                } else {
                    return skill;
                }
            })
            this.setState({
                showEditMultipleModal: false,
                categoryTitle: '',
                skills
            })
        });
    }

    copyToMaster = () => {
        const batch = db.batch();
        const newSkills : ISkill[] = [];
        this.state.selectedSkills.forEach(item => {
            const id = uuid();
            const newSkillRef = db.collection('skills').doc(id);
            const newSkill : ISkill = {
                id: id, 
                title: item.title, 
                optional: item.optional ? true : false,
                composition: this.props.user.uid,
                table: 'master',
                countChildren: 0
            };
            ['description', 'icon', 'category', 'direction', 'links'].forEach(optionalProperty => {
                if(item[optionalProperty]){newSkill[optionalProperty] = item[optionalProperty]}
            })
            batch.set(newSkillRef, newSkill);
            newSkills.push(newSkill);
        });
        batch.commit()
        .then(_ => {
            toast.info('Successfully copied skills to master list');
            this.setState({
                activeTab: 'master',
                showEditMultipleModal: false,
                skills: [...this.state.skills, ...newSkills]
            })
        })
        .catch(error => {
            toast.error(error.message);
        })
    }

    updateData = (index, id, value) => {
        const filteredSkills = this.state.skills.filter(skill => skill.table === this.state.activeTab);
        if(!filteredSkills[index].path) return;
        db.doc(filteredSkills[index].path || '').update({
            [id]: value
        });
    }

    prepareDeleteSkills() {
        const { dispatch } = this.props;
        dispatch(showWarningModal('You are about to delete ' + this.state.selectedSkills.length + ' skills from your master list. You cannot undo this. Are you sure?'))
    }

    deleteMasterSkills = () => {
        if(!this.state.selectedSkills || this.state.selectedSkills.length === 0) return;
        this.setState({
            destroyInProgress: true
        })
        const batch = db.batch();
        this.state.selectedSkills.forEach(skill => {
            if(skill.path){
                batch.delete(db.doc(skill.path))
            }
        })
        batch.commit()
        .then(_ => {
            toast.info('Deleted ' + this.state.selectedSkills.length + ' successfully');
            const { dispatch } = this.props;
            dispatch(completedAfterWarning());
            this.setState({
                destroyInProgress: false,
                showEditMultipleModal: false,
                selectedSkills: [],
                skills: this.state.skills.filter( ( el ) => !this.state.selectedSkills.includes( el ) )
            })
        })
        .catch(err => {
            toast.error('Error deleting skills ...' + err.message);
        });
    }

    changeActiveTab = (tab: string) => {
        this.setState({
            activeTab: tab
        });
      }

    render() {  
        return (
        this.state.doneLoading ? 
        <React.Fragment>
        <section className="section has-background-white-ter" style={{minHeight: "100vh"}}>
            <div className="container">
                <div className="level">
                <Header header={'Skills'} />
                </div>
                
              <div className="tabs">
              <ul>
                  <li className={this.state.activeTab ==='master' ? "is-active" : undefined}>
                      <a href="# " onClick={() => this.changeActiveTab('master')}>Master skills</a>
                  </li>
                  <li className={this.state.activeTab ==='skilltrees' ? "is-active" : undefined}>
                      <a href="# " onClick={() => this.changeActiveTab('skilltrees')}>Skills in SkillTrees</a>
                  </li>
                  {this.props.user.hostedDomain && <li className={this.state.activeTab ==='domain' ? "is-active" : undefined}>
                      <a href="# " onClick={() => this.changeActiveTab('domain')}>Skills in {this.props.user.hostedDomain}</a>
                  </li>}
              </ul>
              </div>
                <Table 
                data={this.state.skills.filter(skill => skill.table === this.state.activeTab)} 
                columns={this.state.activeTab === 'domain' ? 
                                [...columns, compositionColumn, hierarchyColumn] :
                                this.state.activeTab === 'skilltrees' ?
                                [...columns, compositionColumn, hierarchyColumn, actionsColumn] : [...columns, actionsColumn]} 
                header={this.state.activeTab ==='master' ? 'Master Skills' : this.state.activeTab ==='skilltrees' ? 'Skills in your skilltrees' : 'Skills in domain ' + this.props.user.hostedDomain} 
                onSelectMultiple={this.onEdit}
                selectMultipleButtonText={'Edit selected'}
                updateData={this.updateData}
                uploadLink={'/skills/upload-csv'}
                isUploadEnabled={this.state.activeTab ==='master'}
                isEditingEnabled={true}/>
            </div>
        </section>
        <div className={`modal ${this.state.showEditMultipleModal ? 'is-active' : ''}`}>
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Actions on {this.state.selectedSkills.length} selected items</p>
                    <button className="delete" aria-label="close" onClick={this.toggleEditMultipleModal}></button>
                </header>
                <section className="modal-card-body">
                        {this.state.activeTab !== 'domain' &&
                        <div className="field">
                        <label className="label">Category</label>
                        <div className="control">
                        <input 
                            className="input" 
                            type="text" 
                            placeholder="Enter category title..."
                            value={this.state.categoryTitle}
                            onChange={this.onChangeCategoryTitle} />
                        </div>
                        </div>}
                        {this.state.activeTab !== 'master' && 
                            <div>You can copy skills to your master skills list using button below</div>}
                        {this.state.activeTab === 'master' && 
                            <div>You can delete the selected skills from your master skills list using button below</div>}
                </section>
                <footer className="modal-card-foot">
                    <button className="button" 
                    onClick={this.toggleEditMultipleModal}>Cancel</button>
                    {this.state.activeTab !== 'domain' &&<button className="button is-info" 
                    onClick={this.setCategory}>Set category</button>}
                    {this.state.activeTab !== 'master' && 
                            <button className="button is-primary" 
                            onClick={this.copyToMaster}>Copy to master</button>}
                    {this.state.activeTab === 'master' && 
                            <button className="button is-warning" 
                            onClick={this.prepareDeleteSkills}>Delete from master</button>}
                </footer>
            </div>
        </div>
        </React.Fragment>    
        : <Loading />);    
    } 

}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    hasDismissedWarning: state.ui.hasDismissedWarning
  };
}

export default connect(mapStateToProps)(Skills);
