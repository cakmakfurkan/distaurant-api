const auth = require('basic-auth')
const myBasicAuth= async (req,res,next)=>{

    const user=await auth(req);

    const username='api'
    const password='test'
    if(user && user.name==username && user.pass==password){
        console.log('Basic Auth : Success')
        next()
    }else{
        res.status(401).send({
            status: "access_denied"
        })
    }
}

module.exports=myBasicAuth;
