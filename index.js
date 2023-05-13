#!/usr/bin/env node

const { RelayPool } = require('nostr')
const fs = require('fs')
const path = require('path')

// Get users from command line arguments
const users = process.argv.slice(2)
if (users.length === 0) {
  users.push('de7ecd1e2976a6adb2ffa5f4db81a7d812c8bb6698aa00dcf1e76adb55efd645')
}

const root = './cache/.well-known/nostr/pubkey'

users.forEach(user => {
  const cacheDirectory = path.join(root, `${user}`)
  const filename = 'index.json'
  const cacheFilePath = path.join(cacheDirectory, filename)

  fs.mkdirSync(cacheDirectory, { recursive: true })
})

// Create an object to store the merged data
let mergedData = {}

function parseEvent (event) {
  if (event.kind === 0) {
    const json = JSON.parse(event.content)
    return json
  } else if (event.kind === 3) {
    const tags = event.tags
    const contacts = []
    tags.forEach(element => {
      if (element[0] === 'p') {
        contacts.push('nostr:pubkey:' + element[1])
      }
    })

    function transformRelays (relays) {
      return Object.entries(relays).map(([key, value]) => {
        const modes = []
        if (value.read) modes.push('read')
        if (value.write) modes.push('write')
        return {
          '@id': key,
          mode: modes
        }
      })
    }

    let relays
    try {
      relays = JSON.parse(event.content)
      relays = transformRelays(relays)
    } catch (e) {
    }
    // console.log(relays)

    if (relays) {
      return { following: contacts, relay: relays }
    } else {
      return { following: contacts }
    }
  }
}

const scsi = 'wss://relay.damus.io/'
const relay = [scsi]

const pool = RelayPool(relay)
pool.on('open', relay => {
  // Subscribe for each user
  users.forEach(user => {
    relay.subscribe('subid' + user, { limit: 5, kinds: [0, 3], authors: [user] })
  })
})

pool.on('event', (relay, sub_id, ev) => {
  const user = sub_id.slice(5) // Remove 'subid' prefix to get the user
  const cacheDirectory = path.join(root, `${user}`)
  const filename = 'index.json'
  const cacheFilePath = path.join(cacheDirectory, filename)

  const parsedEvent = parseEvent(ev)
  // Merge the parsed event into the mergedData object
  mergedData = { ...parsedEvent, ...mergedData }

  console.log(mergedData)

  fs.writeFileSync(cacheFilePath, JSON.stringify({
    '@context': 'http://schema.org',
    '@id': '',
    '@type': 'Person',
    name: mergedData.name,
    image: mergedData.picture,
    description: mergedData.about,

    mainEntity: {
      '@context': 'https://w3id.org/nostr/context',
      '@id': 'nostr:pubkey:' + user,
      ...mergedData
    }
  }, null, 2))

  // Remove user from the array
  const index = users.indexOf(user)
  if (index > -1) {
    users.splice(index, 1)
  }

  // Close the relay if no more users
  if (users.length === 0) {
    relay.close()
  }

  setTimeout(() => {
    relay.clos()
  }, 3000)
})
