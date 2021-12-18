const { Address } = require('../../models/address/address')
const utilStatistic = require('../statistics/utilStatistic')


//MUST CONNECT WITH DATABASE AND CREATE NEW COLLECTION

let idAddressesList=[]
  Address.find({}).select('_id')
                .then(addresses=>
                    { 
                        let promises =[]
                                
                        addresses.forEach(address=>{
                            idAddressesList.push(address._id)
                            promises.push(
                                utilStatistic.countThePopulation([address._id]),
                                utilStatistic.statisticsOnTheNumberOfUnemployedAndEmployedPeople([address._id]),
                                utilStatistic.statisticsOnReligion([address._id]),
                                utilStatistic.censusByAgeAndGender([address._id]),
                                utilStatistic.statisticsOnEducationalLevel([address._id]))
                            })
                        return Promise.all(promises)
                    })
                .then(data=>{
                    const results=[]
                    data.forEach(result=>{
                        if(result.length)
                            results.push( result.map(unit=>{
                                return {...unit._id,count:unit.count}
                                }))
                        })
                    const numberOfPromisesPerVillageAddress = data.length/idAddressesList.length
                    return idAddressesList.map((idAddress,index)=>{
                        //thong tin thong ke cua 1 address se duoc luu nhu phan return phia duoi
                        return {
                            idAddress:idAddress,
                            populationData:results[index*numberOfPromisesPerVillageAddress],
                            employmentAndUnemploymentData:results[index*numberOfPromisesPerVillageAddress+1],
                            ReligionData:results[index*numberOfPromisesPerVillageAddress+2],
                            RangeAgeAndGenderData:results[index*numberOfPromisesPerVillageAddress+3],
                            educationalData:results[index*numberOfPromisesPerVillageAddress+4]
                        }
                    })
                })
                .then(result=> {
                    //save to database in this
                    //sẽ có những element chỉ có id.các trường còn lại là undefined vì nó k có người dân nào
                    console.log(re[0].populationData)
                })
                        
