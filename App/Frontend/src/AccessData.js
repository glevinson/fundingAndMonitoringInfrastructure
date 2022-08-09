import { useState } from "react";
import { ethers } from "ethers";
import ErrorMessage from "./ErrorMessage";
import axios from "axios";

// import village from '/Users/gus/springdao_nfts/test-frontend/Backend/Ndemban_The_Gambia.png'


export default function AccessData() {
  const [error, setError] = useState();// Start from empty array of projects
  const [data, setData] = useState([]); // Just did null as this funciton equivalent to their setWords

  // This requests the data from the backend with the sig2 state & updates the 
  // data state accordingly
  // *********************************************************************************
  const getData = (sig) => {
    const options = { 
      method: 'GET',
      url: 'http://localhost:8000/accessData',
      params: { signature: sig },
    }

    axios.request(options).then((response) => {
      console.log("response.data: " + response.data)
      setData(response.data) // Saves GET response to State variable 'data'

    }).catch((error) => {
      console.error(error)
    })

    // fetch("http://localhost:8000/accessData")
    // .then(res => res.json())
    // .then(data => {
    //   console.log
    // })

  }
  // *********************************************************************************
  // Calls signMessage &, if there is a signature, sets signatures state &
  // sets sig2 state
  // ****************************************************************************** 
  const handleSign = async (e) => {
    e.preventDefault();
    setError(); // Clearing the error (assume)
    const message = "I would like to see my Spring DAO data"

    try {
      console.log({ message });
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");

      await window.ethereum.send("eth_requestAccounts");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      getData(signature)

    } catch (err) {
      setError(err.message);
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
        {data.map((project) => {
          return (
            <div className="p-2" key = {project.name}>
              <div className="my-3">
                <p>Project Name: {project.name}</p>
                <img
                  // crossOrigin="Anonymous"
                  // src={village}
                  src={project.url}
                  // alt="Image Data"
                  alt='Project Data'
                />
                {/* <img src="https://i.ibb.co/D7K5sJ5/Screenshot-2022-08-09-at-14-41-09.png" alt="Screenshot-2022-08-09-at-14-41-09" border="0" /></a> */}
              </div>
            </div>
          );
        })}
      </div>
    </form>
  ); 
}
