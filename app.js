// Carrregar módulos
let express = require('express');
const app = express()
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")//para todo o processo de listagem tem que fazer isso, ou seja para cada tabela que for listada, não só para listar mas tabém para fazer qual quer etapa do crud 
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)
const { nivelAcesso } = require("./helpers/eAdmin")

// Configurações
//sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true

}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
//middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    res.locals.eAdmin = nivelAcesso
    next()
})
    //Body parser 
      app.use(bodyParser.urlencoded({extended: true }))
      app.use(bodyParser.json())
      // Handlebars
      app.engine('handlebars', handlebars({ defultLayout: 'main' }))
      app.set('view engine','handlebars')
//Mongoose

//criação do banco 
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/blogapp').then(() =>
{
    console.log("Conectado ao mongo")
}).catch((err) => {
    console.log("Erro de conecção:" + err)


    })
//Public
app.use(express.static(path.join(__dirname,"public")))
//VVVVV
//Essa rota pesquisa pelo slug da postagem
app.get('/postagem/:slug', (req, res) => {

    const slug = req.params.slug

    Postagem.findOne({ slug })

        .then(postagem => {

            if (postagem) {

                const post = {

                    titulo: postagem.titulo,

                    date: postagem.date,

                    conteudo: postagem.conteudo

                }

                res.render('postagem/index', post)

            } else {

                req.flash("error_msg", "Essa postagem nao existe")

                res.redirect("/")

            }

        })

        .catch(err => {

            req.flash("error_msg", "Houve um erro interno")

            res.redirect("/")

        })

})
//lista categorias

app.get("/categorias", (req, res) => {
   // Categoria.find().lean().then((categorias) => {
    Categoria.find().lean().populate("categoria").sort({ date: "desc" }).then((categorias) => {


        res.render("categorias/index", { categorias: categorias })// isso faz que ele execute a pagina que está neste caminho
           



    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias")
        res.redirect("/")
        })

})
//Essa rota leva para a categoria especifica
app.get("/categorias/:slug", (req, res) => {


    Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        if (categoria) {

          
            Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {
                res.render("categorias/postagens", { postagens: postagens, categoria: categoria })
                
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar os posts")
                res.redirect("/")
                })

        } else {
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/")
        }
     


    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
        res.redirect("/")


        })




})



// Rotas
app.get('/', (req, res) => {
    Postagem.find().lean().populate("categoria").sort({ date: "desc" }).then((postagens) => {
        res.render("index", { postagens: postagens })



    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
        })
  
})


app.get('/404', (req, res) => {
    res.send("Erro 404")
})
app.get('/posts', (req, res) => {
    res.send("Listar Posts")
})
app.use('/admin', admin)
app.use("/usuarios", usuarios)
// Outros
const PORT = 8089
app.listen(PORT, () =>{
    console.log("Servidor rodando")
    })