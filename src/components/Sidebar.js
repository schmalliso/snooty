import React, { useLayoutEffect, useRef, useState } from 'react';
import Link from './Link';
import VersionDropdown from './VersionDropdown';
import TableOfContents from './TableOfContents';
import { formatText } from '../utils/format-text';
import style from '../styles/sidebar.module.css';

const Sidebar = ({ slug, repo_branches, toctreeData, toggleLeftColumn }) => {
  const { title } = toctreeData;

  // Calculate height of the fixed header so that the TOC can occupy the rest of the vertical space.
  const [fixedHeight, setFixedHeight] = useState(0);
  const fixedHeading = useRef(null);
  useLayoutEffect(() => {
    setFixedHeight(fixedHeading.current.clientHeight);
  }, []);

  const shouldDisplayVersions = repo_branches?.branches?.length > 1;

  return (
    <aside className={`sidebar ${style.sidebar}`} id="sidebar">
      <div className={`sphinxsidebar ${style.sphinxsidebar}`} id="sphinxsidebar">
        <div id="sphinxsidebarwrapper" className="sphinxsidebarwrapper">
          <div ref={fixedHeading}>
            <span className="closeNav" id="closeNav" onClick={toggleLeftColumn} style={{ cursor: 'pointer' }}>
              Close ×
            </span>
            <h3>
              <Link className="index-link" to="/">
                {formatText(title)}
              </Link>
            </h3>
            {shouldDisplayVersions && <VersionDropdown slug={slug} repo_branches={repo_branches} />}
          </div>
          <TableOfContents toctreeData={toctreeData} height={fixedHeight} activeSection={slug} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
