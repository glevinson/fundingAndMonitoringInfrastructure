import { useState } from "react";
import { ethers } from "ethers";
import ErrorMessage from "./ErrorMessage";
import axios from "axios";

export default function AccessData() {
  const [error, setError] = useState();// Start from empty array of projects
  const [data, setData] = useState([]); // Just did null as this funciton equivalent to their setWords

  // Requests specified signature's data from the backend & updates 'data'/'error' accordingly:
  // ***********************************************************************************************************
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
  }

  // Prompts user to sign 'message' using a crypto wallet & displays data corresponding to the account address
  // ***********************************************************************************************************
  const handleSign = async (e) => {
    e.preventDefault();
    setError(); // Clearing the error (assume)
    const message = "I would like to see my Spring DAO data"

    try {
      console.log({ message });
      // Checking user has a crpto wallet:
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");

      // Retrieving signature:
      await window.ethereum.send("eth_requestAccounts");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      getData(signature)

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="m-4" onSubmit={handleSign}>
      <div style={{width: '100vw', height: '100vh'}} className="credit-card w-full shadow-lg mx-auto rounded-xl bg-white">
        <main className="mt-4 p-4">
          <h1 className="text-5xl font-semibold text-gray-700 text-center">
            Spring DAO Data Access
          </h1>
        </main>
        <div className="p-4">
          <button
            type="submit"
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            View My Project Data!
          </button>
          <ErrorMessage message={error} />
        </div>
        {data.map((project) => {
          console.log("Project: " + project)
          if (project == null){
            return (    
              <div className="p-4" >
                <footer className="text-2xl font-semibold text-gray-700 text-center">
                  <p>No Data For This Address / Invalid Signature</p>
                </footer> 
              </div>       
            ); 
          }
          else{
          return (
            <div className="p-2" key = {project.name}>
              <div className="text-2xl font-semibold text-gray-700">
                <p>Project Name: {project.name}</p>
                <img
                  src={project.url}
                  alt='Image Of Project Data'
                />
              </div>
            </div>
          );}
        })}
      </div>
    </form>
  ); 
}
