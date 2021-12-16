const { Family } = require("../models/human/family")
const { User } = require("../models/user/user")
const { Human } = require("../models/human/human")
const { Address } = require("../models/address/address")
const ObjectId = require('mongoose').Types.ObjectId
const { isValidObjectId } = require("mongoose")

exports.createFamily = async function(req,res,next) {
    
    const process= await Promise.all([Family.findOne({householdCode:req.body.family.householdCode}),
                                        Address.findOne({_id:req.body.family.idAddressRef}),
                                        User.findOne({_id:req.decodedToken._id})
                                    ])

    const loggedInUser= process[2]
    //neu ma ho da ton tai
    if(process[0])
    return res.status(400).send('this household code already existed')

    //neu address khong hop le
    if(!process[1]) return res.status(400).send('invalid address')

    const {idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef} = process[1]
    const address =[idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef]
    
    let isAddressManagedByLoggedInUser = false
    //address co phai do nguoi nay quan ly khong
    address.forEach(scope=>{
        if(scope.equals(loggedInUser.idManagedScopeRef))
            isAddressManagedByLoggedInUser = true
    })
    if(!isAddressManagedByLoggedInUser) 
        return res.status(400).send('you must declare addressess managed by you')

    let newFamily = new Family({
                                headOfHouseholdName:req.body.family.headOfHouseholdName,
                                idCardOfHeadOfHousehold:req.body.family.idCardOfHeadOfHousehold,                               
                                idAddressRef :req.body.family.idAddressRef,
                                householdCode :req.body.family.householdCode,
                            })
    // validate family
    const {error} = Family.validate(newFamily)
    if(error) return res.status(400).send(error.details[0].message)  
    //save to db
    return newFamily.save()
                    .then(result=> res.status(200).send(result))
                    .catch(err=> res.status(500).send(err))

}
exports.editFamily= async (req,res,next)=>{
    //chua check neu doi dia chi thi nhu nao
    if(!isValidObjectId(req.params.id))
        return res.status(400).send('invalid id family')
    const process = await Promise.all([Family.findOne({_id:req.params.id}).populate('idAddressRef'),
                                        User.findOne({_id:req.decodedToken._id})
                                    ])

        const family = process[0],loggedInUser=process[1]
        if(!family) return res.status(400).send('invalid id')

        const {idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef} = family.idAddressRef
        const address =[idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef]

        let isAddressManagedByLoggedInUser = false
        address.forEach(scope=>{
        if(scope.equals(loggedInUser.idManagedScopeRef))
        isAddressManagedByLoggedInUser = true
        })
        if(!isAddressManagedByLoggedInUser)
            return res.status(400).send('address of this family is not managed by you')
        return Family.findOneAndUpdate({_id:req.params.id},(req.body.family),{new:true})
                    .then(result=> res.status(200).send(result))
                    .catch(err=> console.log(err))
    
}

exports.deleteFamily = async (req,res,next)=>{
    if(!isValidObjectId(req.body.family._id))
    return res.status(400).send('invalid id family')
    const process = await Promise.all([Family.findOne({_id:req.params.id}).populate('idAddressRef'),
                                        User.findOne({_id:req.decodedToken._id})
                                    ])

    const family = process[0],loggedInUser=process[1]
    if(!family) return res.status(400).send('invalid id')

    const {idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef} = family.idAddressRef
    const address =[idCountryRef,idCityRef,idDistrictRef,idCommuneRef,idVillageRef]
    
    let isAddressManagedByLoggedInUser = false
    address.forEach(scope=>{
        if(scope.equals(loggedInUser.idManagedScopeRef))
            isAddressManagedByLoggedInUser = true
    })

    if(!isAddressManagedByLoggedInUser)
        return res.status(400).send('address of this family is not managed by you')

    return Family.findOneAndDelete({_id:req.params.id})
                    .then(family=>{
                        return Human.deleteMany({_id:{$in:family.members}})
                    })
                    .then(result=> res.status(200).send('success'))
                    .catch(err=> res.status(500).send(err))
}

