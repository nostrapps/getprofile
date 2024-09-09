#!/usr/bin/env node

import minimist from 'minimist'
import { processUsers } from '../index.js'

// Constants
const DEFAULT_RELAY = 'wss://relay.damus.io'
const DEFAULT_USER = 'de7ecd1e2976a6adb2ffa5f4db81a7d812c8bb6698aa00dcf1e76adb55efd645'

// Parse command line arguments using minimist
const { _: [usersArg = DEFAULT_USER, relayArg = DEFAULT_RELAY], help } = minimist(process.argv.slice(2), {
  boolean: ['help'],
  alias: { h: 'help' }
})

if (help) {
  console.log(`Usage: getprofile [users] [relay]
  users: Comma-separated list of user IDs (default: ${DEFAULT_USER})
  relay: Comma-separated list of relay URLs (default: ${DEFAULT_RELAY})
  
Options:
  -h, --help  Show this help message`)
  process.exit(0)
}

// Handle comma-separated values
const users = usersArg.includes(',') ? usersArg.split(',') : [usersArg]
const relays = relayArg.includes(',') ? relayArg.split(',') : [relayArg]

// Invoke the function from the library and handle the promise
processUsers(users, relays)
  .then(profiles => console.log(JSON.stringify(profiles, null, 2)))
  .catch(error => console.error('An error occurred:', error))
