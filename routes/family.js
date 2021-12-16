const { createFamily, editFamily, deleteFamily } = require("../controllers/family");
const { changeHumanInfoWithId, createHuman, removeHumanInfoById } = require("../controllers/human");
const auth = require("../middleware/auth");
const checkRoleToDeclareInfo = require("../middleware/checkRoleToDeclareInfo");
const checkRoleToViewScopeInfo = require("../middleware/checkRoleToViewScopeInfo");
const router= require('express').Router()
//add a family(no members)
router.post('/',[auth,checkRoleToDeclareInfo],createFamily)
//add mamber of family{idFamily}
router.post('/:idFamily/human',[auth,checkRoleToDeclareInfo],createHuman)
//edit info of a family(not member of that family)
router.put('/:id',[auth,checkRoleToDeclareInfo],editFamily)
//edit info of human{id} of family{:idFamily}
router.put('/:idFamily/human/:id',[auth,checkRoleToDeclareInfo],changeHumanInfoWithId)

router.delete('/:id',[auth,checkRoleToDeclareInfo],deleteFamily)
router.delete('/:idFamily/human/:id',[auth,checkRoleToDeclareInfo],removeHumanInfoById)
module.exports= router
