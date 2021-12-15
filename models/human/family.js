const Joi = require("joi");
const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
    idHeadOfHouseholdRef:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Human',
        required:true,
    },
    idAddressRef:{
        type: mongoose.Schema.Types.ObjectId,
        required :true,
        ref:'Scope'
    },
    householdCode: {
        type: String,
        required:true,
    },
    members: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Human',
        required:true, 
    }]
})
const Family = mongoose.model("Family",familySchema)
exports.Family = Family
exports.validate = function(family) {
    const schema = Joi.object({
        idHeadOfHouseholdRef:Joi.ObjectId().required(),
        idAddressRef:Joi.ObjectId().required(),
        areaCode : Joi.string().required(),
        members: members.forEach(member=> Joi.ObjectId().required())
    })
    return schema.validate(family)
}