const { Scope } = require("../models/scope")
const {User} = require("../models/user")
const mongoose= require('mongoose')
const { response } = require("express")
const { Address } = require("../models/address")
const ObjectId = mongoose.Types.ObjectId
const getUsersController = async function(req,res,next) {
        const user = await User.findOne({_id:req.decodedToken._id}).populate({path:'idRoleRef',model:'Role'})
        if(!user) return res.status(400).send('invalid id')
        if(user.idRoleRef.name != req.decodedToken.role) 
            return res.status(400).send('invalid id')
        if(req.decodedToken.role =='A1'){
            const roleRefOfAccount =user.idRoleRef.idRoleManageRef
            const accounts =await User.find({idRoleRef :roleRefOfAccount})
            return res.status.send(accounts)
        }
        const accounts =await User.find({addedBy:req.decodedToken._id})
        return res.status(200).send(accounts)
        
}
const getUserByIdController = async function(req,res,next) {
    if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).send("invalid id")
    const user = await User.findOne({_id:new ObjectId(req.params.id)})
    if(!user) return res.status(404).send('invalid id')
    if(req.params.id == req.decodedToken._id) return res.status(200).send(userDb)
    if(user.username.startsWith(req.decodedToken.username))
        return res.status(201).send(user)
    return res.status(403).send('This user is not managed by you')
} 
const createUserController = async function(req,res,next) {
    // addedBy: forEach(id =>Joi.ObjectId().required()), req.decodedToken._id
    // name: Joi.string().required(), ten can bo 
    // idManagedScopeRef:Joi.ObjectId(), id pham vi,khu vuc ma can bo{name} quan li
    //phai them ca scope
    // idRoleRef: Joi.ObjectId().required(), role cua can bo {name}
    //check trong role collection
    // username:Joi.string().required, id dang nhap cua can bo name
    // password:Joi.string().required(), password cua can bo name
    // tim trong db xem da ton tai id cua newUser chua

    const usernames =await User.find({username:req.body.username})
    
    
    const user =await User.findOne({_id:req.decodedToken._id})
                            .populate({path: 'idRoleRef',model:'Role',
                            populate:{path:'idRoleManageRef',model:'Role'}})
                            

    //tim cac scope do user them co ton tai khu vuc nao ten {scopeName} chua
    const ManagedScopesOfUser = await Scope.find({belongToIdScopeRef:user.idManagedScopeRef})

    const alreadyExisted =ManagedScopesOfUser.length?ManagedScopesOfUser.map(scope=> scope.name)
                                  .includes(req.body.scopeName): false

    if(usernames.length) return res.status(400).send('this id already in use')

    if(alreadyExisted && req.decodedToken.role !='admin') return res.status(400).send('khu vuc nay nay da duoc ban tao tai khoan')

    if(!user) return res.status(400).send('invalid token')
                   
    let getScope ;
    // neu scope khac Viet Nam thi them scope moi 
    const typeOfManageScopeOfNewUser =user.idRoleRef.idRoleManageRef.typeOfManageScope
    
    if(req.decodedToken.role != 'admin') {
        const newScope = new Scope ({
            name: req.body.scopeName,
            areaCode :req.body.username,
            typeOfScope:typeOfManageScopeOfNewUser,
            belongToIdScopeRef:user.idManagedScopeRef,
        })
        const {err} =Scope.validate(newScope)
        if(err) throw err
        getScope =newScope.save()
    } 
    if(req.decodedToken.role == 'admin')  
        getScope = Scope.findOne({name:"Viet Nam"})
    getScope
        .then(result=>{
            const newUser = new User({
                addedBy:req.decodedToken._id,
                name:req.body.name,
                idManagedScopeRef :result._id,
                idRoleRef :user.idRoleRef.idRoleManageRef,
                username: req.body.username,
                password:req.body.password,
            })
            const {err} = User.validate(newUser)
            if(err) return err
            return newUser.save()
        })
        .then(result=> {
            const {name,username,completed,declarable} = result
            if(req.decodedToken.role == 'B1') {
                const fullAddress = Scope.findOne({_id:result.idManagedScopeRef})
                                    .populate({path:'belongToIdScopeRef',model:'Scope',
                                    populate:{path:'belongToIdScopeRef',model:'Scope',
                                    populate:{path:'belongToIdScopeRef',model:'Scope',
                                    populate:{path:'belongToIdScopeRef',model:'Scope'}}}})
                                    .select('typeOfScope')
                return fullAddress

                
        
            }
            return res.status(201).send({name,username,completed,declarable})

        })
        .then(response=>{
            const commune = response.belongToIdScopeRef
            const district = commune.belongToIdScopeRef
            const city = district.belongToIdScopeRef
           const newFullAddress = new Address({
                    villageIdRef:response._id,
                    communeIdRef:commune._id,
                    districtIdRef:district._id,
                    cityIdRef:city._id,
                })
            return newFullAddress.save()
        })
        .then(result=>console.log(result))
        .catch(err=>{
            return res.status(500).send(err)
        })
    
}

//có thể change fields nào cũng được(them truong muon update) miễn là user quản lí account{_id}
const changePasswordController = async function(req,res,next) {
    if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).send('invalid id')
    if(req.params.id.toString() != req.decodedToken._id.toString()){
        const managedUser = await User.findOne({_id:new ObjectId(req.params.id)}).populate({path:'idRoleRef',model:'Role'})
        if(!managedUser) return res.status(404).send('not found')
        //nếu user la A1 hoặc là người thêm  account{_id}
        if(managedUser.addedBy.toString() == req.decodedToken._id.toString()||
            (managedUser.idRoleRef.name == 'A2'&& req.decodedToken.role =='A1')){
            const result = await User.findOneAndUpdate({_id:new ObjectId(req.params.id)},{password:req.body.newPassword})
            if(!result) return res.status(404).send("The user with the given ID was not found")
            return res.status(200).send("done")
        }
        return res.status(400).send('This user is not managed by you')
    }
    result = await User.findOne({_id:req.decodedToken._id}).select('password')
    if(!result) return res.status(400).send("invalid id")
    if(result.password != req.body.oldPassword ) return res.status(400).send('wrong old password')
    User.findOneAndUpdate({_id:req.body.id},{password:req.body.newPassword})
            .then(response=> res.status(200).send("Done"))
            .catch(err=> res.send(500).send(err))

}

const changeDeclarePermissionById  = async function(req,res,next) {
    if(!mongoose.isValidObjectId(req.params.id)) 
        return res.status(400).send('invalid id')
    const account = await User.findOne({_id:new ObjectId(req.params.id)}).populate({path:'idRoleRef',model:'Role'})
    if((account.addedBy.toString() == req.decodedToken._id.toString()) 
    || (req.decodedToken.role == 'A1'&& account.idRoleRef.name== 'A2')) {
       return User.updateMany({username:{$regex:'^'+ account.username}},{declarable:true})
            .then(data=>res.status(200).send("Done"))
            .catch(err=>res.status(500).send(err))
    }
    return res.status(400).send('This user is not managed by you')

}


module.exports ={
    createUserController,
    getUserByIdController,
    changePasswordController,
    getUsersController,
    changeDeclarePermissionById,
}