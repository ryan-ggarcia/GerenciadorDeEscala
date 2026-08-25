import expressEjsLayouts from 'express-ejs-layouts'
import express from 'express'
import UserRouter from './router/UserRouter.js'
import MissaRouter from './router/MissaRouter.js'
import AcolitosRouter from './router/AcolitosRouter.js'
import FuncaoRouter from './router/FuncaoRouter.js'
import EscalaRouter from './router/EscalaRouter.js'
import HomeRouter from './router/HomeRouter.js'

const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.set('views', './views')
app.set('layout', 'layouts/layout')

app.use(expressEjsLayouts)
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(express.json())

app.use('/', HomeRouter)
app.use('/user', UserRouter)
app.use('/missa', MissaRouter)
app.use('/acolitos', AcolitosRouter)
app.use('/funcao', FuncaoRouter)
app.use('/escala', EscalaRouter)

app.listen(port, ()=>{ console.log(`app on-line`) })