import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import { create } from "ipfs-http-client";
import SignatureCanvas from "react-signature-canvas";

const ipfsClient = create("https://ipfs.infura.io:5001/api/v0");

export const StyledButton = styled.button`
  padding: 8px;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const elementRef = useRef();
  
  const ipfsBaseUrl = "https://ipfs.infura.io/ipfs/"
  const name = "NFT Name";
  const description = "IPFS minted NFT wooohooo";

  // const createMetaDataAndMint = (_name, _des, _imgBuffer) => {
  //   try {
  //     const addedImage = await ipfsClient.add(_imgBuffer);
  //     console.log(addedImage);

  //   } catch (err) {
  //     console.log(err);
  //   }
  // };


  // const startMintingProcess = () => {
  //   createMetaDataAndMint(name, description, getImageData());
  // };

  // const getImageData = () => {
  //   const canvasEl = elementRef.current;
  //   let dataUrl = canvasEl.toDataURL("image/png");
  //   const buffer = Buffer(dataUrl.split(",")[1], "base64");
  //   console.log(buffer);
  //   return buffer;
  // };

  useEffect(() => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  }, [blockchain.smartContract, dispatch]);

  return (
    <s.Screen>
      {blockchain.account === "" || blockchain.smartContract === null ? (
        <s.Container flex={1} ai={"center"} jc={"center"}>
          <s.TextTitle>Connect to the Blockchain</s.TextTitle>
          <s.SpacerSmall />
          <StyledButton
            onClick={(e) => {
              e.preventDefault();
              dispatch(connect());
            }}
          > 
            CONNECT
          </StyledButton>
          <s.SpacerSmall />
          {blockchain.errorMsg !== "" ? (
            <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
          ) : null}
        </s.Container>
      ) : (
        <s.Container flex={1} ai={"center"} style={{ padding: 24 }}>
          <s.TextTitle style={{ textAlign: "center" }}>
            Welcome! Mint your signature!
          </s.TextTitle>
          <s.SpacerLarge/>
          <StyledButton
            onClick={(e) => {
              e.preventDefault();
              // startMintingProcess();
            }}
          > 
            MINT
          </StyledButton>
          <s.SpacerLarge/>
          <SignatureCanvas
            canvasProps={{width:300, height: 350}}
            backgroundColor={"#3271bf"}
            ref={elementRef}
          />
        </s.Container>
      )}
    </s.Screen>
  );
}

export default App;
