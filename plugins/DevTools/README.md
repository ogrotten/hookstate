# @hookstate/devtools

## !!! Experimental plugin. API may change.

[![license](https://img.shields.io/github/license/avkonst/hookstate)](https://img.shields.io/github/license/avkonst/hookstate) [![npm version](https://img.shields.io/npm/v/@hookstate/devtools.svg?maxAge=300&label=version&colorB=007ec6)](https://www.npmjs.com/package/@hookstate/devtools)

Development tools for @hookstate/core.

## How to use:

- Insert the line `import '@hookstate/devtools` in the root of your React app, for example in `index.ts` or `index.js` file. The tools should be imported before importing other modules, which create or use states. 
- Install Chrome Redux development tools browser's extension and reload your app.
- Once loaded and your states are created, you will see it in the development tools browser's extension.
