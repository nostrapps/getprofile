

<div align="center">  
  <h1>getprofile</h1>
</div>

<div align="center">  
<i>getprofile</i>
</div>

---

<div align="center">
<h4>Documentation</h4>
</div>

---

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nostrapps/getprofile/blob/gh-pages/LICENSE)
[![npm](https://img.shields.io/npm/v/getprofile)](https://npmjs.com/package/getprofile)
[![npm](https://img.shields.io/npm/dw/getprofile.svg)](https://npmjs.com/package/getprofile)
[![Github Stars](https://img.shields.io/github/stars/nostrapps/getprofile.svg)](https://github.com/nostrapps/getprofile/)

# Nostr Event Fetcher

This is a simple utility that subscribes to a Nostr relay, fetches events of specified kinds, and stores the parsed results in a JSON file. 

## Features
- Fetches and parses events from Nostr network 
- Writes the fetched data into a JSON file
- Allows specifying event kinds to filter the events
- Supports caching of fetched data for later use

## Usage

1. Clone the repository:

```bash
git clone https://github.com/nostrapps/getprofile.git
cd yourrepository
```

2. Install the dependencies:

```bash
npm install
```

3. Run the script:

```bash
node index.js
```

By default, the script uses 'de7ecd1e2976a6adb2ffa5f4db81a7d812c8bb6698aa00dcf1e76adb55efd645' as the user. If you want to use a different user, pass the user's public key as a command line argument:

```bash
node index.js <pubkey>
```

This will create a new directory under the `./cache` directory named after the user's public key, and a JSON file named `index.json` in this directory. The JSON file will contain the parsed data from the fetched events.

## Data Structure

The JSON file will have the following structure:

```json
{
  "@id": "",
  "mainEntity": {
    "@id": "nostr:pubkey:<pubkey>",
    "name": "<user name>",
    "picture": "<picture URL>",
    "website": "<website URL>",
    "about": "<user description>",
    "display_name": "<display name>",
    "relay": "<relay>",
    "following": ["<following pubkeys>"]
  }
}
```

## Dependencies

This utility uses the following npm packages:

- nostr: This is the main package that is used to communicate with the Nostr network.
- fs: This package is used to write the parsed data into a JSON file.
- path: This package is used to handle file and directory paths.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Contact

If you have any questions or issues, please open an issue on this repository.


