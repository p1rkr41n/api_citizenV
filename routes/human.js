const { getInfoHumanWithId, createHumanInfomation, changeHumanInfoWithId, removeHumanInfoById, getInfoHumans, createHuman } = require('../controllers/human')
const auth = require('../middleware/auth')
const checkRoleToAddUser = require('../middleware/checkRoleToAddUser')
const router = require('express').Router()

//get infomation of a human {_id}
router.get('/:id',[auth,checkRoleToAddUser],getInfoHumanWithId)
//get humans that loggedInUser manage(idTemporaryResidenceAddressRef)
router.get('/',[auth],getInfoHumans)

module.exports =router