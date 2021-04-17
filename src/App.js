import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json';
import Token from './artifacts/contracts/Token.sol/Token.json';

const greeterAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

function App() {
  const [greeting, setGreetingValue] = useState('')
  const [renderedGreeting, setRenderedGreeting] = useState('')
  const [userAccount, setUserAccount] = useState('')
  const [amount, setAmount] = useState(0)
  const [renderedBalance, setRenderedBalance] = useState('')

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  }

  async function getBalance() {
    if(typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider)
      const balance = await contract.balanceOf(account)
      setRenderedBalance(balance.toString())
      console.log("Balance: ", balance.toString())
    }
  }

  async function sendCoins() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      const transaction = await contract.transfer(userAccount, amount);
      await transaction.wait();
      console.log(`${amount} Coins successfully sent to ${userAccount}`);
    }
  }

  async function fetchGreeting() {
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
      try {
        const data = await contract.greet()
        setRenderedGreeting(data)
        console.log('data: ', data)
      } catch(err) {
        console.log('Error: ', err)
      }
    }
  }

  async function setGreeting() {
    if(!greeting) return
    if(typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(greeting)
      setGreetingValue('')
      await transaction.wait()
      fetchGreeting()
    }
  }

  return (
    <div className="App">
      <header className="App-header">

        <h1 style={{color: "#FFF"}}>{renderedGreeting || "Hello :)"}</h1>
        <input 
          onChange={e => setGreetingValue(e.target.value)}
          placeholder="Set greeting"
          value={greeting}
        />
        <button onClick={fetchGreeting}>Fetch Greeting</button>
        <button onClick={setGreeting}>Set Greeting</button>

        <br/>

        <h2 style={{color: "#FFF"}}>{renderedBalance}</h2>
        <input 
          onChange={e => setUserAccount(e.target.value)}
          placeholder="Account Id"
        />
        <input 
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
        />
        <button onClick={getBalance}>Get Balance</button>
        <button onClick={sendCoins}>Send Coins</button>
      </header>
    </div>
  );
}

export default App;
