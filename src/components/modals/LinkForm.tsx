import React, { Component } from "react";
import ILink from "../../models/link.model";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";
import normalize from "normalize-url";
import { connect } from "react-redux";
import { hideModal } from "../../actions/ui";

interface ILinkFormProps {
  addLink: Function;
  dispatch: any;
}

interface ILinkFormState {
  url?: string;
  doneScraping: boolean;
  link?: ILink;
}

export class LinkForm extends Component<ILinkFormProps, ILinkFormState> {
  constructor(props: ILinkFormProps) {
    super(props);
    this.state = {
      doneScraping: false,
    };
  }

  closeModal = () => {
    this.setState({
      url: undefined,
      doneScraping: false,
      link: undefined,
    });
    this.props.dispatch(hideModal());
  };

  saveLink = () => {
    this.props.addLink(this.state.link);
    this.closeModal();
  };

  changeUrl = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      url: e.currentTarget.value,
    });
  };

  startScraping = () => {
    if (this.state.url) {
      const normalizedUrl = normalize(this.state.url, { forceHttps: true });
      const link: ILink = {
        id: uuid(),
        iconName: "link",
        iconPrefix: "fas",
        reference: normalizedUrl,
        title: normalizedUrl,
        description: "",
        imageUrl:
          "https://cdn.pixabay.com/photo/2014/04/02/14/08/mouse-306274_1280.png",
      };
      this.setState({
        link: link,
        doneScraping: true,
        url: normalizedUrl
      });
    } else {
      toast.error("Please enter a valid url...");
    }
  };

  handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    if (this.state.link) {
      this.setState({
        link: {
          ...this.state.link,
          [e.currentTarget.name]: e.currentTarget.value,
        },
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <section className="modal-card-body">
          <div className="field has-addons">
            <div className="control is-expanded">
              <input
                className="input"
                type="text"
                placeholder="Enter valid url"
                name="url"
                onChange={this.changeUrl}
                value={this.state.url ? this.state.url : ""}
              />
              <p className="help">
                Enter a valid url and then click add
              </p>
            </div>
            <div className="control">
              <button className="button" onClick={this.startScraping}>
                Add
              </button>
            </div>
          </div>
          {this.state.doneScraping && (
            <React.Fragment>
              <div>
                You can now click save to add it to the skill, or change the
                title and description first.
              </div>
              <hr></hr>
              <div className="field">
                <label className="label">Title</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Enter title"
                    name="title"
                    onChange={this.handleChange}
                    value={
                      this.state.link && this.state.link.title
                        ? this.state.link.title
                        : ""
                    }
                  />
                </div>
                <p className="help">
                  You can change the title displayed on the link
                </p>
              </div>
              <div className="field">
                <label className="label">Description</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Enter description (optional)"
                    name="description"
                    onChange={this.handleChange}
                    value={
                      this.state.link && this.state.link.description
                        ? this.state.link.description
                        : ""
                    }
                  />
                  <p className="help">
                    You can enter a description of the link
                  </p>
                </div>
              </div>
            </React.Fragment>
          )}
        </section>
        <footer className="modal-card-foot">
          <button className="button" onClick={this.closeModal}>
            Cancel
          </button>
          <button
            className="button is-success"
            onClick={this.saveLink}
            disabled={this.state.link ? false : true}
          >
            Save
          </button>
        </footer>
      </React.Fragment>
    );
  }
}

export default connect()(LinkForm);
