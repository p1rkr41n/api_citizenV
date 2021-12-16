const { createAddress, getScopeById, getAddressById, getScopes, getAddresses } = require("../controllers/address/address");
const { getInfoHumans } = require("../controllers/human");
const { getInfoScopeById } = require("../controllers/statistics");
const auth = require("../middleware/auth");
const checkRoleToViewScopeInfo = require("../middleware/checkRoleToViewScopeInfo");
const router = require("express").Router();

//get address(country, city,district,commune,village)
router.get('/:id',getAddressById)

//statistic 
router.get(['/country/statistic','/city/:id/statistic','/district/:id/statistic','/commune/:id/statistic',
            '/village/:id/statistic'],[auth,checkRoleToViewScopeInfo],getInfoScopeById)
            
router.get(['/country/humen','/city/:id/humen','/district/:id/humen','/commune/:id/humen',
            '/village/:id/humen'],[auth,checkRoleToViewScopeInfo],getInfoHumans)

//areas that belong to {_id}           
router.get(['/country/scopes','/city/:id/scopes','/district/:id/scopes',
            '/commune/:id/scopes','/village/:id/scopes'],getScopes)

router.get('/all',getAddresses)
//areas {_id}
router.get(['/city/:id','/district/:id','/commune/:id','/village/:id'],getScopeById)




module.exports =router;