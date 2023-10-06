import { ledgerIndexToFolders } from 'xpopgen/lib/ledgerIndexToFolders.mjs'
import { xpop as xpopGen } from 'xpopgen/lib/xpop/v1.mjs'
import assert from 'assert'

let verbose = false

const endpoints = []

const setEndpoints = _endpoints => {
  if (Array.isArray(_endpoints)) {
    endpoints.length = 0
    _endpoints
      .map(endpoint => endpoint.trim())
      .filter(endpoint => endpoint.match(/^http/))
      .forEach(endpoint => endpoints.push(endpoint))
  }

  return endpoints
}

const fetchData = async (url, isResultValid, timeoutMs = 5000) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const call = await fetch(url, {
      signal: controller.signal
    })
    const data = await call.text()
    clearTimeout(timeout)

    if (verbose) console.log(url, data.length)

    if (typeof isResultValid === 'function') {
      const valid = await isResultValid(data)
      if (!valid) return null
    }

    return data
  } catch (e) {
    if (verbose) console.log(url, e.message)
  }

  clearTimeout(timeout)
  return null
}

const fetchAll = async (path, validator) => {
  assert(endpoints.length > 0, 'No endpoints configured with `setEndpoints(string[])`')

  const callAll = (
    await Promise.all(
      endpoints.map(async url => fetchData((url + '/' + path).replace(/\/+/g, '/').replace(':/', '://'), validator))
    )
  )
  .filter(r => !!r)

  return callAll
}

const fetchJson = async path => {
  const validator = data => {
    return data.trim().slice(0, 1) === '{' && data.trim().slice(-1) === '}'
  }

  return (await fetchAll(path, validator)).map(json => {
    try {
      return JSON.parse(json)
    } catch (e) {
      console.log('JSON decode err', e.message)
      return null
    }  
  })
    .filter(r => !!r)

}

const fetchHex = async path => {
  const validator = data => {
    return data.trim().match(/^[a-fA-F0-9]{2,}$/)
  }

  return fetchAll(path, validator)
}

// console.log(
//   (await fetchHex('xpop/13DE0A6AB8F60005845E727C53D19122A32C4732C6586690B403D274165F9B92'))
//     .map(r => r.length)
// )

// console.log(
//   (await fetchJson('1/41/813/949/xpop_125C2EC88ADAA3E431C1CC96AB4BB6F1B41910E9E340F267E98666D12EEA913D.json'))
//     .map(r => r.length)
// )

const xpop = async (txHash, ledgerIndex, networkId, forceFromSource) => {
  if (!forceFromSource || (typeof ledgerIndex === 'undefined' && typeof networkId === 'undefined')) {
    const direct = await fetchHex('xpop/' + txHash)

    if (direct.length > 0) {
      if (verbose) console.log('Got Direct xPOP')
      return direct[0]
    }
  }

  if (typeof ledgerIndex !== 'undefined' && typeof networkId !== 'undefined') {
    if (verbose) console.log('Fetching source')

    const prefix = networkId + '/' + ledgerIndexToFolders(ledgerIndex) + '/'

    const xpopJson = (await fetchJson(prefix + 'xpop_' + txHash + '.json'))
      .filter(j => typeof j === 'object' && j && j?.ledger && j?.validation?.unl)
      ?.[0]

    if (xpopJson) {
      if (verbose) console.log('Got JSON xPOP to HEX')
      return Buffer.from(JSON.stringify(xpopJson), 'utf-8').toString('hex')
    }

    // We're here if we need to compile the xPOP over here, as the xPOP isn't available in ready to use state

    const [
      binary,
      json,
      vl,
      tx,
    ] = (
      await Promise.all(
        [
          fetchJson(prefix + 'ledger_binary_transactions.json'),
          fetchJson(prefix + 'ledger_info.json'),
          fetchJson(prefix + 'vl.json'),
          fetchJson(prefix + 'tx_' + txHash + '.json'),
        ]
      )
    )
      .map(x => x.filter(r => typeof r === 'object' && r && (r?.ledger_hash || r?.ledger_data || r?.ledger_index || r?.unl)))
      .map(x => x?.[0])

    assert(typeof binary === 'object' && binary, 'Source information incomplete, could not binary ledger tx information')
    assert(typeof json === 'object' && json, 'Source information incomplete, could not fetch basic ledger information')
    assert(typeof vl === 'object' && vl, 'Source information incomplete, could not fetch validator/UNL info')
    assert(typeof tx === 'object' && tx, 'Source information incomplete, could not fetch transaction')
    
    const validatorKeys = Object.keys(vl?.unl || {})
    const validations = (
      await Promise.all(validatorKeys.map(v => fetchJson(prefix + 'validation_' + v + '.json')))
    )
      .map(x => x.filter(r => typeof r === 'object' && r && r?.master_key))
      .map(x => x?.[0])

    assert(validations.length >= validatorKeys.length * 0.8, 'Not enough validation messages (no consensus)')

    const xpopGenJsonString = await xpopGen({
      vl,
      ledger: {
        json,
        binary,
      },
      validations,
      tx,
    })

    return Buffer.from(xpopGenJsonString, 'utf-8').toString('hex')
  }

  return null
}

const setVerbose = v => {
  verbose = !!v
}

// setVerbose(true)

// setEndpoints([
//   'http://localhost:3000',
// ])

// console.log(
//   await xpop('20D193C6E615D86BCC13A5DAB781852A6672F3E627D33FBAE62053F1178740BB', 41815218, 1, true),
//   await xpop('125C2EC88ADAA3E431C1CC96AB4BB6F1B41910E9E340F267E98666D12EEA913D', 41813949, 1),
// )

export {
  setEndpoints,
  setVerbose,
  xpop,
}
