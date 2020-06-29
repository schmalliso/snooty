import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@leafygreen-ui/icon';

const RoleIcon = ({ nodeData: { target, name } }) => {
  if (name === 'icon') {
    return <i class={`${target} fas`}></i>;
    // return <Icon glyph={`${target}`} fill="#FF0000" />;
  } else {
    return <i class={`${target} fa`}></i>;
  }
};

RoleIcon.propTypes = {
  nodeData: PropTypes.shape({
    target: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default RoleIcon;
