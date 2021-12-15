const { User } = require("../models/user/user")
const {Scope} = require('../models/address/scope')
const { Family } = require("../models/human/family")
const { Human } = require("../models/human/human")
const ObjectId = require('mongoose').Types.ObjectId
const { isValidObjectId } = require("mongoose")
const { Address } = require("../models/address/address")

const getInfoScopeById = async function(req,res,next) {

    if(!isValidObjectId(req.params.id)) 
        return res.status(400).send('invalid id')

    const typeOfScope = req.url.split('/')[1]
    const scope = await Scope.findOne({typeOfScope:typeOfScope,_id:new ObjectId(req.params.id)})

    if(!scope) return res.status(404).send('not found')
    if(!scope.areaCode.startsWith(req.decodedToken.username)) 
        return res.status(403).send('This scope is not managed by you')
    // thong ke so dan co cung 1 dia chi thuong tru(tinh den village)
    p = await Human.aggregate([
        {
            $match:{
                gender:'female',
                job:'sv'
            }
        },   
        {
            $group:{
                _id:"$idTemporaryResidenceAddressRef",
                count: { $sum: 1 }
            }
            
        },
        { 
            $sort: { count: -1 } 
        } 
        
    ])
    console.log(p)
    if((scope.areaCode.startsWith(req.decodedToken.username)&&req.decodedToken.role!='A1')||req.decodedToken.role =='A1'){
        const ref={}
        ref[`id${typeOfScope.charAt(0).toUpperCase()}Ref`] = scope._id
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





module.exports = {
    getInfoScopeById,
}