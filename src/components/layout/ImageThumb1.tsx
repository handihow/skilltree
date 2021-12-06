import React, { Component } from "react";
import { storage } from "../../firebase/firebase";
import { db } from "../../firebase/firebase";
import IBackgroundImage from "../../models/backgroundimage.model";
import firebase from "firebase/app";
import { toast } from "react-toastify";

interface IImageThumb1Props {
  image: IBackgroundImage;
  compositionId: string;
  doneUpdatingBackground: Function;
}

interface IImageThumb1State {
  reference: string;
}

export class ImageThumb1 extends Component<
  IImageThumb1Props,
  IImageThumb1State
> {
  constructor(props: IImageThumb1Props) {
    super(props);
    this.state = {
      reference: "https://via.placeholder.com/300x200.png?text=Skilltree",
    };
  }

  componentDidMount() {
    const storageRef = storage.ref();
    const imageRef = storageRef.child(this.props.image.thumb1);
    imageRef.getDownloadURL().then((url) => {
      this.setState({ reference: url });
    });
  }

  selectBackground = () => {
    db.collection("compositions")
      .doc(this.props.compositionId)
      .set(
        {
          backgroundImage: this.props.image.reference,
          thumbnailImage: this.props.image.thumb2,
          hasBackgroundImage: true,
          lastUpdate: firebase.firestore.Timestamp.now(),
        },
        { merge: true }
      )
      .then((_) => {
        toast.info(
          "Applied " + this.props.image.title + " as background image."
        );
        this.props.doneUpdatingBackground();
      });
  };

  render() {
    return (
      <a href="# " onClick={this.selectBackground} className="card">
        <div className="card-header">
          <div className="card-header-title">{this.props.image.title}</div>
        </div>
        <div className="card-image">
          <figure className="image is-3-by-2">
            <img src={this.state.reference} alt=""></img>
          </figure>
        </div>
        
      </a>
    );
  }
}

export default ImageThumb1;
