import React, { Component } from 'react'
import { Treebeard, decorators } from 'react-treebeard';
import {treebeardTheme} from '../compositions/StandardData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types';


const CustomHeader = ({ node, style, prefix }) =>
  <div style={style.base}>
    <div style={{ ...style.title, display: "flex" }}>
      {node.name}
    </div>
  </div>;

class CustomContainer extends decorators.Container {

    editSkill = (node) => {
        node.decorators.closeModal();
        setTimeout(() => node.decorators.editSkill(node), 100);
    }

    closeModal = (node) => {
        node.decorators.closeModal();
    }

    render() {
      const { style, decorators, terminal, onClick, node } = this.props;
      return (
        <div className="level">
        <div
          onClick={onClick}
          ref={ref => (this.clickableRef = ref)}
          style={{cursor: 'pointer'}}
          className="level-left"
        >
            <div className="level-item">
                {!terminal ? this.renderToggle() : null}
            </div>
            <div className="level-item">
                <decorators.Header node={node} style={style.header} />
            </div>
          
        </div>
        {node.isSkill && <div className="level-right">
            <div className="level-item has-text-success" style={{cursor: 'pointer'}}>
            <FontAwesomeIcon icon='plus' />
          </div>
            <div className="level-item has-text-info" onClick={() => this.editSkill(node)} style={{cursor: 'pointer'}}>
             <FontAwesomeIcon icon='edit' />
          </div>
          <div className="level-item has-text-danger" onClick={() => this.closeModal(node)} style={{cursor: 'pointer'}} >
            <FontAwesomeIcon icon='trash' />
          </div>
        </div>}
        </div>
      );
    }
  }

export class TreeView extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.onToggle = this.onToggle.bind(this);
      }

    onToggle(node, toggled) {
        if (this.state.cursor) {
          this.state.cursor.active = false;
        }
        node.active = true;
        if (node.children) {
          node.toggled = toggled;
        }
        this.setState({ cursor: node });
      }
    
      
    render() {
        decorators.Header = CustomHeader;
        decorators.Container = CustomContainer;

        return (
            <Treebeard
                style={treebeardTheme}
                data={this.props.data}
                decorators={decorators}
                onToggle={this.onToggle}
            />
        )
    }
}

TreeView.propTypes = {
    data: PropTypes.object.isRequired,
    editSkill: PropTypes.func.isRequired
};

export default TreeView
