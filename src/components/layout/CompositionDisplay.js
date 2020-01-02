import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    SkillTreeGroup,
    SkillTree,
    SkillProvider,
    // SkillType,
    // SkillGroupDataType,
  } from 'beautiful-skill-tree';

class CompositionDisplay extends Component {

    render(){
        return (
            <SkillProvider>
                <SkillTreeGroup theme={this.props.theme}>
                {({ skillCount }) => (
                    <React.Fragment>
                      {this.props.skilltrees.map((skilltree) =>(
                        <SkillTree
                            key={skilltree.id}
                            treeId={skilltree.id}
                            title={skilltree.title}
                            data={skilltree.data}
                            collapsible={skilltree.collapsible}
                            description={skilltree.description}
                        />
                      ))}
                    </React.Fragment>
                )}
                </SkillTreeGroup>
            </SkillProvider>
        )
    }
}

CompositionDisplay.propTypes = {
    theme: PropTypes.object.isRequired,
    skilltrees: PropTypes.array.isRequired,
};

export default CompositionDisplay;
