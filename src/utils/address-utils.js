/**
 * @fileOverview Utility encryption related functions for KeyManager module.
 *
 * @author Raul Aragonez (r.aragonez@topl.me)
 *
 * @exports utils isValidNetwork, getUrlByNetwork, getHexByNetwork, getDecimalByNetwork, getValidNetworksList
 */

"use strict";

// Dependencies
const blake = require("blake2");
const crypto = require("crypto");
const Base58 = require("base-58");
const keccakHash = require("keccak");
const curve25519 = require("curve25519-js");

const validNetworks = ['local', 'private', 'toplnet', 'valhalla', 'hel'];

const networksDefaults = {
  'local': {
    hex: "0x30",
    decimal: 48,
    url: "http://localhost:9085/"
  },
  'private': {
    hex: "0x40",
    decimal: 64,
    url: "http://localhost:9085/"
  },
  'toplnet': {
    hex: "0x01",
    decimal: 1,
    url: "https:\\torus.topl.services"
  },
  'valhalla': {
    hex: "0x10",
    decimal: 16,
    url: "https:\\valhalla.torus.topl.services"
  },
  'hel': {
    hex: "0x20",
    decimal: 32,
    url: "https:\\hel.torus.topl.services"
  }
};

function str2buf(str, enc) {
  if (!str || str.constructor !== String) return str;
  return enc ? Buffer.from(str, enc) : Buffer.from(Base58.decode(str));
}

/**
 * Check if addresses are valid by verifying these belong to the same network.
 * @param {String} networkPrefix
 * @param {Object} params
 * @param {Array} addresses
 */
/**
   * 1. verify the address is not null - DONE
   * 2. verify the base58 is 38 bytes long
   * 3. verify that it matches the network
   * 4. verify that hash matches the last 4 bytes?
   * 5. verify that address is multi-sig vs uni-sig? NO
   *
   * return an object
   * {
   *  success: true,
   *  errorMsg: "",
   *  networkPrefix: "local",
   *  addresses:
   *  [
  *     {
            "address": "86tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz",
            "network": "local"
        },
        {
            "address": "77tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz",
            "network": "valhalla"
        }
   *  ]
   * }
   */
function validateAddressesByNetwork(networkPrefix, addresses){
  // this is the response we are providing upon the completion of the validation
  let result = {
    success: false,
    errorMsg: "",
    networkPrefix: networkPrefix,
    addresses: [],
    invalidAddresses: []
  };

  // check if network is valid first
  if(!isValidNetwork(networkPrefix)){
    result.errorMsg = "Invalid network provided";
    return result;
  }

  if(!addresses){
    result.errorMsg = "No addresses provided";
    return result;
  }

  // get decimal of the network prefix
  const networkDecimal = getDecimalByNetwork(networkPrefix);

  // addresses can be passed as an array or extracted from an json obj
  result.addresses = addresses.constructor === Array ? addresses : extractAddressesFromObj(addresses);

  // check if addresses were obtained
  if(!result.addresses || result.addresses.length < 1){
    result.errorMsg = "No addresses found";
    return result;
  }

  // run validation on addresses, if address is not valid then add it to invalidAddresses array
  result.addresses.forEach(address => {
    // decode base58 address
    const decodedAddress = Base58.decode(address);
    console.log(decodedAddress)

    //validation: base58 38 byte obj that matches networkPrefix decimal
    if(decodedAddress.length !== 38 || decodedAddress[0] !== networkDecimal){
      result.invalidAddresses.push(address);
    } else {
      // address has correct length and matches the network, now validate the chacksum
      const checksumBuffer = Buffer.from(decodedAddress.slice(34));

      // encrypt message (bytes 1-34)
      const msgBuffer = Buffer.from(decodedAddress.slice(0,34));
      const hashChecksumBuffer = blake.createHash("blake2b", {digestLength:32}).update(msgBuffer).end().read().slice(0, 4);

      // verify checksum bytes match
      if(!checksumBuffer.equals(hashChecksumBuffer)){
        result.invalidAddresses.push(address);
      }
    }
  });

  // check if any invalid addresses were found
  if(result.invalidAddresses.length > 0){
    result.errorMsg = "Invalid addresses for network: " + networkPrefix
  } else {
    result.success = true;
  }

  return result;
}

function extractAddressesFromObj(obj){
  /**
   params =
    {
        "propositionType": "PublicKeyCurve25519",
        "changeAddress": "899tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz",
        "consolidationAdddress": "899tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz",
        "recipients": [["899tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz", 10]],
        "sender": ["899tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz"],
        "addresses": ["899tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz"],
        "fee": 1,
        "data": ""
    };
   */

   // only push unique items in array, so that validation is faster

  let addresses = [];
  if (obj.constructor === String){
    return obj;
  }
  //obj = obj;
  // if(obj.constructor === Array){
  //   obj = obj[0];
  // }

  // make this parser a bit faster, use strings or array logic
  var keys = ["recipients", "sender", "changeAddress", "consolidationAdddress", "addresses"]


  if(obj['changeAddress']){
   addresses.push(obj["changeAddress"]);
  }
  if(obj["consolidationAdddress"]){
    addresses.push(obj["consolidationAdddress"]);
  }

  if(obj["recipients"] && obj["recipients"].length > 0){
    obj["recipients"].forEach(address => {
      addresses.push(address[0]);
    });
  }
  if(obj["sender"] && obj["sender"].length > 0){
    obj["sender"].forEach(address => {
      addresses.push(address);
    });
  }
  if(obj["addresses"] && obj["addresses"].length > 0){
    obj["addresses"].forEach(address => {
      addresses.push(address);
    });
  }
  //console.log("addresses list: "+ addresses);
  return addresses;
  
}
/*** ------  TESTING FOR RAUL -------*/

let arrExample = [
  '86tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz',
  '86tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz',
  '86tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz',
  '86tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz',
  '86tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz'
];
//let addValidationRes2 = validateAddressesByNetwork('local', arrExample);

let arrSingle = ['AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE'];
let addValidationRes2 = validateAddressesByNetwork('private', arrSingle);
console.log(addValidationRes2);


let paramObj =
  {
      "propositionType": "PublicKeyCurve25519",
      "changeAddress": "86tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz",
      "consolidationAdddress": "86tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz",
      "recipients": [["86tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz", 10]],
      "sender": ["86tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz"],
      "addresses": ["86tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz"],
      "fee": 1,
      "data": ""
  }
;

//extractAddressesFromObj(paramObj);
//let addValidationRes = validateAddressesByNetwork('local', paramObj);
//console.log(addValidationRes);




function isValidNetwork(networkPrefix) {
  return networkPrefix && validNetworks.includes(networkPrefix);
}

function getUrlByNetwork(networkPrefix) {
  return networksDefaults[networkPrefix].url;
}

function getHexByNetwork(networkPrefix) {
  return networksDefaults[networkPrefix].hex;
}

function getDecimalByNetwork(networkPrefix) {
  return networksDefaults[networkPrefix].decimal;
}
function getValidNetworksList(networkPrefix) {
  return validNetworks;
}


// module.exports = {
//   isValidNetwork = function(networkPrefix) {
//     return networkPrefix && !validNetworks.includes(params.networkPrefix);
//   },
//   getUrlByNetwork = function(networkPrefix) {
//     return networksDefaults[networkPrefix].url;
//   },
//   getHexByNetwork = function(networkPrefix) {
//     return networksDefaults[networkPrefix].hex;
//   }
// };

module.exports = {isValidNetwork, getUrlByNetwork, getHexByNetwork, getDecimalByNetwork, getValidNetworksList, validateAddressesByNetwork};