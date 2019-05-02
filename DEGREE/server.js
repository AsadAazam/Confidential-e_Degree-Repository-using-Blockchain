const ethers =require('ethers'); //Ethers is a javascript for dapps, an advanced version of web3.js
var express = require('express');//Express is a server, same as lite-server
var sha256 = require('js-sha256');//sha-256 is a standard js library to perform SHA encryption.
var bodyParser = require('body-parser');
var app = express();
var provider =ethers.getDefaultProvider('ropsten');
var address='0x85f43e0991ec2affe4da044eb98c7d3897ca9dc5';//Address of deployed contract
var bytecode= "0x6060604052341561000f57600080fd5b6101b08061001e6000396000f30060606040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632b26131714610051578063bbe896bf146100a0575b600080fd5b341561005c57600080fd5b6100646100e1565b60405180846000191660001916815260200183600019166000191681526020018260001916600019168152602001935050505060405180910390f35b34156100ab57600080fd5b6100df60048080356000191690602001909190803560001916906020019091908035600019169060200190919050506100f9565b005b60008060008054600154600254925092509250909192565b8260008160001916905550816001816000191690555080600281600019169055507f089d14f35b43460b80fd765e44f706d3f0abbcb213ff9cfd03e2da9599452f2e60005460015460025460405180846000191660001916815260200183600019166000191681526020018260001916600019168152602001935050505060405180910390a15050505600a165627a7a723058200871f5c5173a6c47f51d2fbfdc9a371b2e0599303ed9511137f2490e8a51de270029";//Byttecode of our contract
var abi=[
  {
    "constant": false,
    "inputs": [
      {
        "name": "_hash1",
        "type": "bytes32"
      },
      {
        "name": "_hash2",
        "type": "bytes32"
      },
      {
        "name": "_rollno",
        "type": "bytes32"
      }
    ],
    "name": "setDegree",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "hash1",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "hash2",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "rollno",
        "type": "bytes32"
      }
    ],
    "name": "Degree",
    "type": "event"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getDegree",
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      },
      {
        "name": "",
        "type": "bytes32"
      },
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];//ABI of our contract

var privateKey='677A5358B877B0E8723E44EECA853513E140D5A882E84FAF74C67F40EA498225';//Our private key. Since it doenst use Metamask, we have to provide our private KEY by our own.
var wallet = new ethers.Wallet(privateKey,provider);
var contract = new ethers.Contract(address,abi,wallet);
app.use(express.static('public'));
app.use(bodyParser());
var mysql = require('mysql');
var roll=0;
var hash1="";
var con = mysql.createConnection({
host: "localhost",
user: "root",
password: "Vampire21",
database: "blockchain"
});//Creating a connection to communicate with our database!!

con.connect(function(err) {
if (err) throw err;
console.log("Connected!");
});//If connects successfullu, return "Connected", else throw an error.

// create application/json parser
var jsonParser = bodyParser.json();
app.get('/', function(request, response) {
response.sendFile(__dirname + '/views/index.html');
});

app.post('/login',jsonParser,(request,response)=>{
  var sql='SELECT * FROM login  where User= ("'+request.body.username+'")'
  con.query(sql,(error,result)=>{
    if(error){
      console.log(error)
      response.send("Somethig went wrong plz try again")
    }
    else if(result.length==0){
       response.send ("incorrect user name or password")
    }
    else{
      var pass=result[0].Pass;
      hashpass=sha256(request.body.pass);
      if(pass==hashpass)
      {
        response.sendFile(__dirname+'/views/Form.html')
      }
      else{
        response.send("Incorrect UserName or password")
      }
    }
  })
})
app.get('/validate', function(request, response) {
response.sendFile(__dirname + '/views/validate.html');
});

//Our main function
app.post('/addUser', jsonParser, function(request, response) {
roll =request.body.rollNo;
console.log("Roll number of student is: "+roll);
//A sample SQL query:- var sql=  'INSERT INTO first  VALUES ("'+request.body.user+'","'+request.body.password+'")';
var sql='INSERT INTO student  VALUES ("'+request.body.rollNo+'","'+request.body.univName+'","'+request.body.studName+'","'+request.body.fatherName+'","'+request.body.course+'","'+request.body.dateOfAward+'","'+request.body.grade+'")';
con.query(sql,function(err,request)
{
    if(err)
    throw err;
    console.log("1 data is inserted with roll no "+roll);//Confirm that data is inserted.
});
encrypt();//Calling our main function Encrypt().
response.sendFile(__dirname+"/views/deploy.html");
});

var st="";

function encrypt()
{
var sql2='SELECT * FROM student  where rollNo= ("'+roll+'")';
con.query(sql2,(error,data)=>
{
if(error)
{
    return console.log("Record can't be fetched for further deployment!! Re-deploy or contact adminstrator.", error)
}
var a=data[0].rollNo;
var b=data[0].univName;
var c=data[0].studName;
var d=data[0].fatherName;
var e=data[0].course
var f=data[0].dateOfAward;

console.log(f,"date")
var g=data[0].grade;
st=st+a+b+c+d+e+f+g;
console.log("Record to perform SHA is: "+st); 
hash1=sha256(st);
console.log("Before concatenation, SHA 256 hash is: "+hash1);
//Now we will concatenate SHA 256 hash(64 bit) with rollnumber(10bit) and then slice it into three parts(s1,s2 and roll) and store these 3 parts in our blockchain.
var s1=hash1.substring(0,29);
var s2=hash1.substring(29,58);
var roll1=hash1.substring(58)+roll;
s1=ethers.utils.formatBytes32String(s1);
s2=ethers.utils.formatBytes32String(s2);
roll1=ethers.utils.formatBytes32String(roll1);
console.log("Final data to be stored in blockchain is");
console.log(s1);
console.log(s2);
console.log(roll1);
var set=contract.setDegree(s1,s2,roll1);
set.then(function(transaction){
console.log("Transaction is");
console.log(transaction);
console.log("Contract address is "+contract.address);
console.log("Hash of txn is "+transaction.hash);

//Now we will be storing txHash and roll no of that student in a separate table, so that credentials can be provided to student with ease.    
var sql1='INSERT INTO records  VALUES ("'+roll+'","'+transaction.hash+'")';
con.query(sql1,function(err,request)
{
if(err)
{
  
return console.log(err)
}
console.log("1 transaction is recorded with roll no "+roll);

});
}).catch((error)=>{
	console.log("Something went wrong try again")
});

});

  
};
app.post("/validateUser/",(request,response)=>{
  const rollNo=request.body.rollNo
  console.log(rollNo)
  var sql="Select txhash from records where rollno="+rollNo+";"
  con.query(sql,(error,data)=>
  {
    if(error)
    {
      return console.log("No such student", error)
    }
    const txhash=data[0].txhash
    console.log(txhash)
    provider.getTransaction(txhash).then((transactionCount) => {
      const data= transactionCount.data
      console.log(data);
    var txData=data.substring(10,68)+data.substring(74,132)+data.substring(138,170);
    console.log(txData);
      

  })
  
    
    
});
})
//Specifyingg the port address where this project will be deployed.
app.listen(3000)