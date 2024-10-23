import { randomBytes } from 'crypto';
import * as secp256k1 from 'secp256k1';
import { keccak256 } from '@ethersproject/keccak256';
import * as yargs from 'yargs';

function uint8ArrayToHex(uint8Array: Uint8Array): string {
  return (
    '0x' +
    Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
  );
}

(async function () {
    const argv = yargs
  .option('name', {
    alias: 'n',
    type: 'string',
    description: 'Specify the name',
    demandOption: true, // Makes --name required
    coerce: (name) => {
        if (name.length > 8) {
            throw new Error('The name must be up to 8 characters long.');
        }
        return name;
    }
  })
  .help()
  .argv as { name: string };;

// Access the value of --name
console.log(`The provided name is: ${argv.name}`);

const name = argv.name.slice(2);
console.log('name:', name);

    // const argv = yargs
    // .option('name', {
    //     alias: 'n',
    //     demandOption: true,
    //     default: '',
    //     describe: 'name for your vanity address',
    //     type: 'string'
    // })
    // .help().argv

    //   console.log('argv:', argv);
    //   console.log('argv:', argv.name);

  let address;
  do {
    // Generate private key
    let privKey;
    do {
      privKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privKey));

    // Get the public key in a uncompressed format
    const pubKey = secp256k1.publicKeyCreate(privKey, false);

    secp256k1.publicKeyVerify(pubKey);

    // Derive Ethereum address: keccak256 hash of the last 64 bytes of the uncompressed public key, take the last 20 bytes
    address = keccak256(pubKey.slice(1)).slice(-40);
    if (address.startsWith(name)) {
        console.log('Private Key:', '0x' + privKey.toString('hex'));
        console.log('Public Key:', uint8ArrayToHex(pubKey));
        console.log('Found valid address:',  '0x' + address);
        break;
    }
  } while (true);
})();
