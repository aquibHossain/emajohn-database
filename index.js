const express=require('express')
const cors=require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app=express()
const port=process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3nf9m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try {
        await client.connect();
        const database=client.db("ema-john")
        const productCollection=database.collection('products')
        const orderCollection=database.collection('orders')
        console.log("hitting");

        // app.post('/products',async(req,res)=>{
        //     const product=req.body
        //     const result=await productCollection.insertOne(product)
        //     res.json(result)
        //     console.log("hitted");
        // })
        app.get('/products',async(req,res)=>{
            const cursor=productCollection.find({})
            
            const page=req.query.page
            const size=parseInt(req.query.size)
            let products;
            const count =await cursor.count()
            if(page){
               products=await cursor.skip(page*size).limit(size).toArray()
            }
            else{
               products=await cursor.toArray()
            }
            
            
            res.json({count,products})
        })
        app.post('/products/bykeys',async(req,res)=>{
            const keys=req.body
            console.log(keys);
           const query={key:{$in:keys}}
           const result= await productCollection.find(query).toArray()
            res.json(result)
        })
        app.post('/orders',async(req,res)=>{
            const order=req.body
            order.createdAt=new Date()
            const result =await orderCollection.insertOne(order)
            // console.log(order);
            res.send(result)
        })
        app.get('/orders',async(req,res)=>{
            let query={}
            const email=req.query.email  
            if(email){
                query={email:email}
            }
            const cursor=orderCollection.find(query)
            const result=await cursor.toArray()
            res.send(result)
        })
    } finally {
        // await client.close();
      }
    }
    run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send("ema-John database Running")
})

app.listen(port,()=>{
    console.log("Listening to port",port);
})