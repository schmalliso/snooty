import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import ComponentFactory from './ComponentFactory';
import Pills from './Pills';
import { TabContext } from './tab-context';
import { stringifyTab } from '../constants';
import { getNestedValue } from '../utils/get-nested-value';
import { makeId } from '../utils/make-id';

const GuideHeading = ({ author, cloud, description, drivers, completionTime, title, titleId, ...rest }) => {
  const { activeTabs } = useContext(TabContext);
  const descriptionChildren = getNestedValue(['children'], description);
  return (
    <div className="section">
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <h1 id={titleId || makeId(title)}>
        {title}
        <a className="headerlink" href={`#${titleId}`} title="Permalink to this headline">
          ¶
        </a>
      </h1>

      {cloud && cloud.length > 0 && (
        <div className="guide-prefs">
          <div className="guide-prefs__caption">
            Deployment Type:
            <span className="show-current-deployment"> {stringifyTab(getNestedValue(['cloud'], activeTabs))}</span>
          </div>
          <Pills
            pills={cloud}
            liClass="guide__deploymentpill"
            activeClass="guide__deploymentpill--active"
            pillsetName="cloud"
            dataTabPreference="deployments"
          />
        </div>
      )}

      {drivers && drivers.length > 0 && (
        <div className="guide-prefs">
          <div className="guide-prefs__caption">
            Client:
            <span className="show-current-language"> {stringifyTab(getNestedValue(['drivers'], activeTabs))}</span>
          </div>
          <Pills pills={drivers} pillsetName="drivers" dataTabPreference="languages" />
        </div>
      )}

      <hr />

      {author && <p>Author: {author}</p>}
      {descriptionChildren && (
        <section>
          {descriptionChildren.map((element, index) => (
            <ComponentFactory {...rest} nodeData={element} key={index} />
          ))}
        </section>
      )}
      {completionTime && (
        <p>
          <em>Time required: {completionTime} minutes</em>
        </p>
      )}
    </div>
  );
};

GuideHeading.propTypes = {
  author: PropTypes.string.isRequired,
  cloud: PropTypes.arrayOf(PropTypes.string),
  completionTime: PropTypes.string.isRequired,
  description: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  drivers: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string.isRequired,
  titleId: PropTypes.string,
};

GuideHeading.defaultProps = {
  cloud: [],
  drivers: [],
};

export default GuideHeading;
