import { useContractReader } from "eth-hooks";
import { Link } from "react-router-dom";
import { Button, Card, Divider, Form, Input } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { getRPCPollTime } from "../helpers";
import { create } from "ipfs-http-client";

const { ethers } = require("ethers");

const { BufferList } = require("bl");
// https://www.npmjs.com/package/ipfs-http-client

async function ipfsClient() {
  const ipfs = create({
    host: "localhost",
    port: 5001,
    protocol: "http",
    headers: {
      authorization: "Bearer " + "12D3KooWFr65EUfC74oprLZ4EzQeqp4s9XPWn7Je9rtV8Sumc2Xx",
    },
  });
  return ipfs;
}

async function getData(hash) {
  let ipfs = await ipfsClient();

  let asyncitr = ipfs.cat(hash);

  for await (const itr of asyncitr) {
    let data = Buffer.from(itr).toString();
    console.log(data);
  }
}

// helper function to "Get" from IPFS
// you usually go content.toString() after this...
// const getFromIPFS = async hashToGet => {
//   for await (const file of ipfs.get(hashToGet)) {
//     console.log(file.path);
//     if (!file.content) continue;
//     const content = new BufferList();
//     for await (const chunk of file.content) {
//       content.append(chunk);
//     }
//     console.log(content);
//     return content;
//   }
// };

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts, signer, tx, writeContracts, localProvider, contractConfig }) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract

  const [uri, setUri] = useState();
  const [tokenId, setTokenId] = useState();
  const [to, setTo] = useState();
  const [signatures, setSignatures] = useState("");
  const [voucherSigner, setVoucherSigner] = useState("");

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Create voucher</h2>
        <Divider />
        <label>Recipient</label>
        <Input
          onChange={e => {
            setTo(e.target.value);
          }}
        />
        <label>Token Id</label>
        <Input
          onChange={e => {
            setTokenId(e.target.value);
          }}
        />
        <label>Metadata URI</label>
        <Input
          onChange={e => {
            setUri(e.target.value);
          }}
        />

        <Button
          style={{ marginTop: 8 }}
          onClick={async () => {
            /*
              {"sc_address":"0x219050cbcdaf52c28dc9631d162f3166e7db9601", "to":"0x5C263169C8F50a53c6aFb2446171eD4bCde76d06", "tokenId":1, "uri":"ipfs"}
              */
            const sc_address = await readContracts.POC_V3_collection.address;

            const chainId = await signer.getChainId();

            const voucher = { sc_address, to, tokenId, uri };
            console.log(chainId);
            console.log(voucher);
            const sign = await signer._signTypedData(
              // Domain
              {
                name: "LazyNFT-Voucher",
                version: "1.0.0",
                verifyingContract: sc_address,
                chainId: chainId,
              },
              // Types
              {
                NFTVoucher: [
                  { name: "sc_address", type: "address" },
                  { name: "to", type: "address" },
                  { name: "tokenId", type: "uint256" },
                  { name: "uri", type: "string" },
                ],
              },
              // Value
              voucher,
            );
            //const result = await
            setSignatures(sign);

            console.log(sign);

            //const result = await fetch("https://ipfs.io/ipfs/QmYEaHmR3U8ADASGzsGdvh3vW7ZUWU1URPCXYCXV8wnaQ9")

            //console.log("Json in the ipfs : " + JSON.stringify(result));
          }}
        >
          Sign
        </Button>
        <p>{signatures}</p>
      </div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Claim NFT</h2>
        <Divider />
        <label>Signature</label>
        <Input
          onChange={e => {
            setSignatures(e.target.value);
          }}
        />
        <label>Signer</label>
        <Input
          onChange={e => {
            setVoucherSigner(e.target.value);
          }}
        />
        <label>Token Id</label>
        <Input
          onChange={e => {
            setTokenId(e.target.value);
          }}
        />
        <label>Metadata URI</label>
        <Input
          onChange={e => {
            setUri(e.target.value);
          }}
        />

        <Button
          style={{ marginTop: 8, marginRight: 8 }}
          onClick={async () => {
            // Verification
            const to = await signer.getAddress();
            const address = await readContracts.POC_V3_collection.address;
            const voucher = [address, to, tokenId, uri];
            console.log(voucher, voucherSigner, signatures);
            const result = await readContracts.POC_V3_collection.verify(voucher, voucherSigner, signatures);
            console.log("result", result);

            // if (result) {

            // }
          }}
        >
          Verify
        </Button>
        <Button
          style={{ marginTop: 8 }}
          onClick={async () => {
            // Contract interaction
            console.log("signer", signer);
            const to = await signer.getAddress();
            console.log(to);

            const address = await readContracts.POC_V3_collection.address;
            const voucher = [address, to, tokenId, uri];
            console.log(voucher, voucherSigner, signatures);
            const result = await writeContracts.POC_V3_collection.redeem(voucher, voucherSigner, signatures);
            console.log("result", result);
          }}
        >
          Claim
        </Button>
      </div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <img id="myImage" />
      </div>
    </div>
  );
}

export default Home;
