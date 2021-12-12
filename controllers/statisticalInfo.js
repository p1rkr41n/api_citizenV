const { User } = require("../models/user")
const {Scope} = require('../models/scope')
const { Family } = require("../models/family")
const { Human } = require("../models/human")
const ObjectId = require('mongoose').Types.ObjectId
const { isValidObjectId } = require("mongoose")
const { Address } = require("../models/address")

const getInfoScopeById = async function(req,res,next) {
    if(!isValidObjectId(req.params.id)) 
        return res.status(400).send('invalid id')
    const typeOfScope = req.url.split('/')[1]
    const scope = await Scope.findOne({typeOfScope:typeOfScope,_id:new ObjectId(req.params.id)})
    if(!scope) return res.status(404).send('not found')
    if(!scope.areaCode.startsWith(req.decodedToken.username)) 
        return res.status(403).send('This scope is not managed by you')
    if((scope.areaCode.startsWith(req.decodedToken.username)&&req.decodedToken.role!='A1')||req.decodedToken.role =='A1'){
        const ref={}
        ref[`${typeOfScope}IdRef`] = scope._id
        return Address.find(ref).select("_id")
                .then(addresses=> 
                    //dem nguoi co dia chi tam tru tai scope
                     Human.countDocuments({temporaryResidenceAddress: {$in: addresses}}))
                    //dem =promise.all
                    //convert data to json before send data
                .then(data=>res.status(200).send({data:data}))
                .catch(err=> res.status(400).send(err))
    }
    return res.status(400).status('This scope is not managed by you')

}

const declare = async function(req,res,next) {
    // name: Joi.string().required(),
    //     cardId: Joi.string().required(),
    //     birth:Joi.date().required(),
    //     job: Joi.string().required(),
    //     religion: Joi.string().required(),
    //     temporaryResidenceAddress:ObjectId,
    //     permanentAddress:ObjectId,
    //     gender:String enum,
    //     homeTown:Joi.string().required(),
    //     educationalLevel:Joi.string().required()
    if(!req.body.family.members) return res.status(400).send("invalid family")
    let newFamily = new Family({
        idAddressRef :new ObjectId(),
        householdCode :req.body.family.householdCode,
        _id:new ObjectId()
    })
    const members =[]
    console.log(req.body.family.members)
    req.body.family.members.forEach(member=>{
        const newMember = new Human({...member,_id:new ObjectId(),familyIdRef:newFamily._id})
        console.log(newMember)
        const {err} = Human.validate(newMember)
        if(err) return res.status(400).send(err.details[0].message)  
        console.log(newMember._id)
        if(member.cardId == req.body.family.cardIdOfHost)
            newFamily.headOfHouseholdIdRef = newMember._id
        
        members.push(newMember)
    })
    const {error} = Family.validate(newFamily)
    if(error) return res.status(400).send(error.details[0].message)  
    return Promise.all([Human.insertMany(members),newFamily.save()])  
            .then(result=>res.status(201).send(result))
            .catch(err=>console.log(err))

    // data = await 
    // console.log(data)
}

const getInfoHumanWithId =  async function(req,res,next) {
    //chua check human co thuoc quyen quan ly cua nguoi nay khong
    if(!isValidObjectId(req.params.id))
        return res.status(400).send('invalid id')
    const user = await User.findOne({_id:req.decodedToken._id})
    const human = await Human.findOne({_id:req.params.id})
                            .populate('temporaryResidenceAddressIdRef')
    //neu user quan ly dia chi tam tru cua human{id}
    if((Object.values(human.temporaryResidenceAddressIdRef).includes(user.idManagedScopeRef)|| req.decodedToken.role == 'A1'))   
        if(human) 
            return res.status(200).send(human)
    return res.status(404).send('not found')
}

module.exports = {
    getInfoScopeById,
    declare,
    getInfoHumanWithId,
}