const db = require("../models")


module.exports = app=>{

    app.get('/init',(req, res)=>{     

        db.Post.find({}).sort({"created_at": 1})
        .then((result)=>{ 
          res.header('Access-Control-Allow-Origin')
          res.json(result)    
        })  
      })

      app.get('/express_backend', (req, res) => {
        res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
      });
}