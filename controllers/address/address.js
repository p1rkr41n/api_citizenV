const { Address } = require("../../models/address/address")
const { Scope } = require("../../models/address/scope")
const mongoose = require('mongoose')
const { findAddressById, isValidAddress } = require("./utilAddress")
const ObjectId =mongoose.Types.ObjectId

//get _id,name of areas that managed by area{id} or country
const getScopes = async function(req,res,next) {

    if(!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send('invalid id')

    let filter ={}
    //url: /country/scopes
    if(!req.url.includes('country')) 
        filter.belongToIdScopeRef = new ObjectId (req.params.id)
    //url: /.../:id/scopes
    else filter.typeOfScope ='city'
    //find scope by filter
    return Scope.find(filter).select('_id name' )
    .then(result=> {
        if(result.length) return res.status(200).send(result)
        return res.status(404).send('not found')
    })
    .catch(err=>res.send(err))
}

//get _id name of country(or area{country})
const getScopeById = async function(req,res,next) {
    if(!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send('invalid id')

    const typeOfScope = req.url.split('/')[1]
    let process
    if(req.url.includes('country')) 
        process = Scope.find({typeOfScope:typeOfScope}).select('_id name' )
    else 
        process = Scope.find({_id:new ObjectId(req.params.id),typeOfScope:typeOfScope}).select('_id name' )
    
    return process
        .then(result=> {
            if(result) return res.status(200).send(result)
            return res.status(404).send('not found')
        })
        .catch(err=>res.status(500).send(err))
}
//get fullAddress(country,city,district,commune,village) by id
const  getAddressById =async (req,res,next)=> {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send("Invalid Id");

    const address = await findAddressById(req.params.id)
    if (!address) {
      return res.status(404).send("not found");
    }
    return res.status(200).send(address);
  }
const getAddresses = async function(req,res,next){
    const addresses = await Address.find({}).populate('idCityRef idDistrictRef idCommuneRef idVillageRef')
    return addresses
}

module.exports={
    getScopes,
    getScopeById,
    getAddressById,
    getAddresses
}
