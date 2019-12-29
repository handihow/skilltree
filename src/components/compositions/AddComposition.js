import React, { Component } from 'react'

const standardTheme = {
    backgroundColor: 'transparent',
    border: '2px solid white',
    borderRadius: '4px',
    primaryFont: 'Nunito',
    primaryFontColor: 'white',
    treeBackgroundColor: 'rgba(0, 0, 0, .6)',
    headingFont: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
    headingFontColor: 'white',
    headingFontSize: '24px',
    headingHoverColor: 'rgba(0, 0, 0, .6)',
    headingHoverColorTransition: 'background 0.3s ease-out',
    tooltipBackgroundColor: 'white',
    tooltipFontColor: '#16181c',
    tooltipZIndex: 99999,
    nodeBackgroundColor: '#282c34',
    nodeBorderColor: 'white',
    nodeAlternativeFontColor: 'white',
    nodeAltenativeActiveFontColor: 'white',
    nodeOverlayColor: 'white',
    nodeAlternativeActiveBackgroundColor: `
    linear-gradient(
      to right,
      #b9e562 0%,
      #41e2bd 50%,
      #c284d8 100%
    )`,
    nodeActiveBackgroundColor: `linear-gradient(
        to right,
        #b9e562 0%,
        #41e2bd 50%,
        #c284d8 100%
      )`,
    nodeHoverBorder: '4px solid',
    nodeHoverBorderColor: `linear-gradient(
        to right,
        #b9e562 0%,
        #41e2bd 50%,
        #c284d8 100%
      )`,
    nodeIconWidth: '64px',
    nodeMobileTextNodeHeight: '32px',
    nodeMobileTextNodeWidth: '108px',
    nodeMobileFontSize: '14px',
    nodeDesktopTextNodeHeight: '28px',
    nodeDesktopTextNodeWidth: '144px',
    nodeDesktopFontSize: '16px',
    edgeBorder: '1px solid white',
  }

const standardData = [
    {
      id: 'hello-world',
      title: 'Hello World',
      tooltip: {
        content:
          'This node is the top most level, and will be unlocked, and ready to be clicked.',
      },
      children: [
        {
          id: 'hello-sun',
          title: 'Hello Sun',
          tooltip: {
            content:
              'This is a child of the top node, and will be locked while the parent isn’t in a selected state.',
          },
          children: [],
        },
        {
          id: 'hello-stars',
          title: 'Hello Stars',
          tooltip: {
            content:
              'This is the child of ‘Hello World and the sibling of ‘Hello Sun’. Notice how the app takes care of the layout automatically?',
          },
          children: [],
        },
      ],
    },
  ];

export class AddComposition extends Component {

    state = {
        title: ''
    }

    onChange = (e) => this.setState({title: e.target.value});

    onSubmit = (e) => {
        e.preventDefault();
        this.props.addComposition(this.state.title, standardTheme, standardData);
        this.setState({title: ''});
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <div className="field is-fullwidth has-addons">
                <div className="control">
                <input 
                    className="input" 
                    type="text" 
                    placeholder="Title of skill tree..."
                    value={this.state.title}
                    onChange={this.onChange} />
                </div>
                <p className="control">
                    <button className="button">
                    Submit
                    </button>
                </p>
                </div>
            </form>
        )
    }
}

export default AddComposition
