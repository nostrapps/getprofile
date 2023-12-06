#!/usr/bin/env node

import minimist from 'minimist'
import { processUsers } from '../index.js'

// Constants
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

// Invoke the function from the library and handle the promise
processUsers(users, relay)
  .then(profiles => {
    console.log(JSON.stringify(profiles, null, 2))
  })
  .catch(error => {
    console.error('An error occurred:', error)
  })
