const { declare } = require('../controllers/statisticalInfo')
const { createUserController, getUserByIdController, changePasswordController, changeYourPasswordController, getUsersController, changeDeclarePermissionById } = require('../controllers/user')
const auth = require('../middleware/auth')
const checkDeclarablePermission = require('../middleware/checkDeclarablePermission')
const checkRoleToAddUser = require('../middleware/checkRoleToAddUser')
const router = require('express').Router()
//get users that logged in user added
router.get('/all',[auth,checkRoleToAddUser],getUsersController)
//get user by id(ObjectId) that logged in user added
router.get('/:id',[auth],getUserByIdController)
//add one user 
//{name(ten cua can bo),username,password,scopeName(ten cua khu vuc do can bo quan ly,admin thi khong can)}==>sever
router.post('/',[auth,checkRoleToAddUser,checkDeclarablePermission],createUserController)
//change password of user by id(type:ObjectId)
router.put('/:id/change-pwd',[auth,checkRoleToAddUser,checkDeclarablePermission],changePasswordController)

router.put('/:id/change-declare-permission',[auth,checkDeclarablePermission],changeDeclarePermissionById)
// router.delete('/:id',[auth,checkRoleToAddUser,checkDeclarablePermission],removeUserController)
module.exports = router