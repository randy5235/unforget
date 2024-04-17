import { useRouter } from './router.jsx';
import React, { useCallback, useState } from 'react';
import * as actions from './appStoreActions.jsx';
import { Menu, MenuItem } from './Menu.jsx';
import * as storage from './storage.js';
import * as util from './util.js';
import * as cutil from '../common/util.js';
import * as appStore from './appStore.js';
import _ from 'lodash';
import * as icons from './icons.js';
import log from './logger.js';

export function PageLayout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}

export function PageHeaderCompact() {
  return (
    <div id="page-header" className="compact">
      <h1 className="heading">Unforget</h1>
    </div>
  );
}

export function PageHeader(props: {
  menu?: MenuItem[];
  actions?: React.ReactNode;
  title?: string;
  hasSticky?: boolean;
  hasSearch?: boolean;
}) {
  const app = appStore.use();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = util.useCallbackCancelEvent(() => setMenuOpen(x => !x), []);

  const fullSync = useCallback(() => {
    storage.fullSync();
    actions.showMessage('Syncing ...');
  }, []);

  const forceCheckAppUpdate = useCallback(() => {
    actions.forceCheckAppUpdate();
    actions.showMessage('Checking for updates ...');
  }, []);

  const about = useCallback(() => {
    alert(
      `\nUnforget\n\nMade by Computing Den.\n\nsean@computing-den.com\n\n\n[cache version ${cutil.CACHE_VERSION}]\n`,
    );
  }, []);

  const router = useRouter();

  const goToNotes = util.useCallbackCancelEvent(() => {
    if (router.pathname === '/') {
      window.scrollTo(0, 0);
    } else {
      history.pushState(null, '', '/');
    }
  }, [router]);

  const goToArchive = useCallback(() => {
    if (router.pathname !== '/archive') history.pushState(null, '', '/archive');
  }, [router]);

  const goToLogin = useCallback(() => {
    if (router.pathname !== '/login') history.pushState(null, '', '/login');
  }, [router]);

  const goToImport = useCallback(() => {
    if (router.pathname !== '/import') history.pushState(null, '', '/import');
  }, [router]);

  const goToExport = useCallback(() => {
    if (router.pathname !== '/export') history.pushState(null, '', '/export');
  }, [router]);

  let menu: MenuItem[] | undefined;
  if (app.user) {
    menu = _.compact([
      { label: _.upperFirst(app.user.username), icon: icons.user, isHeader: true },
      app.user.username === 'demo' && { label: 'Log in / Sign up', icon: icons.logIn, onClick: goToLogin },
      ...(props.menu || []),
      { label: 'Notes', icon: icons.notes, onClick: goToNotes },
      { label: 'Archive', icon: icons.archiveEmpty, onClick: goToArchive },
      { label: 'Import', icon: icons.import, onClick: goToImport },
      { label: 'Export', icon: icons.export, onClick: goToExport },
      { label: 'About', icon: icons.info, onClick: about },
      { label: 'Full sync', icon: icons.refreshCcw, onClick: fullSync, hasTopSeparator: true },
      { label: 'Check app updates', icon: icons.refreshCcw, onClick: forceCheckAppUpdate },
      { label: 'Log out', icon: icons.logOut, onClick: actions.logout, hasTopSeparator: true },
    ]);
  }

  // const { isLoading } = useRouterLoading();
  // log('PageLayout: isLoading: ', isLoading);

  return (
    <div id="page-header" className={`${props.hasSearch ? 'has-search' : ''}`}>
      <div className="content">
        {!_.isEmpty(menu) && (
          <div className="menu-button-container">
            <div className="menu-button">
              <a href="#" onClick={toggleMenu} className="reset" id="page-header-menu-trigger">
                <img src={icons.menuWhite} />
              </a>
              {menuOpen && <Menu menu={menu!} side="left" onClose={toggleMenu} trigger="#page-header-menu-trigger" />}
            </div>
          </div>
        )}
        <div className="title">
          {/*
          <div className="logo">
            <Link to="/">
              <img src="/barefront.svg" />
            </Link>
            </div>
            */}
          <h1 className="heading">
            <a href="/" className="reset" onClick={goToNotes}>
              Unforget
            </a>
          </h1>
          {props.title && <h2>{props.title}</h2>}
          {app.user?.username !== 'demo' && app.queueCount > 0 && <div className="queue-count">({app.queueCount})</div>}
          {/*app.online && <div className="online-indicator" />*/}
        </div>
        <div className="actions">{props.actions}</div>
      </div>
      {app.message && (
        <div className={`msg-bar ${app.message.type} ${props.hasSticky ? 'has-sticky' : ''}`}>
          <div className="msg-bar-inner-container">
            <p>{app.message.text.substring(0, 100)}</p>
          </div>
        </div>
      )}
      {app.requirePageRefresh && (
        <div className="update-app-container">
          <button className="primary" onClick={actions.updateApp}>
            Update app
          </button>
        </div>
      )}
    </div>
  );
}

export function PageBody(props: { children: React.ReactNode }) {
  return props.children;
}

export function PageAction(props: {
  className?: string;
  label?: string;
  icon?: string;
  onClick?: () => any;
  bold?: boolean;
  menu?: MenuItem[];
  title: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = util.useCallbackCancelEvent(() => setMenuOpen(x => !x), []);
  const clicked = util.useCallbackCancelEvent(() => {
    if (props.menu) toggleMenu();
    props.onClick?.();
  }, [props.menu, props.onClick]);

  // We need action-container because <a> cannot be nested inside another <a> which we need for the menu.
  return (
    <div
      className={`action ${props.className || ''}`}
      key={`${props.label || '_'} ${props.icon || '_'}`}
      title={props.title}
    >
      <a href="#" onClick={clicked} className={`page-action-menu-trigger reset ${props.bold ? 'bold' : ''}`}>
        {props.label}
        {props.icon && <img src={props.icon} />}
      </a>
      {props.menu && menuOpen && (
        <Menu menu={props.menu} side="center" onClose={toggleMenu} trigger=".page-action-menu-trigger" />
      )}
    </div>
  );
}
