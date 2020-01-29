import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class Submenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: props.open,
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle(event) {
    this.setState({
      open: !this.state.open,
    });
  }

  render() {
    const { children, text } = this.props;
    const { open } = this.state;
    const titleClass = classNames({
      submenu__title: true,
      'submenu__title--open': open,
    });

    const submenuClass = classNames({
      submenu: true,
      'submenu--hidden': !open,
      'submenu--shown': open,
    });

    return (
      <div>
        <span className={titleClass} onClick={this.toggle}>
          {text}
        </span>
        <ul className={submenuClass}>
          {children.map((listItem, index) => (
            <li className="submenu__item" key={index}>
              {listItem.children && listItem.children.length > 0 ? (
                <Submenu {...listItem} />
              ) : (
                <a href={listItem.url}>{listItem.text}</a>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

Submenu.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.object),
};
