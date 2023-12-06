#!/usr/bin/env node

import { RelayPool } from 'nostr'
import fs from 'fs'
import path from 'path'
import util from 'util'
import minimist from 'minimist'

// Define default relay and user values
const defaultRelay = 'wss://relay.damus.io'
const defaultUser = 'de7ecd1e2976a6adb2ffa5f4db81a7d812c8bb6698aa00dcf1e76adb55efd645'

// Parse command line arguments using minimist
const args = minimist(process.argv.slice(2))

// Extract users and relay from the arguments
const usersArg = args._[0] || defaultUser
const relayArg = args._[1] || defaultRelay

// Handle comma-separated values
const users = usersArg.includes(',') ? usersArg.split(',') : [usersArg]
const relay = relayArg.includes(',') ? relayArg.split(',') : [relayArg]

// Your script logic here
// For example, you can log the obtained values
// console.log(`Users: ${users.join(', ')}`)
// console.log(`Relay: ${relay.join(', ')}`)

// Get users from command line arguments
if (users.length === 0) {
  // console.log('No user provided as argument, using default.')
  users.push('de7ecd1e2976a6adb2ffa5f4db81a7d812c8bb6698aa00dcf1e76adb55efd645')
}

const root = './cache/.well-known/nostr/pubkey'

// console.log(`Processing users: ${users.join(', ')}`)
users.forEach(user => {
  const cacheDirectory = path.join(root, `${user}`)
  const filename = 'index.json'
  const cacheFilePath = path.join(cacheDirectory, filename)

  // console.log(`Creating directory: ${cacheDirectory}`)
  fs.mkdirSync(cacheDirectory, { recursive: true })
})

// Create an object to store the merged data
let mergedData = {}
const kind0Data = {}
const kind3Data = {}
const identityData = {}

function parseEvent(event) {
  // console.log(`Parsing event: ${event.id}`)
  if (event.kind === 0) {
    const json = JSON.parse(event.content)
    // console.log(`Parsed profile data for ${event.pubkey}`)
    return json
  } else if (event.kind === 3) {
    const tags = event.tags
    const contacts = tags.filter(tag => tag[0] === 'p').map(tag => 'nostr:pubkey:' + tag[1])
    // console.log(`Parsed ${contacts.length} contact(s) for ${event.pubkey}`)

    let relays = {}
    try {
      // console.log(event)
      relays = JSON.parse(event.content || '{}')

      // console.log(`Parsed relay data for ${event.pubkey}`)
    } catch (e) {
      // console.log(`Error parsing relay data for ${event.pubkey}: ${e.message}`)
    }

    if (relays) {
      return { following: contacts, relay: relays }
    } else {
      return { following: contacts }
    }
  }
}

// console.log(`Connecting to relay: ${scsi}`)
const pool = RelayPool(relay)
pool.on('open', relay => {
  // console.log('Connected to relay.')
  // Subscribe for each user
  users.forEach(user => {
    // console.log(`Subscribing to events for user: ${user}`)
    relay.subscribe('subid' + user, { limit: 2, kinds: [0], authors: [user] })
  })
})

pool.on('event', (relay, sub_id, ev) => {
  const user = sub_id.slice(5) // Remove 'subid' prefix to get the user
  // console.log(`Received event for user: ${user}`)
  const cacheDirectory = path.join(root, `${user}`)
  const filename = 'index.json'
  const cacheFilePath = path.join(cacheDirectory, filename)

  const parsedEvent = parseEvent(ev)
  // Merge the parsed event into the mergedData object
  mergedData = { ...parsedEvent, ...mergedData }

  // Construct the profile object
  const profile = {
    '@context': 'https://w3id.org/nostr/context',
    '@type': 'Profile',
    '@id': 'nostr:pubkey:' + user,
    mainEntityOfPage: '',
    name: mergedData.name,
    image: mergedData.picture,
    description: mergedData.about,
    ...mergedData
  }

  // console.log('Nostr Linked Data Profile: ')
  // console.log('Relay: ', relay.url)
  console.log(util.inspect(profile, { maxArrayLength: null }))

  // console.log(`Writing profile data to file: ${cacheFilePath}`)
  fs.writeFileSync(cacheFilePath, JSON.stringify(profile, null, 2))

  // Remove user from the array
  const index = users.indexOf(user)
  if (index > -1) {
    // console.log(`Removing user from processing list: ${user}`)
    users.splice(index, 1)
  }

  // Close the relay if no more users
  if (users.length === 0) {
    // console.log('All users processed, closing relay.')
    relay.close()
  } else {
    // console.log('Waiting for more events...')
  }
})

process.on('exit', () => {
  // console.log('Script exiting.')
})
