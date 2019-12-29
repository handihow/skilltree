import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    SkillTreeGroup,
    SkillTree,
    SkillProvider,
    SkillType,
    SkillGroupDataType,
  } from 'beautiful-skill-tree';

class CompositionDisplay extends Component {

    render(){
        return (
            <SkillProvider>
                <SkillTreeGroup theme={this.props.composition.theme}>
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

export default CompositionDisplay;
