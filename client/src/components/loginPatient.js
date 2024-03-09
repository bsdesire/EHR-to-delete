import React from "react";
import { Link } from "react-router-dom";
import "../style.css";
import logo from "../../src/Logo.png"
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Web3 from 'web3'
import { Healthcare } from "./js/Healthcare";
import axios from 'axios';
const FileSaver = require('file-saver');



class loginPatient extends React.Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
   
      const contract = new web3.eth.Contract(Healthcare, "0x281AD0A0F586971Fd35d68AD337D3bE1775eeE26")
      this.setState({ contract })

    const len = await this.state.contract.methods.recordPatCount().call({ from: this.state.account });
    console.log(len);
    var i;
    var name;
    var data = [];

    for (i = len-1; i >= 0; i--) {
     
      var temp = {};
      const details = await this.state.contract.methods.recordPatDetails(i).call({ from: this.state.account });
      console.log(details);
      if (details[2] === "doctor"){
        name = await this.state.contract.methods.returnDocName(details[3]).call({ from: this.state.account });
        console.log(name);
      }
      else{
        name = await this.state.contract.methods.returnLabName(details[3]).call({ from: this.state.account });
        console.log(name)
      }
        temp = {
        "record": details[0],
        "address": details[3],
        "name": name,
        "role": details[2],
        "timestamp": details[1],
      }
      data.push(temp);
    }
    this.setState({ data: data });
 console.log(data);
  }
  constructor(props) {
    super(props)

    this.state = {
      patientHash: '',
      contract: null,

      web3: null,

      account: null,


      data: [],

    }
  }
  
  async downloadFile(hash, name) {
    console.log("download");
    const encryptedKey = await this.state.contract.methods.retrieveKey(hash).call({ from: this.state.account });
    console.log(encryptedKey);

    if (encryptedKey === "") {
      alert('Sorry, you are not permitted for this record');
    } else {
      try {
        const response = await axios.get("https://ivory-mad-smelt-651.mypinata.cloud/ipfs/" + hash + "?pinataGatewayToken=y134JeRV-9ryiDiW_FuCrjGThPN7zZPeRT_z3zuptbS06TxVxKjYOlg1T8WVVZQx");

        const blob = new Blob([response.data], { type: "application/octet-stream" }); // Adjust the MIME type as per your file type
        // Save the blob using FileSaver.js
        FileSaver.saveAs(blob, `report${name}.txt`); // Set desired filename here
      } catch (error) {
        console.error("Error downloading file:", error);
        alert("Error downloading file. Please try again later.");
      }
    }
  }


  render() {
    const detail = this.state.data.map(x =>
      <tr>
         <td><a onClick={()=>this.downloadFile(x.record, x.name)} target='_blank'>{x.record}</a></td>
        <td>{x.address}</td>
        <td>{x.name}</td>
        <td>{x.role}</td>
        <td>{x.timestamp}</td>

        <td>
        <Link to={{
            pathname: '/revoke',
            state: {recRevoke: x.record}
          }}>
            <button type="button" class="btn btn-danger btn-sm" onClick={null}>
              REVOKE
            </button>
          </Link>
        </td>
        <td>
        <Link to={{
            pathname: '/permit',
            state: {recRevoke: x.record}
          }}>
            <button id='permit'
              type="button"
              class="btn btn-success btn-sm"
              data-toggle="modal"
              data-target="#permitModal"
              onClick={null}
            >
              PERMIT
            </button>
          </Link>
        </td>
      </tr>
    );

    return (
      <div>
        <nav className="navbar navbar-expand-sm bg-dark navbar-light">
          <div
            className="nav-item active"
            style={{ color: "black", fontWeight: "bolder" }}
          >
            <img src={logo} width="50px" height="50px" />
          </div>
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to="/">
                <a className="nav-link" style={{ color: "white" }}>
                  HOME
                  </a>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="container-fluid" style={{padding:'25px !important'}}>
          <br />
          <br />
          <table class="table">
            <thead class="thead-dark">
              <tr>
                <th>Records</th>
                <th>Address</th>
                <th>Name</th>
                <th>Role</th>
                <th>Timestamp</th>
                <th>Revoke</th>
                <th>Permit</th>
              </tr>
            </thead>
            <tbody>
              {detail}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default loginPatient;