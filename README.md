# XPOP Fetching / Generation [![npm version](https://badge.fury.io/js/xpop.svg)](https://badge.fury.io/js/xpop)

This lib. fetches a ready to use xPOP, fetches and encodes a JSON xPOP or
even generates the entire xPOP based on sources running the xPOP source
data service: ["Validation Ledger & Transaction Store"](https://github.com/Xahau/Validation-Ledger-Tx-Store-to-xPOP)

Methods to retrieve/generate, in order (unless params provided, see below):

1. Fetch ready to use HEX XPOP
2. Fetch JSON XPOP and encode to HEX
3. Fetch source files & compile XPOP & encode to HEX

## Samples

Sample to generate & submit a B2M transaction on Testnet, resulting in an xPOP:
- https://gist.github.com/WietseWind/cd8a7a8c88f218fe7b768f59a665685d

Sample to use this script in the browser:
- https://jsfiddle.net/WietseWind/42kpm0hr/

## Output

`null` (failed) or HEX encoded XPOP ready to use for import in the `Blob` field.

## NPM, CDN

- NPM (backend): https://www.npmjs.com/package/xpop
- CDN (browser): https://cdn.jsdelivr.net/npm/xpop/browser.min.js

Example browser implementation:
- https://jsfiddle.net/WietseWind/42kpm0hr/

## Methods

- `setVerbose(bool)` » `console.log` verbose info if true
- `setEndpoints(string[])` » [ Mandatory ] - the URLs where [the collector is running](https://github.com/Xahau/Validation-Ledger-Tx-Store-to-xPOP)
- `xpop(tx hash [, ledger index, network id, force ])`

## JS/Browser

Note: a list of recent endpoints can be found here:
- https://xrpl.ws-stats.com/xpop/list
- https://xrpl.ws-stats.com/xpop/list?json=true (see auto-fill example below)

```javascript
const {setVerbose, setEndpoints, xpop} = require('xpop')

// setVerbose(true)
// setEndpoints((await (await fetch('https://xrpl.ws-stats.com/xpop/list?json=true')).json()).bestguess)

setEndpoints([
  'https://xpop.xrplwin.com/',  // Twitter: @XRPLWin
  'http://xpop.katczynski.org', // Twitter: @realkatczynski
  'https://xpop.xrpl-labs.com', // Twitter: @XRPLLabs
])

xpop('20D193C6E615D86BCC13A5DAB781852A6672F3E627D33FBAE62053F1178740BB', 41815218, 1, true)
  .then(console.log)
```

## Pre-generated XPOP only:

```javascript
// tx hash
xpop('20D193C6E615D86BCC13A5DAB781852A6672F3E627D33FBAE62053F1178740BB')
```

## Pre-generated XPOP with fallback to pre-generated JSON

```javascript
// tx hash, ledger index, network id
xpop('20D193C6E615D86BCC13A5DAB781852A6672F3E627D33FBAE62053F1178740BB', 41815218, 1)
```

## Forced pre-generated / client side generated (fallback) JSON

```javascript
// tx hash, ledger index, network id, true (force)
xpop('20D193C6E615D86BCC13A5DAB781852A6672F3E627D33FBAE62053F1178740BB', 41815218, 1, true)
```
