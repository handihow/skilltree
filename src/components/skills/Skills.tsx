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

interface ISkillsProps {
  isAuthenticated: boolean;
  user: any
}

interface ISkillsState {
  skills: ISkill[];
  selectedSkills: ISkill[];
  currentSkill?: ISkill;
  doneLoading: boolean;
  showCategoryEditor: boolean;
  categoryTitle: string;
}

const columns = [
    {
        Header: 'Title',
        accessor: 'title', // accessor is the "key" in the data,
        Cell: EditableCell
    },
    {
        Header: 'Composition',
        accessor: 'composition'
    },
    // {
    //     Header: 'Hierarchy',
    //     accessor: 'hierarchy'
    // },
    {
        Header: 'Category',
        accessor: 'category',
        Cell: EditableCell
    },
    {
        Header: "Actions",
        Cell: (tableInfo) => (
            <Link to={`/skills/${tableInfo.data[tableInfo.row.index].id}`} className="button">Open</Link>
        )
    }
]


class Skills extends Component<ISkillsProps, ISkillsState> {
    constructor(props: ISkillsProps){
        super(props)
        this.state = {
          skills: [],
          selectedSkills: [],
          doneLoading: false,
          showCategoryEditor: false,
          categoryTitle: ''
        }
      }

    componentDidMount() {
        db.collection("compositions")
        .where('user', '==', this.props.user.uid).get()
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
                                ...doc.data() as ISkill,
                                hierarchy,
                                path: doc.ref.path
                            }
                            let composition = 'Master';
                            const compositionIndex = compositions.findIndex(c => c.id === skill.composition);
                            if(compositionIndex > -1){
                                composition = compositions[compositionIndex].title;
                            }
                            skill.composition = composition;
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
        this.toggleCategyEditor();
    }  
    
    toggleCategyEditor = () => {
        this.setState({
            showCategoryEditor: !this.state.showCategoryEditor
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
                showCategoryEditor: false,
                categoryTitle: '',
                skills
            })
        });
    }

    updateData = (index, id, value) => {
        if(!this.state.skills[index].path) return;
        db.doc(this.state.skills[index].path || '').update({
            [id]: value
        });
    }

    render() {  
        return (
        this.state.doneLoading ? 
        <React.Fragment>
        <section className="section has-background-white-ter" style={{minHeight: "100vh"}}>
            <div className="container">
                <Table 
                data={this.state.skills} 
                columns={columns} 
                header={'Skills'} 
                onSelectMultiple={this.onEdit}
                selectMultipleButtonText={'Edit selected'}
                updateData={this.updateData}
                uploadLink={'/skills/upload-csv'}
                isUploadEnabled={true}/>
            </div>
        </section>
        <div className={`modal ${this.state.showCategoryEditor ? 'is-active' : ''}`}>
        <div className="modal-background"></div>
        <div className="modal-card">
            <header className="modal-card-head">
                <p className="modal-card-title">Edit category on {this.state.selectedSkills.length} selected items</p>
                <button className="delete" aria-label="close" onClick={this.toggleCategyEditor}></button>
            </header>
            <section className="modal-card-body">
                    <input 
                        className="input" 
                        type="text" 
                        placeholder="Enter category title..."
                        value={this.state.categoryTitle}
                        onChange={this.onChangeCategoryTitle} />
            </section>
            <footer className="modal-card-foot">
                <button className="button" 
                  onClick={this.toggleCategyEditor}>Cancel</button>
                <button className="button is-link" 
                  onClick={this.setCategory}>Set category</button>
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
    user: state.auth.user
  };
}

export default connect(mapStateToProps)(Skills);
