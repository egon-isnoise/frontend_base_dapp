import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import { create } from "ipfs-http-client";
import SignatureCanvas from "react-signature-canvas";
import image from "../src/assets/bkg.png";

const { REACT_APP_IPFS_INFURA_ID, REACT_APP_IPFS_INFURA_SECRET_KEY } = process.env;

const auth =
    'Basic ' + Buffer.from(REACT_APP_IPFS_INFURA_ID+ ':' + REACT_APP_IPFS_INFURA_SECRET_KEY).toString('base64');
    
const ipfsClient = create({
    host: 'infura-ipfs.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});


export const StyledButton = styled.button`
  padding: 8px;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const elementRef = useRef();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [NFTS, setNFTS] = useState([ ]);

  const ipfsBaseUrl = "https://infura-ipfs.io/ipfs/";
  const name = "NFT name";
  const description = "IPFS minted NFT woohooo!";

  const mint = (_uri) => {
    blockchain.smartContract.methods
     .mint(blockchain.account, _uri)
     .send({from: blockchain.account})
     .once("error", (err) => {
      console.log(err);
      setLoading(false);
      setStatus("There has been an error...");
     }).then((receipt) => {
       console.log(receipt);
       setLoading(false);
       ClearCanvas();
       dispatch(fetchData(blockchain.account));
       setStatus("NFT minting successful!");
     });

  };

  const createMetaDataAndMint = async (_name, _des, _imgBuffer) => {
    setLoading(true);
    setStatus("Uploading to IPFS");

    try{
      const addedImage = await ipfsClient.add(_imgBuffer);
      const metaDataObj = {
        name: _name,
        description: _des,
        image: ipfsBaseUrl + addedImage.path,
      };
      const addedMetaData = await ipfsClient.add(JSON.stringify(metaDataObj));
      console.log(ipfsBaseUrl + addedMetaData.path);
      mint(ipfsBaseUrl + addedMetaData.path);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setStatus("There has been an error...");
    }
  }
  
  const startMintingProcess = () => {
    // add the name from an input here
    createMetaDataAndMint(name, description,  getImageData())
  }

  const getImageData = () => {
    const canvasEl = elementRef.current;
    let dataUrl = canvasEl.toDataURL("image/png");
    const buffer = Buffer(dataUrl.split(",")[1], "base64");
    return buffer;
  }

  const fetchMetaDataForNFTS = () => {
    setNFTS([]);
    data.allTokens.forEach((nft) => {
      fetch(nft.uri)
        .then((response) => response.json())
        .then((metaData) => {
             setNFTS((prevState) => [
              ...prevState, 
              {id: nft.id, metaData: metaData}
            ]);
        }).catch((err) => {
          console.log(err);
        });
    });
  }

  const ClearCanvas = () => {
    const canvasEl = elementRef.current;
    canvasEl.clear();
  }

  useEffect(() => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  }, [blockchain.smartContract, dispatch]);

  useEffect(() => {
    fetchMetaDataForNFTS();

  }, [data.allTokens]);

  return (
    <s.Screen backgroundImage={image}>
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

          {loading ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: "center" }}>
                loading...
              </s.TextDescription>
            </>
          ) : null}

          {status !== "" ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: "center" }}>
                {status}
              </s.TextDescription>
            </>
          ) : null}
    
          <s.SpacerLarge/>

          <s.Container  fd={"row"} jc={"center"}>
            <StyledButton
              onClick={(e) => {
                e.preventDefault();
                startMintingProcess();
              }}
            > 
              MINT
            </StyledButton>

            <s.SpacerSmall />

            <StyledButton
              onClick={(e) => {
                e.preventDefault();
                ClearCanvas();
              }}
            > 
              CLEAR
            </StyledButton>
          </s.Container>

          <s.SpacerLarge/>
          <SignatureCanvas
            canvasProps={{width:550, height: 550}}
            backgroundColor={"#3271bf"}
            ref={elementRef}
          />

          <s.SpacerLarge/>
          {data.loading ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: "center" }}>
                loading...
              </s.TextDescription>
            </> 
          ):(
          NFTS.map((nft, index) => {
            return(
              <s.Container key={index} ai={"center"} style={{padding:16}}>
                <s.TextTitle>{nft.metaData.name}</s.TextTitle>
                <img 
                  alt={nft.metaData.name} 
                  src={nft.metaData.image}
                  width={150}
                />
              </s.Container>
            );
          })
        )}
        </s.Container>
      )}
    </s.Screen>
  )
}

export default App;
