const router = require('express').Router()
const { getInfoScopeById, declare, getInfoHumanWithId } = require('../controllers/statisticalInfo')
const auth = require('../middleware/auth')
const checkRoleToAddUser = require('../middleware/checkRoleToAddUser')
const checkRoleToDeclareInfo = require('../middleware/checkRoleToDeclareInfo')
const checkRoleToViewScopeInfo = require('../middleware/checkRoleToViewScopeInfo')

router.get(['/country/:id','/city/:id','/district/:id','/commune/:id','/village/:id'],
[auth,checkRoleToViewScopeInfo],getInfoScopeById)

router.get('/human/:id',[auth,checkRoleToAddUser],getInfoHumanWithId)

// 1family:{
//      "cardIdOfHost" 
//       "idAddressRef" 
//       "householdCode" 
// "members":[
//     1 member:{
//         "name":"Nguyen Van A",
//         "cardId":"123456789548",
//         "job":"sv",
//         "religion":"Phat giao",
//      temporaryResidenceAddress:ObjectId,
//      permanentAddress:ObjectId,
//             "hometown":"abc",
//             "gender" :"male",
//             "birth":"2021-12-11T13:40:32.422Z",
//             "educationalLevel":"10/12"
//     }
//     ] 
//}
router.post('/declare',[auth,checkRoleToDeclareInfo],declare)
module.exports = router