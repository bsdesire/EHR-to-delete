import React, { Component } from "react";
import "../../style.css";
import "../../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import QR from "./qr";
import Web3 from 'web3';
import { Healthcare } from "../js/Healthcare.js"
import { encryptKey, encryptFile, decryptKey } from "../js/encryption.js";
import ipfs from '../js/ipfs'
import fs from 'fs';

const { Readable } = require('stream'); // Import the Readable class from the 'stream' module

const cryptoRandomString = require('crypto-random-string');
//const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK('97d054fd0ad5b021e0a8', '7fcdafeade8a45f0de5623cdbec7daf461e1f85fd8966329b54be8b064f6a054');

// import {generate} from "..js/aeskey.js"
class Employee extends Component {


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
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const contract = new web3.eth.Contract(Healthcare, "0x7c94D29C5fee403968Da9CE5404666B44e36244c");
    this.setState({ contract })


    var account = await web3.eth.getAccounts()
    var fromAcc = account.toString();
  }

  constructor(props) {
    super(props);
    this.state = {
      cam: false,
      web3: null,
      contract: null,
      account: null,
      value: ""
    };
  }

  async addPatient() {
    this.state.contract.methods.addPatient(this.state.value, this.props.data).send({ from: this.state.account }).then((r) => {
      console.log("added patient");
      window.alert('Patient added successfully')
      return window.location.reload();
    })

  }
  async addDoctor() {
    this.state.contract.methods.addDoctor(this.state.value, this.props.data).send({ from: this.state.account }).then((r) => {
      console.log("added doc");
      window.alert('Doctor added successfully')
      return window.location.reload();
    })

  }
  async addLab() {
    this.state.contract.methods.addLab(this.state.value, this.props.data).send({ from: this.state.account }).then((r) => {
      console.log("added lab");
      window.alert('Lab added successfully')
      return window.location.reload();
    })

  }
  async addStateAdmin() {
    console.log(this.props.data);
    console.log(this.props.data.name);
    this.state.contract.methods.addStateAdmin(this.state.value, this.props.data.name, this.props.data.statename).send({ from: this.state.account }).then((r) => {
      console.log("added admin");
      window.alert('State admin added successfully')
      return window.location.reload();
    })

  }
  async addAdmin() {
    console.log(this.state.value);
    this.state.contract.methods.addHospitalAdmins(this.state.value, this.props.data.name, this.props.data.hospital).send({ from: this.state.account }).then((r) => {
      console.log("added admin");
      window.alert('Admin added successfully')
      return window.location.reload();
    })

  }
  async addReceptionist() {
    this.state.contract.methods.addReceptionist(this.state.value, this.props.data).send({ from: this.state.account }).then((r) => {
      console.log("added recep");
      window.alert('Receptionist added successfully')
      return window.location.reload();
    })

  }


  //doc and lab upload record
  async reportUpload() {
    var today = new Date();
    var date = today.getDate() + "-" + parseInt(today.getMonth() + 1) + "-" + today.getFullYear();

    const formData = new FormData();
    formData.append("file", this.props.file);

    const aeskey = cryptoRandomString({ length: 32 });
    const encryptedKey = encryptKey(this.state.value, aeskey);
    console.log('Encrypted key', encryptedKey);

    const config = {
      method: "POST",
      maxContentLength: Infinity,
      headers: {
        pinata_api_key: "97d054fd0ad5b021e0a8",
        pinata_secret_api_key: "7fcdafeade8a45f0de5623cdbec7daf461e1f85fd8966329b54be8b064f6a054",
      },
      body: formData,
    };

    try {
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", config);

      const result = await response.json();


      try {
        await this.state.contract.methods
          .sendIPFS(result.IpfsHash, this.state.value, encryptedKey, date)
          .send({ from: this.state.account });

        console.log("Added report");
        window.alert('You have added report successfully');
        window.location.reload();
      } catch (error) {
        console.error("Error adding report:", error);
      }
    } catch (error) {
      console.log(error);
    }

    /*

    
    console.log('aes key', aeskey);

    console.log('props', this.props);

    const encryptedfile = encryptFile(this.props.data.toString(), aeskey);
    console.log('encrypted file', encryptedfile);

    const encryptedKey = encryptKey(this.state.value, aeskey);
    console.log('Encrypted key', encryptedKey);

    const buffer1 = Buffer.from(encryptedfile.toString());

    // Convert Buffer to a readable stream
    const stream = new Readable();
    stream.push(buffer1);
    stream.push(null); // Signal end of data
    
    ipfs.add(stream, async (error, result) => {
      if (error) {
        console.error(error);
        return;
      }

      console.log('ipfs results', result);

      try {
        await this.state.contract.methods
          .sendIPFS(result.hash, this.state.value, encryptedKey, date)
          .send({ from: this.state.account });

        console.log("Added report");
        window.alert('You have added report successfully');
        window.location.reload();
      } catch (error) {
        console.error("Error adding report:", error);
      }
    });*/
  }

  //revoke
  async revoke() {
    const isPermit = await this.state.contract.methods.permitOrNot(this.props.data, this.state.value).call({ from: this.state.account });
    if (isPermit === "") {
      window.alert('You have not given any permission to this user')
    }
    else {
      this.state.contract.methods.removePermission(this.props.data, this.state.value).send({ from: this.state.account }).then((r) => {
        console.log("Revoked");
        window.alert('Permission revoked successfully')
      })
    }
  }


  //permit
  async permit() {

    const encryptedKey = await this.state.contract.methods.retrieveKey(this.props.data).call({ from: this.state.account });

    const isPermit = await this.state.contract.methods.permitOrNot(this.props.data, this.state.value).call({ from: this.state.account });
    if (isPermit === "") {
      const decryptedKey = decryptKey(encryptedKey, this.state.account);

      const newEncryptKey = encryptKey(this.state.value, decryptedKey);

      this.state.contract.methods.createPermission(this.props.data, newEncryptKey, this.state.value).send({ from: this.state.account }).then((r) => {
        console.log("Permitted");
        window.alert('Permission given successfully')
      })
    }
    else {
      window.alert('You have already given permission to this user')

    }

  }
  getValueFromChild(value) {
    console.log(value);
    this.setState({
      value: value
    })
  }

  render() {
    return (
      <>
        <input
          id="input"
          className="form-control"
          value={this.state.value}
          onChange={(e) => {
            this.setState({ value: e.target.value });
          }}
          style={{
            width: "100%",
            height: "100%",
            marginTop: "5%",
            marginBottom: "5%",
          }}
          placeholder="Enter Public Address"></input>
        <p className="text-center">OR</p>
        <button
          className="btn btn-success btn-block my-2"
          onClick={() => {
            this.setState({ cam: !this.state.cam });
          }}
        >
          {this.state.cam ? "Close QR code Scanner" : "Open QR code Scanner"}
        </button>

        <p className="my-2 text-dark">
          {" "}
          {this.state.cam ? <QR gettingValues={this.getValueFromChild.bind(this)} /> : "Click on button to read Qr data"}{" "}
        </p>

        {this.props.from === "doc" && <button type='submit'
          onClick={() => {
            this.setState({ parab: !this.state.parab });
            this.reportUpload()

          }}
          className="btn btn-success my-2"
        >
          Submit
        </button>}
        {this.props.from === "lab" && <button type='submit'
          onClick={() => {
            this.setState({ parab: !this.state.parab });
            this.reportUpload()

          }}
          className="btn btn-success my-2"
        >
          Submit
        </button>}

        {this.props.from === "revoke" && <button type='submit'
          onClick={() => {
            this.setState({ parab: !this.state.parab });
            this.revoke()

          }}
          className="btn btn-success my-2"
        >
          Submit
        </button>}
        {this.props.from === "permit" && <button id='permitsubmit' type='submit'
          onClick={() => {
            this.setState({ parab: !this.state.parab });
            this.permit()

          }}
          className="btn btn-success my-2"
        >
          Submit
        </button>}
        {this.props.from === "recepPat" && <button type='submit'
          onClick={() => {
            this.setState({ parab: !this.state.parab });
            this.addPatient();

          }}
          className="btn btn-success my-2"
        >
          Submit
        </button>}
        {this.props.from === "superAdmin" && <button type='submit'
          onClick={() => {
            this.setState({ parab: !this.state.parab });

            this.addStateAdmin();

          }}
          className="btn btn-success my-2"
        >
          Submit
        </button>}
        {this.props.from === "stateAdmin" && <button type='submit'
          onClick={() => {
            this.setState({ parab: !this.state.parab });

            this.addAdmin();

          }}
          className="btn btn-success my-2"
        >
          Submit
        </button>}
        {this.props.from === "adminDoc" && <button type='submit'
          onClick={() => {
            this.setState({ parab: !this.state.parab });
            this.addDoctor();

          }}
          className="btn btn-success my-2"
        >
          Submit
        </button>}
        {this.props.from === "adminLab" && <button type='submit'
          onClick={() => {
            this.setState({ parab: !this.state.parab });
            this.addLab();

          }}
          className="btn btn-success my-2"
        >
          Submit
        </button>}
        {this.props.from === "adminRecep" && <button type='submit'
          onClick={() => {
            this.setState({ parab: !this.state.parab });
            this.addReceptionist();

          }}
          className="btn btn-success my-2"
        >
          Submit
        </button>}
      </>
    );
  }
}
export default Employee;
