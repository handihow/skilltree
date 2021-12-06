import React, { Component } from "react";
import { db } from "../../../firebase/firebase";
import ImageThumb1 from "../../layout/ImageThumb1";
import ImageUploader from "../../layout/ImageUploader";
import BackgroundImage from "../../../models/backgroundimage.model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from "../../layout/Header";
import { Redirect, RouteComponentProps } from "react-router-dom";
import BackButton from "../../layout/BackButton";
import { toast } from "react-toastify";

type TParams = { compositionId: string };

interface IBackgroundEditorState {
  images: BackgroundImage[];
  doneUpdatingBackground: boolean;
}

export class BackgroundEditor extends Component<
  RouteComponentProps<TParams>,
  IBackgroundEditorState
> {
  constructor(props: RouteComponentProps<TParams>) {
    super(props);
    this.state = {
      doneUpdatingBackground: false,
      images: [],
    };
  }

  componentDidMount() {
    const currentComponent = this;
    db.collection("backgrounds")
      .orderBy("title")
      .get()
      .then((snapshots) => {
        const imageData: BackgroundImage[] = [];
        snapshots.forEach((snap) =>
          imageData.push(snap.data() as BackgroundImage)
        );
        currentComponent.setState({
          images: imageData,
        });
      });
  }

  removeBackground = () => {
    db.collection("compositions")
      .doc(this.props.match.params.compositionId)
      .update({
        hasBackgroundImage: false,
      })
      .then((_) => {
        toast.info("Removed the background image");
        this.setState({
          doneUpdatingBackground: true,
        });
      });
  };

  render() {
    const compositionId = this.props.match.params.compositionId;
    if (this.state.doneUpdatingBackground) {
      return <Redirect to={"/editor/" + compositionId} />;
    }
    return (
      <React.Fragment>
        <div className="level is-mobile p-4 has-background-light">
          <div className="level-left">
            <div className="level-item">
              <Header header="Background" icon="image"></Header>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <button
                className="button is-danger has-tooltip-bottom has-tooltip-multiline"
                onClick={this.removeBackground}
                data-tooltip="Remove background"
              >
                <span className="icon">
                  <FontAwesomeIcon icon="trash" />
                </span>
                <span>Remove</span>
              </button>
            </div>
            <div className="level-item">
              <ImageUploader
                compositionId={compositionId}
                doneUpdatingBackground={() =>
                  this.setState({ doneUpdatingBackground: true })
                }
              />
            </div>
            <div className="level-item">
              <BackButton></BackButton>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="columns is-multiline">
            {this.state.images.map((image) => (
              <div className="column is-half-tablet is-one-third-desktop is-one-quarter widescreen">
                <ImageThumb1
                  key={image.id}
                  image={image}
                  compositionId={compositionId}
                  doneUpdatingBackground={() =>
                    this.setState({ doneUpdatingBackground: true })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default BackgroundEditor;
