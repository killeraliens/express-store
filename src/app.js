require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const uuid = require('uuid/v4')
const { NODE_ENV } = require('./config')

const app = express()
const morganOption = NODE_ENV === 'production' ? 'tiny' : 'dev'

app.use(morgan(morganOption))
app.use(express.json())
app.use(helmet())
app.use(cors())
//app.use(validateBearerToken)
app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === "production") {
    response = { error: { message: "Server Error" } }
  } else {
    console.log("ERRRORRR", error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})
app.use(validateContentType)

const users = [
  {
    "id": "3c8da4d5-1597-46e7-baa1-e402aed70d80",
    "username": "sallyStudent",
    "password": "c00d1ng1sc00l",
    "favoriteClub": "Cache Valley Stone Society",
    "newsLetter": "true"
  },
  {
    "id": "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
    "username": "johnBlocton",
    "password": "veryg00dpassw0rd",
    "favoriteClub": "Salt City Curling Club",
    "newsLetter": "false"
  }
]


app.get('/user/:id', (req, res) => {
  const id = req.params.id
  const user = users.find(user => user.id === id)
  res.json(user)
})


app.get('/user', (req, res) => {
  res.json(users)
})


app.post('/user', (req, res) => {
    const { username, password, favoriteClub, newsLetter=false } = req.body;

    if (!username) {
      return res
        .status(400)
        .send('Username required')
    }

    if (!password) {
      return res
        .status(400)
        .send('Password required');
    }

    if (!favoriteClub) {
      return res
        .status(400)
        .send('favorite Club required');
    }

    if (username.length < 6 || username.length > 20) {
      return res
        .status(400)
        .send('Username must be between 6 and 20 characters');
    }

    if (password.length < 8 || password.length > 36) {
      return res
        .status(400)
        .send('Password must be between 8 and 36 characters');
    }

    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
      return res
        .status(400)
        .send('Password must be contain at least one digit');
    }

    const clubs = [
      'Cache Valley Stone Society',
      'Ogden Curling Club',
      'Park City Curling Club',
      'Salt City Curling Club',
      'Utah Olympic Oval Curling Club'
    ];

    if (!clubs.includes(favoriteClub)) {
      return res
      .status(400)
      .send('Not a valid club');
    }


    const id = uuid()
    const newUser = { ... req.body, newsLetter, id }
    users.push(newUser)

    res
      .status(201)
      .location(`https://localhost:8000/user/${id}`)
      .json(newUser);
})


app.delete('/user/:userId', (req, res) => {
  const { userId } = req.params

  const userIndex = users.findIndex(u => u.id === userId )

  if (userIndex === -1 ) {
    res
    .status(404)
    .json({error: 'User not found'})
  }

  users.splice(userIndex, 1)
  res
    .status(201)
    .send('Deleted user')
})


function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN
  const authHeader = req.get('Authorization')
  const bearerToken = authHeader ? authHeader.split(' ')[1] : null;

  if (!bearerToken || bearerToken !== apiToken) {
    res.status(403)
    .json({ error: 'FORBIDDEN Unauthorized request' })
  }
  next()
}

function validateContentType(req, res, next) {
  console.log(req.headers)
  if (req.headers['content-type'] && req.headers['content-type'] !== 'application/json' ) {
    return res
      .status(400)
      .json({ error: 'content-type error' })
  }
  next()
}

module.exports = app
