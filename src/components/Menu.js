import React from 'react';
import PropTypes from 'prop-types';

const Menu = ({ children }) => <ul className="menu">{children}</ul>;

Menu.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node),
};

export default Menu;
