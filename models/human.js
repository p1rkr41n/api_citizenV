const Joi = require('joi')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const humanSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    // ma ho gia dinh cua noi thuong tru
    familyIdRef:{
        type:String,
        ref:'Family',
        required:true,
    },
    cardId:{
        type:String,
    },
    birth:{
        type:Date,
        required:true,
    },
    job: {
        type:String,
        required:true,
    },
    religion:{
        type:String,
    },
    temporaryResidenceAddressIdRef: {
        type :mongoose.Schema.Types.ObjectId,
        ref:"Address",
        // required:true,
    },
    permanentAddressIdRef :{
        type :mongoose.Schema.Types.ObjectId,
        ref:'Address',
        // required:true,
    },
    gender: {
        type :String,
        enum:["male","female"],
        required :true,
    },
    hometown :{
        type :String,
        required: true,
    },
    educationalLevel :{
        type: String,
        required : true,
    }
})

exports.validate = function(human){
    const schema = Joi.object({
        name: Joi.string().required(),
        cardId: Joi.string(),
        birth:Joi.date().required(),
        job: Joi.string().required(),
        religion: Joi.string().required(),
        temporaryResidenceAddress:Joi.ObjectId().required(),
        permanentAddress:Joi.ObjectId().required(),
        gender:Joi.string().required,
        hometown:Joi.String().required(),
        educationalLevel:Joi.string().required(),
        familyIdRef:Joi.ObjectId().required()
    })
    return schema.validate(human)
}

const Human = mongoose.model("Human",humanSchema)
exports.Human = Human