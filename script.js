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

    const error = {error: "Bad request",
                   value: "Missing input Place to save"}

    if(!req.body.input){
        res.status(400).send(error);
        return;
    }

    try {
        await client.connect();

        const db = client.db(dbName)
        const colli = db.collection('sterrenkijkenCollection');

        const place = await colli.findOne({input: req.body.input});
        if(place){
            res.status(400).send('Bad request: inputPlace already excists ' + req.body.input);
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

app.delete('/deleteInput/:id', async (req, res) => {

    const error = {error: "Bad request",
                   value: "Missing input Place to delete"}

    if (!req.params.input) {
        res.status(400).send(error);
        return;
    }
    try {

        await client.connect();
        const db = client.db(dbName);
        const colli = db.collection("sterrenkijkenCollection");
     
        const deleteQuery = { input: req.body.input };
        const deleteMessage = { deleted: "Input place is deleted"}

        const result = await colli.deleteOne(query);
        if (result.deletedCount === 1 ) {
        res
            .status(200)
            .send(deleteMessage);
        } else {
        res
            .status(404)
            .send("No input Place is deleted.");
        }
    }catch (err) {
        console.log('post',err);
        res.status(500).send({
            err: 'Something went wrong. Try again',
            value: err
        })
    } finally {
        await client.close();
    }
})

app.put("/updateInput/id", async (req, res) => {

    const error = {error: "Bad request",
                   value: "Missing name of place to update"}

    if (!req.body.input) {
      res.status(400).send(error);
      return;
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const colli = db.collection("sterrenkijkenCollection");

        const updateQuery = { input: req.body.input };
        const updateMessage = { deleted: "Input place is updated"}

      const updateInput = {
          input: req.body.newCityName
      };

      const result = await colli.updateOne(updateQuery, {$set: updateInput});             //$set vervangt de waarde van het veld met de aangepaste waarde
      res.status(201).send(result);
      
    } catch (error) {
      console.log(error);
      res.status(500).send({
        error: "something went wrong",
        value: error,
      });
    } finally {
      await client.close();
    }
  });


app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})
