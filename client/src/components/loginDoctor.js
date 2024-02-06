import React from "react";
import { Link } from "react-router-dom";
import "../style.css";
import logo from "../../src/Logo.png"
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Employee from "./.cph/app";
import Web3 from 'web3';
import {Healthcare} from "./js/Healthcare.js";
import { encryptKey, encryptFile, decryptKey ,decryptFile, uintToString } from "./js/encryption.js";
import ipfs from './js/ipfs';
const FileSaver = require('file-saver');

//change data variable


class loginDoctor extends React.Component {




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
   
      const contract = new web3.eth.Contract(Healthcare, "0xB79f4C6e234297BD51da7EE20Ae02efAB4DEf75D");
      this.setState({ contract })

    console.log(accounts)
    var account = this.state.account;
    var fromAcc = account.toString();

    //calling smart contract
    var data = [];
    const len = await this.state.contract.methods.recordDocCount().call({ from: fromAcc });
    for (var i = len - 1; i >= 0; i--) {
      const details = await this.state.contract.methods.recordDocDetails(i).call({ from: fromAcc });
      const isPermit=await this.state.contract.methods.retrieveKey(details[0]).call({ from: fromAcc });
      console.log(isPermit);
      if(details != ""){
      var temp = {};
      const patName = await this.state.contract.methods.returnPatName(details[2]).call({ from: fromAcc });
      temp = { "ipfsLink": details[0], "timestamp": details[1], "patientAddress": details[2], "patientName": patName }
      data.push(temp);
    }
    
   

  }
    this.setState({ data: data });
    console.log(data);

    var pdata = [];
    const plen = await this.state.contract.methods.recordPDocCount().call({ from: fromAcc });
    for (var i = plen - 1; i >= 0; i--) {
      const details = await this.state.contract.methods.recordPDocDetails(i).call({ from: fromAcc });
      const isPermit=await this.state.contract.methods.retrieveKey(details[0]).call({ from: fromAcc });
      if(isPermit != ""){
      var temp = {};
      const patName = await this.state.contract.methods.returnPatName(details[1]).call({ from: fromAcc });
      temp = { "ipfsLink": details[0], "patientAddress": details[1], "patientName": patName }
      pdata.push(temp);
      }
    }
    this.setState({ pdata: pdata });
 console.log(pdata);


  }


  constructor(props) {
    super(props);
    this.state = {
      data: [],
      pdata:[],
      web3: null,
      contract: null,
      account: null,
      buffer: null,
      file: null
    }
  }



  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]

    this.setState({ file: file })

    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
    }

  }


  async downloadFile(hash){
    console.log("download");
    const encryptedKey = await this.state.contract.methods.retrieveKey(hash).call({ from: this.state.account });
    console.log(encryptedKey);
    if (encryptedKey == "") {
      alert('Sorry, you are not permitted for this record');
      
    }
    else {

      const decryptedKey = decryptKey(encryptedKey, this.state.account);
     
      ipfs.get(hash, function (err, files) {
        files.forEach((file) => {
          
          const content = uintToString(file.content);
         
          const decryptedfile = decryptFile(content, decryptedKey);
          // document.getElementById('modalReport').innerHTML = decryptedFile
          // $('#exampleModalLong').modal()
          alert(decryptedfile);
          
          // var blob = new Blob([decryptedfile], { type: "text/plain;charset=utf-8" });
          // FileSaver.saveAs(blob, "doc.txt"); 

        })
      })
   

    }
  }


  render() {

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
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12 wrapper">
              <div id="formContent" style={{ padding: "5%" }}>
                <h3>DOCTOR'S LOGIN:</h3>
                <hr />
                <div>
                  <label>
                    Upload Your Question :-
                    <input type="file" onChange={this.captureFile} />
                  </label>

                  <br />
                  <br />
                  <Employee 
                  data={this.state.buffer}
                  from={"doc"}
                  file={this.state.file}/>
                </div>
              </div>
            </div>
         
            <div className="col-md-12 ml-auto mr-5 my-5 wrapper">
            <h3>You have uploaded these...</h3>
            <hr/>
              <table class="table">
                <thead class="thead-dark">
                  <tr>
                    <th>Patient Name</th>
                    <th>Patient Address</th>
                    <th>Timestamp</th>
                    <th>IPFS link </th>
                  </tr>
                </thead>

                <tbody>
                  {this.state.data.map(x =>
                    <tr>
                      <td>{x.patientName}</td>
                      <td>{x.patientAddress}</td>
                      <td>{x.timestamp}</td>
                      <td><a href={"https://ivory-mad-smelt-651.mypinata.cloud/ipfs/" + x.ipfsLink + "?pinataGatewayToken=y134JeRV-9ryiDiW_FuCrjGThPN7zZPeRT_z3zuptbS06TxVxKjYOlg1T8WVVZQx"} className="btn btn-primary" data-toggle="modal" data-target="#exampleModalLong" onClick={()=>this.downloadFile(x.ipfsLink)} target="_blank">{x.ipfsLink}</a></td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <br>
            </br>

  
          <div className="modal fade" id="exampleModalLong" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLongTitle">Modal title</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body-report" id="modalReport">
                  <span id="reportContent">...</span>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-success" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
                
            <div className="col-md-12 ml-auto mr-5 my-5 wrapper">
            <h3>You can view these...</h3>
            <hr/>
              <table class="table">
                <thead class="thead-dark">
                  <tr>
                    <th>Patient Name</th>
                    <th>Patient Address</th>
                   
                    <th>IPFS link </th>
                  </tr>
                </thead>

                <tbody>
                  {this.state.pdata.map(x =>
                    <tr>
                      <td>{x.patientName}</td>
                      <td>{x.patientAddress}</td>
                      
                      <td><a href={"https://ivory-mad-smelt-651.mypinata.cloud/ipfs/" + x.ipfsLink + "?pinataGatewayToken=y134JeRV-9ryiDiW_FuCrjGThPN7zZPeRT_z3zuptbS06TxVxKjYOlg1T8WVVZQx"} onClick={()=>this.downloadFile(x.ipfsLink)}target='_blank'>{x.ipfsLink}</a></td>
                    </tr>)}
                </tbody>
              </table>
            </div>

          </div>
        </div></div>
    );
  }
}

export default loginDoctor;
