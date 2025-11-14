import jwt from 'jsonwebtoken'

const secret_key = process.env.SECRET_KEY;

export const getToken = async (id)=> {
    const token = jwt.sign({userId:id},secret_key,{expiresIn:'7d'});
    return token;
}