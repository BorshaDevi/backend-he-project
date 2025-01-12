const express = require('express')
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken');
const app = express()
const port=process.env.Port || 5000


app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.mongoDb_uri;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const userCollection=client.db("FoodDelivery").collection('users')
    const loginUserCollection=client.db("FoodDelivery").collection('loginUsers')

app.post('/jwt',async (req,res) =>{
  const password=req.body
  const token=jwt.sign(password,process.env.Token_secret,{ expiresIn: '1h' } )
  res.send({token})
})    

app.post('/loginUsers',async(req,res)=>{
  const loginUser=req.body
  const name=loginUser.name
  const password=loginUser.password
  const query={name:name , password :password}
  const searchIngUser=await userCollection.findOne(query)
  if(!searchIngUser){
    return res.send("Unauthorize")
  }
  const loginUserData=await loginUserCollection.insertOne(loginUser)
  res.send("Login successfully")
})

app.post('/users',async(req,res)=>{
  const user=req.body
  const email=user.email
  const query={email : email}
  const userEmail=await userCollection.findOne(query)
  if(userEmail){
       return res.send("Already register")
  }
  const userData=await userCollection.insertOne(user)
  res.send("New user create")
})








    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);












app.get('/',(req ,res)=>{
    res.send('Server is running')
})
app.listen(port ,() =>{
    console.log(`This server is running port ${port}`)
} )