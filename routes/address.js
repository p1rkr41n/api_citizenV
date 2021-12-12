const auth = require("../middleware/auth");
const { Address } = require("../models/address");
const { Scope } = require("../models/scope");
const router = require("express").Router();
router.get(['/city/:id','/district/:id','/commune/:id','/village/:id'],async function(req,res,next) {
    const typeOfScope = req.url.split('/')[1]
    return Scope.find({_id:req.params.id,typeOfScope:typeOfScope}).select('-__v')
    .then(result=> res.status(200).send(result))
    .catch(err=>res.send(err))
})
router.get(['/country','/city','/district','/commune','/village'],async function(req,res,next) {
    const typeOfScope = req.url.split('/')[1]
    Scope.find({typeOfScope:typeOfScope}).select('-__v')
    .then(result=> res.status(200).send(result))
    .catch(err=>res.send(err))
})
router.post('/',auth,async (req,res,next)=>{
    const {err} = Address.validate(req.body.data)
    if(err) return res.status(400).send(err)
    const city = await Scope.findOne({_id:req.body.data.cityIdRef,typeOfScope:'city'})
    const district = await Scope.findOne({_id:req.body.data.districtIdRef,typeOfScope:'district'})
    const commune = await Scope.findOne({_id:req.body.data.communeIdRef,typeOfScope:'commune'})
    const village = await Scope.findOne({_id:req.body.data.villageIdRef,typeOfScope:'village'})
    if(!city||!district||!commune||!village)
    res.status(400).send('invalid id')
    const{cityIdRef,districtIdRef,communeIdRef,villageIdRef} = req.body.data
    const address = new Address({
        cityIdRef,districtIdRef,communeIdRef,villageIdRef
    })
    return address.save()
    .then(result=>res.status(200).send("done"))
    .catch(err=>console.log(err))

})

module.exports =router;