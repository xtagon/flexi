/* eslint-env node */
'use strict';

const CHALK = require('chalk');
const SEMVER = require('semver');

module.exports = {
  name: 'flexi',

  included(app, parentAddon) {
    this._super.included.apply(this, arguments);

    // Quick fix for add-on nesting
    // https://github.com/aexmachina/ember-cli-sass/blob/v5.3.0/index.js#L73-L75
    // see: https://github.com/ember-cli/ember-cli/issues/3718
    while (typeof app.import !== 'function' && (app.app || app.parent)) {
      app = app.app || app.parent;
    }

    // if app.import and parentAddon are blank, we're probably being consumed by an in-repo-addon
    // or engine, for which the "bust through" technique above does not work.
    if (typeof app.import !== 'function' && !parentAddon) {
      if (app.registry && app.registry.app) {
        app = app.registry.app;
      }
    }

    if (!parentAddon && typeof app.import !== 'function') {
      throw new Error('flexi is being used within another addon or engine and is'
        + ' having trouble registering itself to the parent application.');
    }

    this.app = app;

    this._checkDependencyCompatibility(this.project);

    return app;
  },

  _checkDependencyCompatibility(project) {
    let packageVersionByName = {};

    for (let addon of project.addons) {
      packageVersionByName[addon.pkg.name] = addon.pkg.version;
    }

    let flexiConfigVersion = packageVersionByName['@html-next/flexi-config'];
    let flexiDefaultStylesVersion = packageVersionByName['@html-next/flexi-default-styles'];
    let flexiDslVersion = packageVersionByName['@html-next/flexi-dsl'];
    let flexiLayoutsVersion = packageVersionByName['@html-next/flexi-layouts'];

    if (flexiConfigVersion && SEMVER.lt(flexiConfigVersion, '2.0.0-rc.1')) {
      this._warnUser('flexi-config < v2.0.0-rc.1; consider upgrading to at least v2.0.0-rc.1');
    }
    if (flexiDefaultStylesVersion && SEMVER.lt(flexiDefaultStylesVersion, '2.0.0-rc.2')) {
      this._warnUser('flexi-default-styles < v2.0.0-rc.2;'
                     + ' consider upgrading to at least v2.0.0-rc.2');
    }
    if (flexiDslVersion && SEMVER.lt(flexiDslVersion, '2.0.0-rc.2')) {
      this._warnUser('flexi-dsl < v2.0.0-rc.2; consider upgrading to at least v2.0.0-rc.2');
    }
    if (flexiLayoutsVersion && SEMVER.lt(flexiLayoutsVersion, '2.0.0-rc.2')) {
      this._warnUser('flexi-layouts < v2.0.0-rc.2; consider upgrading to at least v2.0.0-rc.2');
    }
  },

  _warnUser(string) {
    this.ui.writeLine(CHALK.yellow(`WARNING: ${string}`));
  },

  isDevelopingAddon() {
    return false;
  }
};
