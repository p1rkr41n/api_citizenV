const { object } = require("joi")

module.exports= function(req,res,next) {
    const roleId={
        'admin':0,
        'A1':1,
        'A2':2,
        'A3':3,
        'B1':4,
        'B2':5,
    }
    if(req.body.role =='admin') return res.status(403).send('Access deniend')
    req.typeOfScope = req.url.split('/')[1]
    const roleID = roleId[req.decodedToken.role]
    console.log(roleId[req.decodedToken.role],roleID == roleId['B1'])
        switch (req.typeOfScope){
            case 'country' :
                if(req.decodedToken.role =='A1')
                    return next();
                    break;
            case 'city':
                if(roleID<=roleId['A1']||(roleID ==roleId['A2']))
                    return  next();
                    break;
            case 'district': 
                if(roleID<=roleId['A2']||(roleID ==roleId['A3']))
                    return next();
                    break;
            case 'commune': 
                if(roleID<=roleId['A3']||(roleID ==roleId['B1']))
                    return next();
                    break;
            case 'village': 
            //trong de ghi la B2 chi dc nhap lieu
                if(roleID == roleId['B1'])
                    return next();
                    break;
        }
        return res.status(403).send('Access denied')
}