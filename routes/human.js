const { getInfoHumanWithId, createHumanInfomation, changeHumanInfoWithId, removeHumanInfoById, getInfoHumans } = require('../controllers/human')
const auth = require('../middleware/auth')
const checkRoleToAddUser = require('../middleware/checkRoleToAddUser')
const checkRoleToDeclareInfo = require('../middleware/checkRoleToDeclareInfo')
const checkRoleToViewScopeInfo = require('../middleware/checkRoleToViewScopeInfo')
const router = require('express').Router()

//get infomation of a human {_id}
router.get('/:id',[auth,checkRoleToAddUser],getInfoHumanWithId)
//change infomation of a human by _id
router.put('/:id',[auth,checkRoleToDeclareInfo],changeHumanInfoWithId)

router.delete('/:id',[auth,checkRoleToDeclareInfo],removeHumanInfoById)

router.get('/',getInfoHumans)

module.exports =router