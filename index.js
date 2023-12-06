import { RelayPool } from 'nostr'
import parseEvent from './functions.js'

const LOGGING_ENABLED = false

function log(...messages) {
  if (LOGGING_ENABLED) {
    console.log(...messages)
  }
}

export function processUsers(users, relay) {
  log('Processing users:', users)
  return new Promise((resolve, reject) => {
    try {
      const pool = initializeRelayPool(relay, users, resolve, reject)
      handleRelayEvents(pool, users, {}, resolve, reject) // Pass an empty object for accumulating profiles
    } catch (error) {
      log('Error in processUsers:', error)
      reject(error)
    }
  })
}

function initializeRelayPool(relay, users, resolve, reject) {
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

function handleRelayEvents(pool, users, profiles, resolve, reject) {
  pool.on('event', (relay, sub_id, ev) => {
    log('Received event:', ev)
    const user = sub_id.slice(5)
    log('Handling event for user:', user)
    try {
      const parsedEvent = parseEvent(ev)
      log('Parsed event:', parsedEvent)
      const profile = constructProfile(user, parsedEvent)
      profiles[user] = profile // Store the profile in the accumulator object

      updateUserList(users, user)
      if (users.length === 0) {
        log('All users processed, closing relay.')
        relay.close()
        resolve(profiles) // Resolve the promise with the accumulated profiles
      }
    } catch (error) {
      log('Error in handleRelayEvents:', error)
      reject(error)
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

function updateUserList(users, processedUser) {
  const index = users.indexOf(processedUser)
  if (index > -1) {
    log('Removing processed user from list:', processedUser)
    users.splice(index, 1)
  }
}
