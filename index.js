const express = require('express');
const config = require('config');
const jwt =require('jsonwebtoken');
const app = express();

const port =3000;
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin123456:admin123456@cluster0.qelzb.mongodb.net/citizenV?retryWrites=true&w=majority',{
    useNewUrlParser:true,
    useUnifiedTopology:true
});
const { User } = require('./models/user');
const { Role } = require('./models/role');
const { Scope } = require('./models/scope');

const routes = require('./routes');
// ip address 1.55.164.204/32
//admin123456
//mongodb+srv://admin123456:<password>@cluster0.qelzb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority


// create application/json parser
app.use(express.json());
// create application/x-www-form-urlencoded parser
app.use(express.urlencoded({ extended: true }));
//{username,password} => server
//server=>token
app.use("/api/auth",routes.auth); 
//crud user
app.use("/api/user",routes.user);
//crud info
app.use("/api/info",routes.info);

app.use("/api/address",routes.address);

app.listen(port,()=>{
    console.log('app listening at http://localhost:'+port)
})