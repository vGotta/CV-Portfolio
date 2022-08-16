import UserModel from "../models/user.js";

let authguard = async function (req, res, next) {
    let user = await UserModel.findOne({_id: req.session.user})
    if (user) {
        next()
    }else{
        res.redirect('/home')
    }
}

export default authguard