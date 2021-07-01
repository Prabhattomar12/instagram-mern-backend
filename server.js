import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Pusher from 'pusher';
import dbModel from './dbModel.js';

// app config
const app = express();
const PORT = process.env.PORT || 9000;

const pusher = new Pusher({
 
  // Enter your pusher app configs

});

// middlewares
app.use(express.json());
app.use(cors());

// db config

const connection_url =
  'mongodb+srv://admin-prabhat:3pqmMsx2EAgjG4O5@cluster0.gfxdk.mongodb.net/instaDB?retryWrites=true&w=majority';
mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

mongoose.connection.once('open', (err, res) => {
  if (!err) console.log('DB Connected');

  const changeStream = mongoose.connection.collection('posts').watch();

  changeStream.on('change', (change) => {

    if (change.operationType === 'insert') {

      pusher.trigger("posts","inserted", {
          change: change
      });
    }else if(change.operationType === 'update'){
      pusher.trigger("comments","updated", {
        change: change
    });
    } else {
      console.log('unknown trigger from pusher');
    }
  });
});

// api routes

app.get('/', (req, res) => {
  res.status(200).send('Hello world');
});

app.post('/posts/add', (req, res) => {
  const body = req.body;

  dbModel.create(body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(body);
    }
  });
});

app.get('/posts', (req, res) => {

    dbModel.find((err, data) => {
          if(err){
               res.status(500).send(err.message)
          }else{
               res.status(200).send(data)
          } 
    })
}) 

app.post('/posts/addComment', (req, res) => {
      const newComment = req.body;
      
      dbModel.updateOne({_id: req.query.id },
        { $push: { comments: newComment } },
         (err, data) => {
            if(err){
                res.status(500).send(err)
            }else{
                res.status(201).send(data)
            }
         })

})

app.get('/posts/single', (req, res) =>{

      dbModel.findOne({ _id: req.query.id }, (err, data) => {
                if(err){
                    res.status(500).send(err)
                }else{
                    res.status(200).send(data)
                }
      })
})


// listen
app.listen(PORT, () => console.log('listening on port : ' + PORT));

