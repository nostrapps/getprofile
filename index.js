// library.js
import { RelayPool } from 'nostr'
import fs from 'fs'
import path from 'path'
import parseEvent from './functions.js'

// Logging switch
const LOGGING_ENABLED = false // Set to false to disable logging

const root = './cache/.well-known/nostr/pubkey'

/**
 * Custom logging function.
 * @param {...any} messages - Messages to log.
 */
function log(...messages) {
  if (LOGGING_ENABLED) {
    console.log(...messages)
  }
}

/**
 * Process a list of users.
 * @param {string[]} users - Array of user identifiers.
 * @param {string[]} relay - Array of relay URLs.
 */
export function processUsers(users, relay) {
  log('Processing users:', users)
  ensureDirectories(users)
  const pool = initializeRelayPool(relay, users)
  handleRelayEvents(pool, users)
}

function ensureDirectories(users) {
  users.forEach(user => {
    const cacheDirectory = path.join(root, `${user}`)
    log('Ensuring directory exists:', cacheDirectory)
    fs.mkdirSync(cacheDirectory, { recursive: true })
  })
}

function initializeRelayPool(relay, users) {
  log('Initializing Relay Pool')
  const pool = RelayPool(relay)
  pool.on('open', relay => {
    log('Relay opened:', relay.url)
    users.forEach(user => {
      log('Subscribing to user:', user)
      relay.subscribe('subid' + user, { limit: 2, kinds: [0], authors: [user] })
    })
  })
  return pool
}

function handleRelayEvents(pool, users) {
  pool.on('event', (relay, sub_id, ev) => {
    log('Received event:', ev)
    const user = sub_id.slice(5)
    log('Handling event for user:', user)
    const parsedEvent = parseEvent(ev)
    log('Parsed event:', parsedEvent)
    const profile = constructProfile(user, parsedEvent)
    writeProfileToFile(user, profile)
    console.log(profile)
    updateUserList(users, user)
    if (users.length === 0) {
      log('All users processed, closing relay.')
      relay.close()
    }
  })
}

function constructProfile(user, eventData) {
  log('Constructing profile for user:', user)
  return {
    '@context': 'https://w3id.org/nostr/context',
    '@type': 'Profile',
    '@id': 'nostr:pubkey:' + user,
    ...eventData
  }
}

function writeProfileToFile(user, profile) {
  const cacheDirectory = path.join(root, `${user}`)
  const cacheFilePath = path.join(cacheDirectory, 'index.json')
  log('Writing profile to file:', cacheFilePath)
  fs.writeFileSync(cacheFilePath, JSON.stringify(profile, null, 2))
}

function updateUserList(users, processedUser) {
  const index = users.indexOf(processedUser)
  if (index > -1) {
    log('Removing processed user from list:', processedUser)
    users.splice(index, 1)
  }
}
