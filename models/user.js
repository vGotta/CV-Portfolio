import mongoose from 'mongoose'

/******** SCHEMA A RESPECTER POUR CREER UN UTILISATEUR **********/


const userSchema = new mongoose.Schema({
    mail: {
        type: String,
        required: [true, "pas de mail"]
    },
    password: {
        type: String,
        required: [true, "pas de mot de passe"]
    },
})

const UserModel = mongoose.model('User', userSchema)
export default UserModel