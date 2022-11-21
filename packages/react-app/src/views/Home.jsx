import { useContractReader } from "eth-hooks";
import { Link } from "react-router-dom";
import { Button, Card, Divider, Form, Input } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { getRPCPollTime } from "../helpers";
const { ethers } = require("ethers");
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
        <label>Metadata URI</label>
        <Input
          onChange={e => {
            setUri(e.target.value);
          }}
        />
        <label>Token Id</label>
        <Input
          onChange={e => {
            setTokenId(e.target.value);
          }}
        />

        <Button
          style={{ marginTop: 8, marginRight: 8 }}
          onClick={async () => {
            // Verification
            const to = await signer.getAddress();
            const address = await readContracts.POC_V3_collection.address;
            const voucher = [address, to, tokenId, uri];
            console.log(voucher, to, signatures);
            const result = await readContracts.POC_V3_collection.verify(voucher, to, signatures);
            console.log("result", result);
            if (result) {
            }
            //const purpose = useContractReader(readContracts, "POC_V3_collection", "verify", [voucher, to, signatures], localProviderPollingTime);
            //0xbb67156b2c1bc5932483b8ae0405c55378347fb64f050a82f89e4b60ab68fab95dd143069798ed094674504b70bf1c456b863be47ebe87d628179b1cc3f26f7a1c
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
            console.log(voucher, to, signatures);
            const result = await writeContracts.POC_V3_collection.redeem(voucher, to, signatures);
            console.log("result", result);
          }}
        >
          Claim
        </Button>
      </div>
    </div>
  );
}

export default Home;
