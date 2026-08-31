import expressEjsLayouts from 'express-ejs-layouts'
import express from 'express'
import UserRouter from './router/UserRouter.js'
import MissaRouter from './router/MissaRouter.js'
import AcolitosRouter from './router/AcolitosRouter.js'
import IndisponivelRouter from './router/IndisponivelRouter.js'
import FuncaoRouter from './router/FuncaoRouter.js'
import AcolitoFuncaoRouter from './router/AcolitoFuncaoRouter.js'
import EscalaRouter from './router/EscalaRouter.js'
import HomeRouter from './router/HomeRouter.js'
import AuthMiddleware from './middleware/authMiddleware.js'
import cookieParser from 'cookie-parser'

const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.set('views', './views')
app.set('layout', 'layouts/layout')

app.use(expressEjsLayouts)
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

app.use('/escala', EscalaRouter)
app.use('/', HomeRouter)

let auth = AuthMiddleware.adminlogin
app.use(auth)

app.use('/user', UserRouter)
app.use('/missa', MissaRouter)
app.use('/acolitos', AcolitosRouter)
app.use('/indisponivel', IndisponivelRouter)
app.use('/funcao', FuncaoRouter)
app.use('/acolitofuncao', AcolitoFuncaoRouter)


app.listen(port, ()=>{ console.log(`app on-line`) })