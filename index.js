const { RelayPool } = require('nostr')
const fs = require('fs')
const path = require('path')

const user = process.argv[2] || 'de7ecd1e2976a6adb2ffa5f4db81a7d812c8bb6698aa00dcf1e76adb55efd645'

const root = './cache'
const cacheDirectory = path.join(root, `${user}`)
const filname = 'index.json'
const cacheFilePath = path.join(cacheDirectory, filname)

fs.mkdirSync(cacheDirectory, { recursive: true })

// Create an object to store the merged data
let mergedData = {}

function parseEvent(event) {
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
		const json = { relay: JSON.parse(event.content), following: contacts }
		return json
	}
}

const scsi = 'wss://nostr-pub.wellorder.net'
const relay = [scsi]

const pool = RelayPool(relay)
pool.on('open', relay => {
	relay.subscribe('subid', { limit: 5, kinds: [0, 3], authors: [user] })
})

pool.on('event', (relay, sub_id, ev) => {
	const parsedEvent = parseEvent(ev)
	// Merge the parsed event into the mergedData object
	mergedData = { ...mergedData, ...parsedEvent }

	console.log(mergedData)

	fs.writeFileSync(cacheFilePath, JSON.stringify({
		'@id': '',
		mainEntity: {
			'@id': 'nostr:pubkey:' + user,
			...mergedData
		}
	}, null, 2))

	relay.close()
})
