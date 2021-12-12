const Joi = require('joi')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const addressSchema= new Schema({
    cityIdRef:{
        type: mongoose.Schema.Types.ObjectId,
        ref :'Scope',
        required:true,
    },
    districtIdRef:{
        type: mongoose.Schema.Types.ObjectId,
        ref :'Scope',
        required:true,
    },
    communeIdRef:{
        type: mongoose.Schema.Types.ObjectId,
        ref :'Scope',
        required:true,
    },
    villageIdRef:{
        type: mongoose.Schema.Types.ObjectId,
        ref :'Scope',
    }
})
exports.validate = function(address) {
    const schema = Joi.object({
        cityIdRef:Joi.ObjectId().required(),
        districtIdRef:Joi.ObjectId().required(),
        conmmuneIdRef:Joi.ObjectId().required(),
        villageIdRef:Joi.ObjectId().required(),

    })
    return schema.validate(address)
}

const Address = mongoose.model("Address",addressSchema)
exports.Address= Address