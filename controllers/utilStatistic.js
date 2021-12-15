const { Human } = require("../models/human/human")

//lay danh sach gia tri trong 1 field
values  = await Human.distinct('<field_name>')

//thong ke so dan theo dia chi tam tru day du(village)
 Human.aggregate([ 

    {
        $group:{
            _id:"$idTemporaryResidenceAddressRef",
            count: { $sum: 1 }
        }
    }
    
])

//thong ke so dan gioi tinh nam cua cac (village)(theo dia chi tam tru),
//muon thong ke ca cac gioi tinh khac dung values voi Promise phia duoi
 Human.aggregate([
    {
        $match:{
            gender:'male'
        }
    },   
    {
        $group:{
            _id:"$idTemporaryResidenceAddressRef",
            count: { $sum: 1 }
        }
        
    },
    { //sap xep theo thu tu count giam dan
        $sort: { count: -1 } 
    } 
    
])

//thong ke nghe {job} tuoi tu 20-30 cua cac village,ton giao,nghe nghiep tuong tu
Human.aggregate([
    
    {
        $match:{
            job:'sv',
            age: {//cho nay chua dung vi chi luu birth
                $gte: 20,
                $lte: 30
            }
        },
    },
    {
        $group:{
            _id: idTemporaryResidenceAddressRef,
        }
    }
])


//thong ke cac cap tren dung thong ke cac cap duoi de thuc hien






//
