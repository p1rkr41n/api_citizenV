const { Human } = require("../../models/human/human")
const ObjectId = require('mongoose').Types.ObjectId


//lay danh sach gia tri trong 1 field
// values  = await Human.distinct('<field_name>')

//thong ke so dan theo dia chi tam tru day du của 1 số làng (nếu thống kê tát cả thì comment phần match)
    exports.countThePopulation =(addresses) => Human.aggregate([ 
        {
            $match:{
                idTemporaryResidenceAddressRef: {
                    $in:addresses
                }
            }
        },
        {$project:{
            idTemporaryResidenceAddressRef:1,gender:1

        }},
            {
                $group:{//nếu thống kê tất cả thì mới cần trường này, k thì không cần
                    // _id:"$idTemporaryResidenceAddressRef",
                    _id:{
                        gender:"$gender"
                    },
                    count: { $sum: 1 },
                }
            }
                
    ])
 
//thống kê theo giới tính,độ tuổi dân số theo các khoảng tuổi của 1 số làng( có thể theo xã,thành phố)
    exports.censusByAgeAndGender =(addresses)=> Human.aggregate([
            {
                $match:{
                    idTemporaryResidenceAddressRef: {

                        $in:addresses//địa chỉ đầy đủ của các khu vực muốn thống kê
                        //nếu muốn tìm của 1 xã thì tìm địa chỉ đầy đủ của các làng do xã đó quản lý và thay array đó vào phía trên
                        //nếu muốn thống kê tất thì comment phần match này
                    }
                }
            },
            {
                $project:{
                    age:{
                        $subtract:[{$year:"$$NOW"},{$year:"$birth"}]
                    },
                    gender:1,
                    idTemporaryResidenceAddressRef:1,
                            
                    //             religion:1,
                                // job:1              
                }
            },
            {
                $group:{
                                _id:{
                                    // idTemporaryResidenceAddressRef:"$idTemporaryResidenceAddressRef",
                                    gender:"$gender",
                                    // religion:"$religion",
                                    // job:"$job",
                                    rangeAge:{
                                        $cond: {
                                            if: { $gt: [ "$age", 80 ] }, then: ">80",
                                            else: {
                                                $cond: {
                                                    if: { $gt: [ "$age", 70 ] }, then: "71-80",
                                                    else: {
                                                        $cond: {
                                                            if: { $gt: [ "$age", 60 ] }, then: "61-70",
                                                            else: {
                                                                $cond: {
                                                                    if: { $gt: [ "$age", 50 ] }, then: "51-60",
                                                                    else: {
                                                                        $cond: {
                                                                            if: { $gt: [ "$age", 40 ] }, then: "41-50",
                                                                            else: {
                                                                                $cond: {
                                                                                    if: { $gt: [ "$age", 30 ] }, then: "31-40",
                                                                                    else: {
                                                                                        $cond: {
                                                                                            if: { $gt: [ "$age", 20 ] }, then: "21-30",
                                                                                            else: {
                                                                                                $cond: {
                                                                                                    if: { $gt: [ "$age", 10 ] }, then: "11-20",
                                                                                                    else: "0-10" }
                                                                                            } }
                                                                                    } }
                                                                            } }
                                                                    } }
                                                            } }
                                                    } }
                                            } }
                                    }
                                },
                                count: { $sum: 1 },
                            }
            },
        ])

//số người có và không có việc làm trong 1 số làng(nếu muốn tìm tất thì comment phần match)
     exports.statisticsOnTheNumberOfUnemployedAndEmployedPeople =(addresses)=>  Human.aggregate([
            {
                $match:{
                    idTemporaryResidenceAddressRef: {

                $in:addresses
            }
                }
            },
            {
                $group:{
                    _id:{
                        // idTemporaryResidenceAddressRef:"$idTemporaryResidenceAddressRef",
                        unemployment: {$eq:["$job",""] }
                    },
                    count:{
                        $sum:1
                    }
                }
            }
        ])
//thống kê tôn giáo của 1 số làng(nếu muốn thống kê tất thì comment phần match)

     exports.statisticsOnReligion=(addresses)=>Human.aggregate([
            {
            $match:{
                idTemporaryResidenceAddressRef: {
                    $in:addresses
                }
            }
            },
            {
                $group:{
                    _id:{
                        // idTemporaryResidenceAddressRef:"$idTemporaryResidenceAddressRef",
                        religion:"$religion"
                    },
                    count:{$sum:1}

                },
            }
        ])
 //thống kê trình độ văn hóa của dân sô của một số làng (nếu muốn thống kê tất cả thì comment phần match)
    exports.statisticsOnEducationalLevel=(addresses)=> Human.aggregate([
        {
        $match:{
            idTemporaryResidenceAddressRef: {
                $in:addresses
            }
        }
        },
        {
            $group:{
                _id:{
                    // idTemporaryResidenceAddressRef:"$idTemporaryResidenceAddressRef",
                    educationalLevel:"$educationalLevel"
                },
                count:{$sum:1}

            },
        },
    ])