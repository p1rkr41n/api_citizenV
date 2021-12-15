const { createFamily } = require("../controllers/family");
const auth = require("../middleware/auth");
const checkRoleToDeclareInfo = require("../middleware/checkRoleToDeclareInfo");
const router= require('express').Router()
router.post('/',[auth,checkRoleToDeclareInfo],createFamily)
module.exports= router
