// controllers/home.js
module.exports = {
    getIndex: (req,res)=>{
        console.log('Inside getIndex'); // Debugging line
        res.render('login', {
            authErrors: []
        })
    }
}