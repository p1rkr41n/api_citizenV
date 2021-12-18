const { User } = require("../../models/user/user")
const {Scope} = require('../../models/address/scope')
const { Family } = require("../../models/human/family")
const { Human } = require("../../models/human/human")
const ObjectId = require('mongoose').Types.ObjectId
const { isValidObjectId } = require("mongoose")
const { Address } = require("../../models/address/address")
const uitlStatistics = require('./utilStatistic')

const getStatisticsInfoScopeById = async function(req,res,next) {

    if(!isValidObjectId(req.query.id)) 
        return res.status(400).send('invalid id')
        const typeOfScope = req.url.split('/')[1]
        let ref ={typeOfScope : 'country'}
        if(req.query.idCityRef && typeOfScope =='city') {
            ref.idCityRef= req.query.idCityRef
        }
        else if(req.query.idDistrictRef&& typeOfScope =='district') {
            ref.idDistrictRef= req.query.idDistrictRef
        }
        else if(req.query.idCommuneRef&& typeOfScope =='commune') {
            ref.idCommuneRef= req.query.idCommuneRef
        }
        else if(req.query.idVillageRef&& typeOfScope =='village') {
            ref.idVillageRef= req.query.idVillageRef
        }
        else if(req.url.split('/')[1] != 'country') 
            return res.status(404).send('not found')
        ref.typeOfScope = typeOfScope

    const scope = await Scope.findOne({_id:"61bb4af657c3212db7ec1c6d"})

    if(!scope) return res.status(404).send('not found')
    
    if(!(scope.areaCode.startsWith(req.decodedToken.username)&&req.decodedToken.role!='A1')) 
        return res.status(403).send('This area is not managed by you') 
    
    return Address.find(ref).select("_id")
                .then(result=> {
                    const addresses = result.map(address=> address._id)
                    
                     //dem nguoi co dia chi tam tru tai scope
                    return Promise.all([uitlStatistics.countThePopulation(addresses),
                        uitlStatistics.statisticsOnTheNumberOfUnemployedAndEmployedPeople(addresses),
                        uitlStatistics.statisticsOnReligion(addresses),
                        uitlStatistics.censusByAgeAndGender(addresses),
                        uitlStatistics.statisticsOnEducationalLevel(addresses)
            ])
                }
                   )
                .then(data=>{
                    const results= data.map(result=>{
                            return result.map(unit=>{
                                return {...unit._id,count:unit.count}
                            })
                    })
                    return res.status(200).send({
                        populationData:results[0],
                        employmentAndUnemploymentData:results[1],
                        ReligionData:results[2],
                        RangeAgeAndGenderData:results[3],
                        educationalData:results[4]
                    })
                })
                
                .catch(err=> console.log(err))
    
}





module.exports = {
    getStatisticsInfoScopeById,
}