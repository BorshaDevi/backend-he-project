const express = require('express')
const cors = require('cors')
const bcrypt  = require('bcryptjs');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const app = express()
const port=process.env.Port || 5000


const data={
  origin: [ 'http://localhost:5173' ,'https://he-frontend-project-esxvnigek-borshadevis-projects.vercel.app'],
  credentials: true, 
}
app.use(cors(data))
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const menuCollection=client.db("FoodDelivery").collection('menu')
// app.get('/userLogin',async(req,res) =>{
//   const userData=req.body
//   const result=await loginUserCollection.find()
// })
app.get('/idMenu/:id',async(req,res)=>{
  const Id=req.params.id
  const query={_id : new ObjectId(Id)}
  const result=await menuCollection.findOne(query)
  // console.log(result)
  res.send(result)
})
app.get('/allMenu',async(req,res)=>{
  const result=await menuCollection.find().toArray()
  res.send(result)
})
app.post('/jwt',async (req,res) =>{
  const password=req.body
  const token=jwt.sign(password,process.env.Token_secret,{ expiresIn: '1h' } )
  res.send({token})
})    


app.post('/addMenu',async(req,res)=>{
  const menu=req.body
  const result=await menuCollection.insertOne(menu)
  res.send(result)

})

app.post('/loginUsers',async(req,res)=>{
  const loginUser=req.body
  // console.log(loginUser ,'users')
  const name=loginUser.name
  const password=loginUser.password
  const query={ name :name}
  const searchIngUser=await userCollection.findOne(query)
  // console.log(searchIngUser.password ,"hash password")
  const userCollectionPassword=bcrypt.compareSync(password, searchIngUser.password)
  // console.log(userCollectionPassword)
  if(!userCollectionPassword){
    return res.send("Unauthorize")
  }
  const hashPassword= bcrypt.hashSync(password ,10)
  const login={
    name:name,
    password:hashPassword,
  }
  const loginUserData=await loginUserCollection.insertOne(login)
  // console.log(loginUserData ,"login done")
  res.send("Login successfully")
})

app.post('/users',async(req,res)=>{
  const user=req.body
  const email=user.email
  const name=user.name
  const query={email : email}
  const password=user.password
  const role=user.role
  const hashPassword= bcrypt.hashSync(password ,10)
  const userAllData={name:name,password:hashPassword,email :email,role :role}
  const userEmail=await userCollection.findOne(query)
  if(userEmail){
       return res.send("Already register")
  }
  const userData=await userCollection.insertOne(userAllData)
  res.send("New user create")

})
app.delete('/deleteMenu/:id',async(req,res)=>{
  const Id=req.params.id
  const query={_id:new ObjectId(Id)}
  const result=await menuCollection.deleteOne(query)
  res.send(result)
})

app.put('/updateMenu/:id',async(req,res) =>{
  const value=req.body
  const Id=req.params.id
  const filter={_id : new ObjectId(Id)}
  const updateDocs={
    $set:{
      menuName:value.menuName,
      price:value.price,
      category:value.category,
      availability:value.availability,

    }
  }
  const result=await menuCollection.updateMany(filter , updateDocs)
  res.send(result)

  
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