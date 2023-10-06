# XPOP Fetching / Generation

This lib. fetches a ready to use xPOP, fetches and encodes a JSON xPOP or
even generates the entire xPOP based on sources running the xPOP source
data service: ["Validation Ledger & Transaction Store"](https://github.com/Xahau/Validation-Ledger-Tx-Store-to-xPOP)

Methods to retrieve/generate, in order (unless params provided, see below):

1. Fetch ready to use HEX XPOP
2. Fetch JSON XPOP and encode to HEX
3. Fetch source files & compile XPOP & encode to HEX

## Output

`null` (failed) or HEX encoded XPOP ready to use for import in the `Blob` field.

## NPM

https://www.npmjs.com/package/xpop

# Use

## Methods

- `setVerbose(bool)` » `console.log` verbose info if true
- `setEndpoints(string[])` » [ Mandatory ] - the URLs where [the collector is running](https://github.com/Xahau/Validation-Ledger-Tx-Store-to-xPOP)
- `xpop(tx hash [, ledger index, network id, force ])`

## JS/Browser

```javascript
const {setVerbose, setEndpoints, xpop} = require('xpop')

// setVerbose(true)

setEndpoints([
  https://9477cbcacca3.ngrok.app'
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