const express = require('express');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const {MongoClient} = require ('mongodb');
require('dotenv').config();
const cors = require('cors')
const app = express();
const port = process.env.PORT;


const client = new MongoClient(process.env.FINAL_URL, {
    useNewUrlParser: true
});

const dbName = process.env.DBNAME;
app.use(cors());
app.use(bodyParser.json());

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.redirect("/info.html");

})

app.get('/inputPlace', async (req, res) => {
    try {
        await client.connect();
        
        const db = client.db(dbName)
        const colli = db.collection('sterrenkijkenCollection');
        const findStars = await colli.find({}).toArray();

        res.status(200).send(findStars);
       } catch (err) {
        console.log('get',err);
        res.status(500).send({
            err: 'Something went wrong. Try again',
            value: err
        })
    }

    finally {
       await client.close();
   }

})

app.post('/saveInputPlace', async (req, res) => {
    console.log(req.body)

    if(!req.body.input){
        res.status(400).send('Bad request: missing id, name, genre, mechanisms or description');
        return;
    }

    try {
        await client.connect();

        const db = client.db(dbName)
        const colli = db.collection('sterrenkijkenCollection');

        const place = await colli.findOne({_id: req.body.id});
        if(place){
            res.status(400).send('Bad request: inputPlace already excists ' + req.body.id);
            return;
        } 

        let newInput = {
            _id: req.body.id,
            input: req.body.input           // achter .body => komt de naam van de parameter
        }

        let insertResultChallenge = await colli.insertOne(newInput);

        res.status(201).json(newInput)
        return;

    }catch (err) {
        console.log('post',err);
        res.status(500).send({
            err: 'Something went wrong. Try again',
            value: err
        })
    }
    finally{
        await client.close();
    }
})

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})
