import React, { Component } from "react";
import { db, storage } from "../../firebase/firebase";
import EditorDisplay from "./layout/EditorDisplay";
import EditorMenu from "./layout/EditorMenu";
import EditorNavbar from "./layout/EditorNavbar";
import Loading from "../layout/Loading";
import { RouteComponentProps, Redirect } from "react-router-dom";
import ISkilltree from "../../models/skilltree.model";
import IComposition from "../../models/composition.model";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { SkilltreeForm } from "./elements/SkilltreeForm";
import { DragDropContext } from "react-beautiful-dnd";
import {
  getComposition,
  updateCompositionProperty,
} from "../../services/CompositionServices";
import {
  updateSkilltree,
  deleteSkilltree,
  getNumberOfRootSkills,
  getNumberSkills,
} from "../../services/SkillTreeServices";
import { showWarningModal, completedAfterWarning } from "../../actions/ui";
import { standardEmptySkill } from "../../services/StandardData";
import SkillForm from "./elements/SkillForm";
import ISkill from "../../models/skill.model";
import {
  getSkillById,
  updateSkill,
  importMultipleSkills,
} from "../../services/SkillServices";
import { v4 as uuid } from "uuid";
import ThemeEditor from "./layout/ThemeEditor";
import OptionsEditor from "./layout/OptionsEditor";
import { setSkilltree, completedImporting } from "../../actions/editor";
import ShareLinkModal from "./elements/ShareLinkModal";

type TParams = { compositionId: string };

interface IEditorProps extends RouteComponentProps<TParams> {
  user: any;
  isAuthenticated: boolean;
  dispatch: any;
  hasDismissedWarning: boolean;
  hasStartedImportingSkills: boolean;
  selectedSkills: ISkill[];
  parentSkilltree: ISkilltree;
}

interface IEditorState {
  composition?: IComposition;
  url: string;
  hasBackgroundImage: boolean;
  backgroundImage?: string;
  skilltrees?: ISkilltree[];
  toEditor: boolean;
  toSkillsTable: boolean;
  unsubscribe?: any;
  showSkilltreeForm: boolean;
  showSkillForm: boolean;
  showShareLinkModal: boolean;
  isEditingSkilltree: boolean;
  isEditingSkill: boolean;
  currentSkilltree?: ISkilltree;
  currentSkill?: ISkill;
  currentParentSkill?: ISkill;
  enableDropSkilltrees: boolean;
  enableDropInSkilltree: boolean;
  enableDropSkills: boolean;
  isAddingRootSkillAtIndex: number;
  isPreparingToDestroy: boolean;
  destroyInProgress: boolean;
  showThemeEditor: boolean;
  showOptionsEditor: boolean;
}

const defaultState = {
  showSkilltreeForm: false,
  showSkillForm: false,
  isEditingSkilltree: false,
  isEditingSkill: false,
  enableDropSkilltrees: false,
  enableDropInSkilltree: false,
  enableDropSkills: true,
  isPreparingToDestroy: false,
  destroyInProgress: false,
  isAddingRootSkillAtIndex: -1,
  currentParentSkill: undefined,
  currentSkill: undefined,
  showThemeEditor: false,
  showOptionsEditor: false,
  url: "",
  showShareLinkModal: false,
};

export class Editor extends Component<IEditorProps, IEditorState> {
  constructor(props: IEditorProps) {
    super(props);
    this.state = {
      hasBackgroundImage: false,
      toEditor: false,
      toSkillsTable: false,
      ...defaultState,
    };
    this.handleOnDragStart = this.handleOnDragStart.bind(this);
    this.handleOnDragEnd = this.handleOnDragEnd.bind(this);
    this.editSkilltree = this.editSkilltree.bind(this);
    this.prepareDeleteSkilltree = this.prepareDeleteSkilltree.bind(this);
    this.updateSkilltree = this.updateSkilltree.bind(this);
    this.deleteSkilltree = this.deleteSkilltree.bind(this);
    this.addSkilltree = this.addSkilltree.bind(this);
    this.editSkill = this.editSkill.bind(this);
    this.updateSkill = this.updateSkill.bind(this);
    this.handleCompositionChange = this.handleCompositionChange.bind(this);
    this.resetDefaultState = this.resetDefaultState.bind(this);
  }

  async componentDidMount() {
    if (this.props.hasStartedImportingSkills) {
      //check if we need to import any skills
      const order = await getNumberOfRootSkills(this.props.parentSkilltree);
      await importMultipleSkills(
        this.props.selectedSkills,
        this.props.parentSkilltree,
        order
      );
      this.props.dispatch(completedImporting());
    }
    const compositionId = this.props.match.params.compositionId;
    const composition = await getComposition(compositionId);
    if (!composition || this.props.user.uid !== composition.user) {
      toast.error(
        "Composition not found or you are not the owner of this skilltree."
      );
      this.setState({
        toEditor: true,
      });
      return;
    }
    this.setCompositionBackground(composition);
    this.subscribeSkilltreeChanges();
  }

  componentDidUpdate(_prevProps) {
    if (this.props.hasDismissedWarning && this.state.isPreparingToDestroy && !this.state.destroyInProgress) {
      this.deleteSkilltree();
    }
  }

  setCompositionBackground(composition: IComposition) {
    if (composition.hasBackgroundImage) {
      //fetch the background image
      const storageRef = storage.ref();
      const imageRef = storageRef.child(composition.backgroundImage || "");
      imageRef.getDownloadURL().then((url) => {
        this.setState({
          hasBackgroundImage: true,
          backgroundImage: url,
          composition: composition,
          url:
            window.location.protocol +
            "//" +
            window.location.host +
            "/compositions/" +
            composition.id +
            "/viewer",
        });
      });
    } else {
      this.setState({
        hasBackgroundImage: false,
        composition: composition,
        url:
          window.location.protocol +
          "//" +
          window.location.host +
          "/compositions/" +
          composition.id +
          "/viewer",
      });
    }
  }

  subscribeSkilltreeChanges() {
    const unsubscribe = db
      .collection("compositions")
      .doc(this.props.match.params.compositionId)
      .collection("skilltrees")
      .orderBy("order")
      .onSnapshot(async (querySnapshot) => {
        const skilltrees = querySnapshot.docs.map((doc) => {
          return { path: doc.ref.path, ...(doc.data() as ISkilltree) };
        });
        this.setState({
          skilltrees,
          currentSkilltree: skilltrees[0]
        });
      });
    this.setState({
      unsubscribe,
    });
  }

  handleCompositionChange = (property: string, value: string) => {
    if (!this.state.composition || !this.state.composition.id) return;
    const title = property === "title" ? value : this.state.composition.title;
    updateCompositionProperty(this.state.composition.id, property, value);
    this.setState({
      composition: {
        ...this.state.composition,
        title,
        [property]: value,
      },
    });
  };

  componentWillUnmount() {
    this.state.unsubscribe();
  }

  handleOnDragStart(result) {
    console.log(result);
    if (result.draggableId.startsWith("skilltree")) {
      this.setState({
        enableDropSkilltrees: true,
        enableDropInSkilltree: false,
        enableDropSkills: false,
      });
    } else if (["root-skill", "master-skills"].includes(result.draggableId)) {
      this.setState({
        enableDropSkilltrees: false,
        enableDropInSkilltree: true,
        enableDropSkills: false,
      });
    }
  }

  resetDefaultState() {
    this.setState(defaultState);
  }

  addSkilltree(){
    this.setState({
      showSkilltreeForm: true,
    })
  }

  async handleOnDragEnd(result) {
    this.setState({
      enableDropSkilltrees: false,
      enableDropInSkilltree: false,
      enableDropSkills: true,
    });
    if (!result.destination) {
      return;
    } else if (
      result.source.droppableId.startsWith("EDITOR") &&
      result.destination.droppableId.startsWith("EDITOR") &&
      result.draggableId.startsWith("skilltree")
    ) {
      this.moveExistingSkilltree(result);
    } else if (
      result.source.droppableId === "MENU" &&
      result.destination.droppableId.startsWith("EDITOR") &&
      result.draggableId === "skilltree"
    ) {
      this.addSkilltree();
    } else if (result.draggableId === "root-skill") {
      const currentSkilltree = this.getCurrentSkilltree(
        result.destination.droppableId.replace("SKILLTREE-", "")
      );
      if (!currentSkilltree) return;
      const order = await getNumberOfRootSkills(currentSkilltree);
      this.setState({
        showSkillForm: true,
        isAddingRootSkillAtIndex: order,
        currentSkilltree: currentSkilltree,
      });
    } else if (result.draggableId === "sibling-skill") {
      const droppedSkillId = result.destination.droppableId.replace(
        "SKILL-",
        ""
      );
      const siblingSkill = await getSkillById(droppedSkillId);
      if (!siblingSkill) return;
      const splittedPath = siblingSkill?.path?.split("/");
      const currentSkilltree = this.getCurrentSkilltree(
        siblingSkill.skilltree || ""
      );
      if (!currentSkilltree) return;
      if (splittedPath?.length === 6) {
        //new root skill
        const order = await getNumberOfRootSkills(currentSkilltree);
        this.setState({
          showSkillForm: true,
          isAddingRootSkillAtIndex: order,
          currentSkilltree,
        });
      } else if (splittedPath) {
        //need to find parent skill, it will be in the splitted path one step up from sibling skill
        console.log(splittedPath.length);
        const parentSkill = await getSkillById(
          splittedPath[splittedPath.length - 3]
        );
        if (!parentSkill) return;
        this.setState({
          showSkillForm: true,
          currentParentSkill: parentSkill,
          currentSkilltree,
        });
      }
    } else if (result.draggableId === "child-skill") {
      const droppedSkillId = result.destination.droppableId.replace(
        "SKILL-",
        ""
      );
      const parentSkill = await getSkillById(droppedSkillId);
      if (!parentSkill) return;
      const currentSkilltree = this.getCurrentSkilltree(
        parentSkill.skilltree || ""
      );
      if (!currentSkilltree) return;
      this.setState({
        showSkillForm: true,
        currentParentSkill: parentSkill,
        currentSkilltree,
      });
    } else if (result.draggableId === "master-skills") {
      console.log("dragged master skills");
      const currentSkilltree = this.getCurrentSkilltree(
        result.destination.droppableId.replace("SKILLTREE-", "")
      );
      const { dispatch } = this.props;
      dispatch(setSkilltree(currentSkilltree));
      this.setState({
        toSkillsTable: true,
      });
    } else {
      console.log(result);
    }
  }

  getCurrentSkilltree = (skilltreeId: string) => {
    if (!this.state.skilltrees) return;
    const skilltreeIndex = this.state.skilltrees.findIndex(
      (st) => st.id === skilltreeId
    );
    if (skilltreeIndex === -1) return;
    return this.state.skilltrees[skilltreeIndex];
  };

  async moveExistingSkilltree(result) {
    const skilltreeId = result.draggableId.replace("skilltree-", "");
    const compositionId = result.source.droppableId.replace("EDITOR-", "");
    const movedItem = this.state.skilltrees?.find(
      (st) => st.id === skilltreeId
    );
    const remainingItems =
      this.state.skilltrees?.filter((st) => st.id !== skilltreeId) || [];
    const reorderedItems = [
      ...remainingItems.slice(0, result.destination.index),
      movedItem,
      ...remainingItems.slice(result.destination.index),
    ];
    const batch = db.batch();
    reorderedItems.forEach((item, index) => {
      const ref = db
        .collection("compositions")
        .doc(compositionId)
        .collection("skilltrees")
        .doc(item?.id);
      batch.update(ref, { order: index });
    });
    batch.commit();
  }

  editSkilltree(skilltree: ISkilltree) {
    this.setState({
      showSkilltreeForm: true,
      currentSkilltree: skilltree,
      isEditingSkilltree: true,
    });
  }

  async updateSkilltree(skilltree: ISkilltree, rootSkillTitle: string) {
    if (!this.state.composition?.id) return;
    await updateSkilltree(
      skilltree,
      this.state.composition.id,
      this.state.isEditingSkilltree ? true : false,
      rootSkillTitle
    );
    this.resetDefaultState();
  }

  async deleteSkilltree() {
    if (!this.state.composition?.id || !this.state.currentSkilltree) return;
    this.setState({
      destroyInProgress: true,
    });
    const countSkills = await getNumberSkills(this.state.currentSkilltree);
    await deleteSkilltree(
      this.state.composition?.id,
      this.state.currentSkilltree,
      countSkills
    );
    const { dispatch } = this.props;
    dispatch(completedAfterWarning());
    this.setState({
      isPreparingToDestroy: false,
      destroyInProgress: false,
    });
  }

  prepareDeleteSkilltree(skilltree: ISkilltree) {
    this.setState({
      currentSkilltree: skilltree,
      isPreparingToDestroy: true
    });
    const { dispatch } = this.props;
    dispatch(
      showWarningModal(
        "You are about to delete the SkillTree " +
          skilltree?.title +
          " including all related skills. You cannot undo this. Are you sure?"
      )
    );
  }

  editSkill(skill: ISkill, skills: ISkill[]) {
    if (!skill.parent || !skills || !this.state.skilltrees) return;
    const parentId = skill.parent[skill.parent.length - 3];
    const parentSkillIndex = skills.findIndex((s) => s.id === parentId);
    const parentSkilltreeIndex = this.state.skilltrees.findIndex(
      (st) => st.id === skill.skilltree
    );
    this.setState({
      showSkillForm: true,
      currentSkill: skill,
      isEditingSkill: true,
      currentParentSkill:
        parentSkillIndex > -1 ? skills[parentSkillIndex] : undefined,
      currentSkilltree:
        parentSkilltreeIndex > -1
          ? this.state.skilltrees[parentSkilltreeIndex]
          : undefined,
    });
  }

  async updateSkill(skill: ISkill) {
    if (!this.state.currentSkilltree) return;
    await updateSkill(
      skill,
      this.state.currentSkilltree,
      this.state.currentParentSkill,
      this.state.isAddingRootSkillAtIndex,
      this.state.isEditingSkill
    );
    this.resetDefaultState();
  }

  toggleThemeEditor = () => {
    this.setState({
      showThemeEditor: !this.state.showThemeEditor,
      showOptionsEditor: false,
    });
  };

  toggleOptionsEditor = () => {
    this.setState({
      showOptionsEditor: !this.state.showOptionsEditor,
      showThemeEditor: false,
    });
  };

  toggleShareLinkModal = () => {
    this.setState({
      showShareLinkModal: !this.state.showShareLinkModal,
    });
  };

  render() {
    if (this.state.toEditor) {
      return <Redirect to={"/"} />;
    } else if (this.state.toSkillsTable) {
      return <Redirect to={"/skills"} />;
    } else if (!this.state.skilltrees) {
      return <Loading />;
    } else {
      return (
        <React.Fragment>
          <EditorNavbar
            composition={this.state.composition}
            changeCompositionTitle={this.handleCompositionChange}
            toggleShareLinkModal={this.toggleShareLinkModal}
          ></EditorNavbar>
          <DragDropContext
            onDragEnd={this.handleOnDragEnd}
            onDragStart={this.handleOnDragStart}
          >
            <div className="columns is-mobile mt-0" style={{minHeight: "90vh"}}>
              <div className="column is-narrow has-background-light" >
                <EditorMenu
                  id={this.props.match.params.compositionId}
                  hideDraggables={false}
                  hideSkillDraggables={this.state.skilltrees && this.state.skilltrees.length > 0 ? false : true}
                  toggleThemeEditor={this.toggleThemeEditor}
                  isVisibleThemeEditor={this.state.showThemeEditor}
                  toggleOptionsEditor={this.toggleOptionsEditor}
                  isVisibleOptionsEditor={this.state.showOptionsEditor}
                />
              </div>
              {this.state.showOptionsEditor && (
                <div
                  className="column is-4"
                >
                  <OptionsEditor
                    composition={this.state.composition}
                    handleChange={this.handleCompositionChange}
                  />
                </div>
              )}
              <div
                className="column mt-0"
                style={{
                  overflowY: "scroll",
                  overflowX: "hidden",
                  // ...editorDisplayStyles,
                }}
              >
                {this.state.composition && !this.state.showThemeEditor && (
                  <EditorDisplay
                    theme={this.state.composition.theme}
                    skilltrees={this.state.skilltrees || []}
                    composition={this.state.composition}
                    title={this.state.composition?.title || ""}
                    isDropDisabledSkilltrees={!this.state.enableDropSkilltrees}
                    isDropDisabledSkills={!this.state.enableDropSkills}
                    isDropDisabledSkilltree={!this.state.enableDropInSkilltree}
                    addSkilltree={this.addSkilltree}
                    editSkilltree={this.editSkilltree}
                    deleteSkilltree={this.prepareDeleteSkilltree}
                    editSkill={this.editSkill}
                  />
                )}
                {this.state.skilltrees &&
                  this.state.skilltrees.length > 0 &&
                  this.state.composition &&
                  this.state.showThemeEditor && (
                    <ThemeEditor
                      compositionId={this.state.composition.id || ""}
                      doneUpdatingTheme={this.toggleThemeEditor}
                    />
                  )}
              </div>
            </div>
          </DragDropContext>
          {this.state.showSkilltreeForm && (
            <SkilltreeForm
              isEditing={this.state.isEditingSkilltree}
              skilltree={this.state.currentSkilltree}
              closeModal={this.resetDefaultState}
              updateSkilltree={this.updateSkilltree}
              compositionId={this.props.match.params.compositionId}
              order={
                this.state.isEditingSkilltree
                  ? this.state.currentSkilltree?.order || 0
                  : this.state.skilltrees.length
              }
            />
          )}
          {this.state.showSkillForm && (
            <SkillForm
              isEditing={this.state.isEditingSkill}
              updateSkill={this.updateSkill}
              closeModal={this.resetDefaultState}
              skill={
                this.state.currentSkill
                  ? this.state.currentSkill
                  : { id: uuid(), ...standardEmptySkill }
              }
            />
          )}
          {this.state.showShareLinkModal && (
            <ShareLinkModal
              url={this.state.url}
              toggleShareLinkModal={this.toggleShareLinkModal}
            />
          )}
        </React.Fragment>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    hasDismissedWarning: state.ui.hasDismissedWarning,
    parentSkilltree: state.editor.parentSkilltree,
    hasStartedImportingSkills: state.editor.hasStartedImportingSkills,
    selectedSkills: state.editor.selectedSkills,
  };
}

export default connect(mapStateToProps)(Editor);
