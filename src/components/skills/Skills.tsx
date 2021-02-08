import React, { Component } from 'react'
import { db } from '../../firebase/firebase';
import ISkill from '../../models/skill.model';
import IComposition from '../../models/composition.model';
import { connect } from "react-redux";
import { toast } from 'react-toastify';
import Loading from '../layout/Loading';
import Table from '../layout/Table';
import EditableCell from '../layout/EditableCell';

interface ISkillsProps {
  isAuthenticated: boolean;
  user: any
}

interface ISkillsState {
  skills: ISkill[];
  currentSkill?: ISkill;
  doneLoading: boolean;
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
    {
        Header: 'Hierarchy',
        accessor: 'hierarchy'
    },
    {
        Header: 'Links',
        accessor: 'links',
        Cell: (props) => {
            return props.value.map(link => (
                    <a href="link.reference" className="mr-3">{link.title}</a>
                    ))
                
            
        }
    },
    {
        Header: 'Category',
        accessor: 'category',
        Cell: EditableCell
    },
    
]


class Skills extends Component<ISkillsProps, ISkillsState> {
    constructor(props: ISkillsProps){
        super(props)
        this.state = {
          skills: [],
          doneLoading: false
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
                
                db.collectionGroup("skills").where("composition", "in", compositions.map(c => c.id))
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
        console.log(items);
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
        <section className="section has-background-white-ter" style={{minHeight: "100vh"}}>
        <div className="container">
            
            <Table data={this.state.skills} columns={columns} header={'Skills'} onEdit={this.onEdit} updateData={this.updateData}/>
        </div>
       
        </section>    
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
