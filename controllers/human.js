const { isValidObjectId } = require("mongoose")
const { Human } = require("../models/human/human")
const { Family } = require("../models/human/family")
const { User } = require("../models/user/user")
const ObjectId = require('mongoose').Types.ObjectId
const utilAddress = require('./address/utilAddress')
const {Scope}  = require('../models/address/scope')
const {Address}  = require('../models/address/address')


exports.getInfoHumanWithId =  async function(req,res,next) {
    if(!isValidObjectId(req.params.id))
        return res.status(400).send('invalid id')
        const addressFields ='idCountryRef idCityRef idDistrictRef idCommuneRef idVillageRef'

    const process = Promise.all([User.findOne({_id:req.decodedToken._id}),
                                                Human.findOne({_id:req.params.id})
                                                .populate([{path:'idTemporaryResidenceAddressRef',model:'Address',
                                                    populate:{path:addressFields,model: 'Scope',select:'name'}},
                                                    {path:'idPermanentAddressRef',model:'Address',
                                                    populate:{path:addressFields,model: 'Scope',select:'name'}}
                                                    ])   
                                ])

    const [user,human] = await process

    if(!user || !human)return res.send('not found')
    //neu dia chi tam tru cua human{id} thuoc khu vuc quan ly cua user
    let isManagedByUser = false
    const {idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef} = human.idTemporaryResidenceAddressRef
    const ref = [idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef]
    ref.forEach(id=>{if(id.equals(user.idManagedScopeRef)) 
                        isManagedByUser = true
                    })
                    
    if(isManagedByUser )   
        return res.status(200).send(human)
        
    return res.status(404).send("can't find data match with id in your area that you manage")
}


exports.changeHumanInfoWithId = async function(req,res,next){
    if(!isValidObjectId(req.params.id)||!isValidObjectId(req.params.idFamily))
        return res.status(400).send('invalid id')
    const process = Promise.all([User.findOne({_id:req.decodedToken._id}),
                                                Human.findOne({_id:req.params.id,idFamilyRef:req.params.idFamily})
                                                .populate('idTemporaryResidenceAddressRef')
                                                .select('-__v')    
                                ])
    const [user,human] = await process
    if(!user || !human)return res.send('invalid id')
    //neu dia chi tam tru cua human{id} thuoc khu vuc quan ly cua user
    let isManagedByUser = false
    const {idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef} = human.idTemporaryResidenceAddressRef
    const ref = [idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef]
    ref.forEach(id=>{if(id.equals(user.idManagedScopeRef)) 
                        isManagedByUser = true
                    })
    if(isManagedByUser ){
        const {err}= Human.validate(req.body.human)
        if(err) return res.status(400).send(err)
        return Human.findOneAndUpdate({_id:req.params.id},req.body.human,{new: true,select:"name cardId -_id "})
                    .then(response=>res.status(200).send(response))
                    .catch(err=>res.status(500).send(err))
    }
    return res.status(404).send("can't find data match with id in your areas that you manage")

}

exports.removeHumanInfoById = async (req,res,next) =>{
    if(!isValidObjectId(req.params.id))
        return res.status(400).send('invalid id')
    const process = Promise.all([User.findOne({_id:req.decodedToken._id}),
                                                Human.findOne({_id:req.params.id})
                                                .populate('idTemporaryResidenceAddressRef idFamilyRef')
                                                .select('-__v')    
                                ])
                                console.log(await process)
    const [user,human] = await process
    if(!user || !human)
        return res.send('not found')
    //neu dia chi tam tru cua human{id} thuoc khu vuc quan ly cua user
    const {idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef} = human.idTemporaryResidenceAddressRef
    const ref = [idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef]
    ref.forEach(id=>{if(id.equals(user.idManagedScopeRef)) 
                        isManagedByUser = true
                    })
    if(isManagedByUser )   
    return Promise.all([Human.findOneAndDelete({_id:req.params.id})
                .then(response=>{
                    //remove _id of member from family
                    //if user remove is headOfhousehold                    
                    return res.status(200).send(response)
                })
                .catch(err=>res.status(500).send(err)),
                Family.findOne({_id:human.idFamilyRef})
                    .then(family=> {
                        const index = family.members.indexOf(human._id)
                        console.log(human._id,family.members,human.idFamilyRef)
                        console.log(index)
                        if(index!= -1)
                            family.members.splice(index,1)
                            console.log({'member':family.members})
                        return Family.findOneAndUpdate({_id:family._id},{members: family.members},{new:true})
                    })
            ])
    return res.status(404).send("can't find data match with id in your area that you manage")
}

exports.getInfoHumans = async(req,res,next)=>{
    const typeOfScope = req.url.split('/')[1]
    const scope = {typeOfScope}
    let ref ={typeOfScope}
    if(typeOfScope != 'country') {
        
        if(!isValidObjectId) return res.status(400).send('invalid id')
        //if(scope{req.param.id} belong to logged in user's managed scope)
        const result = await Scope.find({_id:req.params.id,areaCode:{$regex:'^'+ req.decodedToken.username}})
        console.log (result)
        if(!result.length) return res.status(404).send('not found')
        scope._id=req.params.id
        ref[`id${typeOfScope.charAt(0).toUpperCase()}Ref`] = req.params.id
        }

        const idAddresses = (await Address.find(ref))
                            .map(address=>address._id)

        const addressFields ='idCountryRef idCityRef idDistrictRef idCommuneRef idVillageRef'
        
        return Human.find({idTemporaryResidenceAddressRef:{$in:idAddresses}})
                                    //populate temporary residence address
                    .populate([{path:'idTemporaryResidenceAddressRef',model:'Address',
                                    populate:{path:addressFields,model: 'Scope',select:'name -_id'}},
                                    //populate permanent address
                                {path:'idPermanentAddressRef',model:'Address',
                                    populate:{path:addressFields,model: 'Scope',select:'name -_id'}}
                            ])
                    .limit(5)
                    .then(result=> res.status(200).send(result))
                    .catch(err=> res.status(500).send(err))                    

}

exports.createHuman=async (req,res,next) => {
    console.log(req.decodedToken)
    const process = await Promise.all([Family.findOne({_id:req.params.idFamily})
                                        .populate('idAddressRef'),
                                User.findOne({_id:req.decodedToken._id})
                                    ])
    const family = process[0]
    const loggedInUser = process[1]
    if(!family) return res.status(400).send('invalid id family')
    const {idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef} = family.idAddressRef
    const address =[idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef]
    
    let isAddressManagedByLoggedInUser = false
    address.forEach(scope=>{
        if(scope.equals(loggedInUser.idManagedScopeRef))
            isAddressManagedByLoggedInUser = true
    })

    if(!isAddressManagedByLoggedInUser)
            return res.status(400).send('address of this family is not managed by you')

    const newHuman = new Human({
        ...req.body.human,
        idTemporaryResidenceAddressRef: family.idAddressRef._id,
        idFamilyRef:family._id        
        })
        
    const {err} = Human.validate(newHuman)
    if(err) return res.status(500).send(err)
    return newHuman.save()
                    .then(human=> {
                        family.members.push(human._id)
                        return Family.findOneAndUpdate({_id:family._id},{members:family.members},{new:true})
                    })
                    .then(result=> res.status(200).send('success'))
                    .catch(err=> res.status(500).send(err))
}
