const { Family } = require("../models/human/family")
const { Human } = require("../models/human/human")
const ObjectId = require('mongoose').Types.ObjectId

exports.createFamily = async function(req,res,next) {
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


    //data co idAddressRef,houseHoldCode=> return _id cua chu ho,_id cua  family
    ///////////
    if(!req.body.family.members)
        return res.status(400).send("invalid family")

    let newFamily = new Family({
        idAddressRef :new ObjectId(),
        householdCode :req.body.family.householdCode,
        _id:new ObjectId()
    })

    const members =[]
    req.body.family.members.forEach(member=>{
        //address gui tu client la obj chua cac id area hay objectId address??
        const newMember = new Human({_id:new ObjectId(),...member,idFamilyRef:newFamily._id})
        const {err} = Human.validate(newMember)
        //thieu validateAddress dia chi  thuong tru tam tru truoc khi luu
        if(err) return res.status(400).send(err.details[0].message)  

        //nếu member là chủ hộ
        if(member.cardId == req.body.family.cardIdOfHost)
            newFamily.idHeadOfHouseholdRef = newMember._id
        
        members.push(newMember)
    })
    
    newFamily.members = members
    const {error} = Family.validate(newFamily)
    if(error) return res.status(400).send(error.details[0].message)  
    //save to db
    return Promise.all([Human.insertMany(members),newFamily.save()])  
            .then(result=>res.status(201).send(result))
            .catch(err=>res.status(500).send(err))

}