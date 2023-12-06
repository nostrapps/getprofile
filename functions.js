export default function parseEvent(event) {
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
