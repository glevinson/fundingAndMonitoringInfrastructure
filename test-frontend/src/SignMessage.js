import { useState, useRef } from "react";
import { ethers } from "ethers";
import ErrorMessage from "./ErrorMessage";
import axios from "axios";

export default function SignMessage() {
  const resultBox = useRef();
  const [signatures, setSignatures] = useState([]);
  const [error, setError] = useState();
  const [data, setData] = useState(null); // Just did null as this funciton equivalent to their setWords
  const [sig2, setSig2] = useState(null) // As this equivalent to their chosen level

  const signMessage = async ({ setError/*, message*/ }) => {
    const message = "I would like to see my Spring DAO data"
    
    // This requests the data from the backend with the sig2 state & updates the 
    // data state accordingly
    // *********************************************************************************
    const getData = () => {
        const options = {
            method: 'GET',
            url: 'http://localhost:8000/accessData',
            params: {signature: sig2},
        }
    
        axios.request(options).then((response) => {
            console.log("response.data: " + response.data)
            setData(response.data) // Saves GET response to State variable 'data'
    
        }).catch((error) => {
            console.error(error)
        })
    }
    // *********************************************************************************
    
      try {
        console.log({ message });
        if (!window.ethereum)
          throw new Error("No crypto wallet found. Please install it.");
    
        await window.ethereum.send("eth_requestAccounts");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signature = await signer.signMessage(message);
        const address = await signer.getAddress();
        getData()   

        return {
          message,
          signature,
          address
        };
      } catch (err) {
        setError(err.message);
      }
    };

  // Calls signMessage &, if there is a signature, sets signatures state &
  // sets sig2 state
  // ******************************************************************************
  const handleSign = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setError();
    const sig = await signMessage({
      setError,
      message: data.get("message")
    });
    if (sig) {
      setSignatures([...signatures, sig]);
      setSig2(sig.signature);
      console.log(sig2)
    }
  };
  // ******************************************************************************

  return (
    <form className="m-4" onSubmit={handleSign}>
      <div className="credit-card w-full shadow-lg mx-auto rounded-xl bg-white">
        <main className="mt-4 p-4">
          <h1 className="text-xl font-semibold text-gray-700 text-center">
            Spring DAO Data Access
          </h1>
          {/* <div className="">
            <div className="my-3">
              <textarea
                required
                type="text"
                name="message"
                className="textarea w-full h-24 textarea-bordered focus:ring focus:outline-none"
                placeholder="Message"
              />
            </div>
          </div> */}
        </main>
        <footer className="p-4">
          <button
            type="submit"
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            View My Project Data!
          </button>
          <ErrorMessage message={error} />
        </footer>
        {signatures.map((sig, idx) => {
        // {signatures.map((sig) => {
          return (
            <div className="p-2" key={sig}>
              <div className="my-3">
                <p>
                  {/* Message {idx + 1}: {sig.message} */}
                  Message: {sig.message}
                </p>
                <p>Signer: {sig.address}</p>
                <textarea
                  type="text"
                  readOnly
                  ref={resultBox}
                  className="textarea w-full h-24 textarea-bordered focus:ring focus:outline-none"
                  placeholder="Generated signature"
                  value={data}
                />
              </div>
            </div>
          );
        })}
      </div>
    </form>
  );
}
