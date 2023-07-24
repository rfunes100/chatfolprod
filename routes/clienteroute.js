
'use strict'

const Express = require('express');



const clientecontroller  = require('../controllers/clientecontroller.js')
const checkAuth = require('../middleware/checkauth.js')


const router = Express.Router();


// Debe pasar una función como controlador en su lugar
router.get('/', checkAuth,clientecontroller.getclientebot )
  
//router//.route('/')
//.get('/' , checkAuth, getclientebot)
// creacion, registro confirmacion usuarios




module.exports = router
 


