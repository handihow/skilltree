import { Component } from "react";
import { standardData, standardTheme } from "../../services/StandardData";
import IComposition from "../../models/composition.model";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { hideModal } from "../../actions/ui";

interface IAddCompositionProps {
  addComposition: Function;
  isEditingTitle: boolean;
  composition?: IComposition;
  updateCompositionTitle: Function;
  dispatch: any;
}

interface IAddCompositionState {
  title: string;
}

export class AddComposition extends Component<
  IAddCompositionProps,
  IAddCompositionState
> {
  constructor(props: IAddCompositionProps) {
    super(props);
    this.state = {
      title: props.isEditingTitle && props.composition ? props.composition.title : "",
    };
  }

  onChange = (e) => this.setState({ title: e.target.value });

  onSubmit = (e) => {
    e.preventDefault();
    if (this.state.title.length === 0) {
      toast.error("Please enter a title for the SkillTree...");
      return;
    }
    if (this.props.isEditingTitle) {
      this.props.updateCompositionTitle(this.state.title);
    } else {
      this.props.addComposition(this.state.title, standardTheme, standardData);
    }
    this.setState({ title: "" });
  };

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <section className="modal-card-body">
          <div className="control box p-1">
            <input
              className="input is-focused"
              type="text"
              autoFocus
              placeholder="Title new SkillTree..."
              value={this.state.title}
              onChange={this.onChange}
            />
          </div>
        </section>
        <footer className="modal-card-foot">
        <button className="button" onClick={()=> this.props.dispatch(hideModal())}>
            Cancel
          </button>
          <button className="is-primary button">Save</button>
        </footer>
      </form>
    );
  }
}

export default connect()(AddComposition);
