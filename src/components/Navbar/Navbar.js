import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Velocity from 'velocity-animate';
import Link from '../Link';
import NavbarDropdown from './NavbarDropdown';
import SearchBar from './SearchBar';

const RocketDownloadIcon = () => {
  return (
    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
      <g id="Icons" fill="#13aa52">
        <path
          class="cls-1"
          d="M15.67.32a.79.79,0,0,0-.76-.2,18.67,18.67,0,0,0-3.77,1.22l3.51,3.51a18.64,18.64,0,0,0,1.22-3.77A.79.79,0,0,0,15.67.32Z"
        />
        <path class="cls-1" d="M8,3.5,2.31,9.22l4.45,4.45L12.49,8a11,11,0,0,0,1.35-1.68L9.72,2.15A11,11,0,0,0,8,3.5Z" />
        <path
          class="cls-1"
          d="M1.2,11.45C.28,12.37.09,15.91.09,15.91s3.53-.19,4.45-1.11a2.34,2.34,0,0,0,.68-1.55L2.75,10.77A2.34,2.34,0,0,0,1.2,11.45Z"
        />
        <polygon class="cls-1" points="4.83 5.88 1.2 5.88 0.09 7 1.9 8.81 4.83 5.88" />
        <polygon class="cls-1" points="8.99 15.91 10.11 14.79 10.11 11.18 7.19 14.1 8.99 15.91" />
      </g>
    </svg>
  );
};

export default class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableMarian: true,
    };

    this.navbarRef = React.createRef();
    this.linksRef = React.createRef();
    this.downloadRef = React.createRef();
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.animateSearch(this.inputRef.current);

    if (this.state.enableMarian) {
      let label = document.body.getAttribute('data-project-title');
      this.searchProperties = document.body.getAttribute('data-search-properties');
      if (this.searchProperties === null) {
        const projectName = process.env.GATSBY_SITE;
        const projectBranch = process.env.GATSBY_PARSER_BRANCH;
        this.searchProperties = `${projectName}-${projectBranch}`;

        if (label) {
          if (projectBranch && projectBranch !== 'master') {
            label += ` ${projectBranch}`;
          }
        }
      }

      return;
    }
  }

  // Animate the search bar on focus, blur and window resize
  animateSearch = input => {
    // Set the initial size of the search bar depending on browser size
    input.style.width = this.calculateBlurredWidth();

    // Width of the search bar must be set manually when in or out of focus
    input.onfocus = () => {
      // Stop any executing animations, then start expanding
      Velocity(input, 'stop');
      Velocity(input, { width: this.calculateFocusWidth() }, { duration: 200 });
    };

    input.onblur = () => {
      // Stop any executing animations, then start collapsing
      Velocity(input, 'stop');
      Velocity(input, { width: this.calculateBlurredWidth() }, { duration: 200 });
    };

    // Resize search bar when the browser is resized
    window.addEventListener('resize', () => {
      document.querySelector('.navbar-search').style.width = this.calculateBlurredWidth();
    });
  };

  // Calculates the size of the search bar when it's not in focus
  calculateBlurredWidth = () => {
    const totalWidth = this.navbarRef.current.clientWidth;
    const linksWidth = this.linksRef.current.clientWidth;
    const downloadWidth = this.downloadRef.current.clientWidth;

    const searchWidth = totalWidth - (linksWidth + downloadWidth);

    // Return as a string to forcefeed to velocity.js
    return `${searchWidth}px`;
  };

  // Calculates the size of the search bar when it's in focus, cursor
  calculateFocusWidth = () => {
    return `${document.querySelector('.navbar__right').clientWidth}px`;
  };

  render() {
    const NavbarDownloadButton = ({ innerRef }) => {
      const dataProject = document.body.getAttribute('data-project');
      const dataProjectIsAtlas = dataProject === 'atlas';
      const linkText = dataProjectIsAtlas ? 'Deploy a free cluster' : 'Get MongoDB';
      const linkUrl = `https://www.mongodb.com/download-center?utm_source=${dataProject}&utm_campaign=download-mongodb-navbar-cta&utm_medium=docs`;
      const linkIcon = dataProjectIsAtlas ? <RocketDownloadIcon /> : '';

      return (
        <div className="navbar-download" ref={innerRef}>
          <Link to={linkUrl} className="navbar-download__text">
            {linkText}
          </Link>
          {linkIcon}
        </div>
      );
    };

    const linkElements = this.props.menuLinks[1].children
      .filter(link => link.topNav)
      .map((link, i) => {
        const isActive = () => link.childSlugs.some(slug => slug === process.env.GATSBY_SITE);

        const linkClass = classNames({
          'navbar-links__item': true,
          'navbar-links__item--active': isActive(),
        });

        return (
          <Link to={link.url} key={i} className={linkClass}>
            {link.textShort || link.text}
          </Link>
        );
      });

    return (
      <React.Fragment>
        <nav className="navbar">
          <div className="navbar__left">
            <a href="https://www.mongodb.com/">
              <img src="https://docs.mongodb.com/images/mongodb-logo.png" className="navbar-brand" alt="MongoDB Logo" />
            </a>

            <span className="navbar-seperator"></span>

            <NavbarDropdown links={this.props.menuLinks} />
          </div>

          <div className="navbar__right" ref={this.navbarRef}>
            <div className="navbar-links" ref={this.linksRef}>
              {linkElements}
            </div>

            <NavbarDownloadButton innerRef={this.downloadRef} />
            {this.state.enableMarian && <SearchBar innerRef={this.inputRef} key={this.props.slug} />}
          </div>
        </nav>
      </React.Fragment>
    );
  }
}

Navbar.propTypes = {
  menuLinks: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string))),
  slug: PropTypes.string.isRequired,
};
