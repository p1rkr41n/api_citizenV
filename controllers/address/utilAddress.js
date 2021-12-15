const { isValidObjectId } = require("mongoose")
const { Address } = require("../../models/address/address")
const { Scope } = require("../../models/address/scope")

async function findAddressById(idAddress) {
    const address =await Address.findOne({_id:idAddress})
                  .populate('idCountryRef idCityRef idDistrictRef idCommuneRef idVillageRef') 
                  .select('name -_id')
                  console.log(address)
    if(!address) return null
    return address
}
async function findIdAddress(address) {
    //adddress chua cac idScopeRef
    const idAddress = await Address.findOne({address}).select('_id -__v')
    if(!idAddress) return null
    return idAddress
}
async function isBelongTo(idAddress,idScope) {
    const result = await Address.findOne($and[{_id:idAddress},
                                        {$or:[{idCountryRef :idScope},{idCityRef:idScope},
                                        {idDistrictRef:idScope},{idCommuneRef:idScope},
                                        {idVillageRef:idScope}]}])
        return !!result
}

async function isValidAddress(address) {
    const process = Promise.all([   Scope.findOne({_id:address.idCountryRef,typeOfScope:'country'}),
                                    Scope.findOne({_id:address.idCityRef,typeOfScope:'city'}),
                                    Scope.findOne({_id:address.idDistrictRef,typeOfScope:'district'}),
                                    Scope.findOne({_id:address.idCommuneRef,typeOfScope:'commune'}),
                                    Scope.findOne({_id:address.idVillageIdRef,typeOfScope:'village'})
                                ])
    const addressDb = await process

    if(village.belongToIdScopeRef != commune._id
        ||commune.belongToIdScopeRef != district._id
        ||district.belongToIdScopeRef != city._id)
            return false
    return true
        
}

async function creatAddress(address) {
    if(!isValidAddress(address)) return false
    const newAddress = new Address(...address)
    if(!address.idCityRef) {
        const idCountryRef=(await Scope.findOne({typeOfScope:'country'}).select(_id)).select(_id)
        newAddress.idCountryRef = idCountryRef
    }
    return newAddress.save()
}
module.exports={
    findAddressById,
    findIdAddress,
    isBelongTo,
    isValidAddress,
    creatAddress,
}