import React, { Component } from "react";
import { isURL, isEmpty } from "validator";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LinkCard from "../../layout/LinkCard";
import ISkill from "../../../models/skill.model";
import ILink from "../../../models/link.model";
import { db } from "../../../firebase/firebase";
import RichTextEditor from "react-rte";
import { toolbarConfig } from "../../../services/StandardData";
import { connect } from "react-redux";
import { showModal } from "../../../actions/ui";

interface ISkillFormProps {
  isEditing: boolean;
  updateSkill: Function;
  toggleSkillEditor: Function;
  skill?: ISkill;
  dispatch: any;
}

interface ISkillFormState {
  description: any;
  title: string;
  optional: boolean;
  direction: string;
  links: ILink[];
}

export class SkillForm extends Component<ISkillFormProps, ISkillFormState> {
  constructor(props: ISkillFormProps) {
    super(props);
    this.state = {
      description: this.props.skill?.description
        ? RichTextEditor.createValueFromString(
            this.props.skill.description,
            "html"
          )
        : RichTextEditor.createEmptyValue(),
      title: this.props.skill?.title ? this.props.skill.title : "",
      optional: this.props.skill?.optional ? this.props.skill.optional : false,
      direction: this.props.skill?.direction
        ? this.props.skill.direction
        : "bottom",
      links:
        this.props.skill?.links && this.props.skill.links.length > 0
          ? this.props.skill.links
          : []
    };
  }

  toggleLinkModal = () => {
    const { dispatch } = this.props;
    dispatch(showModal({id: "link", title: "Add link", addLink: this.addLink}));
  };

  toggleYouTubeModal = () => {
    const { dispatch } = this.props;
    dispatch(showModal({id: "youtube", title: "Search YouTube", addLink: this.addLink}));
  };

  toggleFileModal = () => {
    const { dispatch } = this.props;
    dispatch(showModal({id: "file", title: "Upload file", addLink: this.addLink}));
  };

  handleTitleChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      title: e.currentTarget.value,
    });
  };

  handleDescriptionChange = (value) => {
    this.setState({
      description: value,
    });
  };

  handleOptionalChange = (value: string) => {
    this.setState({
      optional: value === "true" ? true : false,
    });
  };

  handleTooltipChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      direction: e.currentTarget.value,
    });
  };

  onSubmit = (e: any) => {
    e.preventDefault();
    let hasError = false;
    // form validation
    if (
      isEmpty(this.state.title) ||
      isEmpty(this.state.description.toString("html"))
    ) {
      hasError = true;
      toast.error("Title and description cannot be empty");
    } else if (this.state.links && this.state.links.length > 0) {
      this.state.links.forEach((link, index) => {
        if (
          isEmpty(link.title) ||
          isEmpty(link.iconName) ||
          !isURL(link.reference)
        ) {
          hasError = true;
          toast.error(
            "Link number " +
              (index + 1) +
              " does not have title or icon, or does not contain a valid URL"
          );
        }
      });
    }
    if (hasError) return;
    const updatedSkill = {
      ...this.props.skill,
      title: this.state.title,
      description: this.state.description.toString("html"),
      optional: this.state.optional,
      links: this.state.links,
      direction: this.state.direction,
    };
    this.props.updateSkill(updatedSkill);
  };

  addLink = (link: ILink) => {
    if (this.props.skill?.path) {
      db.doc(this.props.skill.path)
        .update({ links: [...(this.state.links || []), link] })
        .then((_) => {
          this.setState({
            links: [...(this.state.links || []), link],
          });
          toast.info("Successfully added a link to the skill");
        })
        .catch((e) => toast.error(e));
    } else if (this.props.skill) {
      //this is a new skill
      this.setState({
        links: [...(this.state.links || []), link],
      });
    }
  };

  deleteLink = (id: string) => {
    this.setState({
      links: [...this.state.links.filter((l) => l.id !== id)],
    });
  };

  render() {
    return (
      <div className="m-3">
        <div className="level">
          <div className="level-left">
            <div className="title is-6">
              <span className="icon">
                <FontAwesomeIcon icon="pen"></FontAwesomeIcon>
              </span>
              {this.props.isEditing
                ? "Editing " + this.props.skill?.title
                : "Add skill"}
            </div>
          </div>
          <div className="level-right">
            <button
              className="delete"
              onClick={() => this.props.toggleSkillEditor()}
            ></button>
          </div>
        </div>
        <form onSubmit={this.onSubmit}>
          <div className="field">
            <label className="label" htmlFor="title">
              Title
            </label>
            <div className="control">
              <input
                className="input"
                name="title"
                type="text"
                placeholder="title"
                required
                onChange={this.handleTitleChange}
                value={this.state.title}
              />
            </div>
          </div>
          <React.Fragment>
            <div className="field-group">
              <div className="field is-inline-block-mobile">
                <div className="field is-narrow">
                  <label className="label">Optional skill</label>
                  <div className="control">
                    <label className="radio">
                      <input
                        type="radio"
                        name="optional"
                        checked={!this.state.optional}
                        onChange={() => this.handleOptionalChange("false")}
                      />
                      <span style={{ marginLeft: "5px" }}>Not optional</span>
                    </label>
                    <label className="radio">
                      <input
                        type="radio"
                        name="optional"
                        checked={this.state.optional}
                        onChange={() => this.handleOptionalChange("true")}
                      />
                      <span style={{ marginLeft: "5px" }}>Optional</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="description">
                Description
              </label>
              <div className="control">
                <RichTextEditor
                  value={this.state.description}
                  onChange={this.handleDescriptionChange}
                  toolbarConfig={toolbarConfig}
                />
              </div>
            </div>

            <div
              className="field is-inline-block-desktop"
              style={{ marginLeft: "20px" }}
            >
              <div className="field is-narrow">
                <label className="label">Tooltip direction</label>
                <div className="control">
                  {["top", "left", "right", "bottom"].map((direction) => (
                    <label className="radio" key={direction}>
                      <input
                        type="radio"
                        name="direction"
                        value={direction}
                        checked={
                          this.state.direction === direction ? true : false
                        }
                        onChange={this.handleTooltipChange}
                      />
                      <span style={{ marginLeft: "5px" }}>{direction}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </React.Fragment>
          <div className="buttons">
            <button
              className="button has-tooltip-multiline"
              data-tooltip="Add YouTube video"
              onClick={this.toggleYouTubeModal}
              type="button"
            >
              <span className="icon is-small">
                <FontAwesomeIcon icon={["fab", "youtube-square"]} />
              </span>
            </button>
            <button
              className="button has-tooltip-multiline"
              data-tooltip="Add file"
              onClick={this.toggleFileModal}
              type="button"
            >
              <span className="icon is-small">
                <FontAwesomeIcon icon={"file"} />
              </span>
            </button>
            <button
              className="button has-tooltip-multiline"
              data-tooltip="Add link"
              onClick={this.toggleLinkModal}
              type="button"
            >
              <span className="icon is-small">
                <FontAwesomeIcon icon={"link"} />
              </span>
            </button>
          </div>
          <ul style={{ listStyleType: "none", marginTop: "10px", marginBottom: "10px" }}>
            {this.state.links.length > 0 &&
              this.state.links.map((link, index) => (
                <LinkCard
                  link={link}
                  key={index}
                  deleteLink={this.deleteLink}
                />
              ))}
          </ul>
          <button className="button is-success">Save changes</button>
        </form>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    dismissedModal: state.ui.dismissedModal
  };
}

export default connect(mapStateToProps)(SkillForm);
