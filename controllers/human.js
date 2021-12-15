const { isValidObjectId } = require("mongoose")
const { Human } = require("../models/human/human")
const { User } = require("../models/user/user")
const ObjectId = require('mongoose').Types.ObjectId
const utilAddress = require('./address/utilAddress')
const {Scope}  = require('../models/address/scope')
const {Address}  = require('../models/address/address')

exports.getInfoHumanWithId =  async function(req,res,next) {
    if(!isValidObjectId(req.params.id))
        return res.status(400).send('invalid id')
    const process = Promise.all([User.findOne({_id:req.decodedToken._id}),
                                                Human.findOne({_id:req.params.id})
                                                .populate([{path:'idTemporaryResidenceAddressRef',model:'Address',
                                                    populate:{path:addressFields,model: 'Scope',select:'name -_id'}},
                                                    {path:'idPermanentAddressRef',model:'Address',
                                                    populate:{path:addressFields,model: 'Scope',select:'name -_id'}}
                                                    ])   
                                ])/////to be continue,should add last editor to username to check,
                                // just use 1 promise to find people

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
    //thiếu validate data
    if(!isValidObjectId(req.params.id))
        return res.status(400).send('invalid id')
    const process = Promise.all([User.findOne({_id:req.decodedToken._id}),
                                                Human.findOne({_id:req.params.id})
                                                .populate('idTemporaryResidenceAddressRef')
                                                .select('-__v -_id ')    
                                ])
    const [user,human] = await process
    console.log(user,human)
    if(!user || !human)return res.send('invalid id')
    //neu dia chi tam tru cua human{id} thuoc khu vuc quan ly cua user
    let isManagedByUser = false
    const {idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef} = human.idTemporaryResidenceAddressRef
    console.log(idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef)
    const ref = [idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef]
    ref.forEach(id=>{if(id.equals(user.idManagedScopeRef)) 
                        isManagedByUser = true
                    })
    if(isManagedByUser )   
        return Human.findOneAndUpdate({_id:req.params.id},{name:'Tran Van B'},{new: true,select:"name cardId -_id "})
                    .then(response=>res.status(200).send(response))
                    .catch(err=>res.status(500).send(err))
    return res.status(404).send("can't find data match with id in your areas that you manage")

}

exports.removeHumanInfoById = async (req,res,next) =>{
    if(!isValidObjectId(req.params.id))
        return res.status(400).send('invalid id')
    const process = Promise.all([User.findOne({_id:req.decodedToken._id}),
                                                Human.findOne({_id:req.params.id})
                                                .populate('idTemporaryResidenceAddressRef')
                                                .select('-__v -_id')    
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
    return Human.findOneAndDelete({_id:req.params.id})
                .then(response=>res.status(200).send(response))//còn thiếu xóa id của user vừa xóa trong family
                .catch(err=>res.status(500).send(err))
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
        if(!result) return res.status(403).send('this area is not managed by you')
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