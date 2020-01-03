import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Menu from './Menu';
import Submenu from './Submenu';
import classNames from 'classnames';

export default class NavbarDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle(event) {
    this.setState({
      open: !this.state.open,
    });
  }

  render() {
    const dropDownClass = classNames({
      'navbar-dropdown': true,
      'navbar-dropdown--open': this.state.open,
    });

    const menuClass = classNames({
      'navbar-dropdown__menu': true,
      'navbar-dropdown__menu--hidden': !this.state.open,
      'navbar-dropdown__menu--shown': this.state.open,
    });

    return (
      <div className={dropDownClass}>
        <span className="navbar-dropdown__label" onClick={this.toggle}>
          Documentation
        </span>

        <div className={menuClass}>
          <Menu>
            {this.props.links.map((link, index) => (
              <li className="menu__item">
                {link.children && link.children.length > 0 ? <Submenu {...link} /> : <a href={link.url}>{link.text}</a>}
              </li>
            ))}
          </Menu>
        </div>
      </div>
    );
  }
}

NavbarDropdown.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      children: PropTypes.array,
      open: PropTypes.bool,
      text: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ),
};
