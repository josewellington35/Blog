const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
require("../models/Postagem")
const Categoria = mongoose.model("categorias")
const Postagem = mongoose.model("postagens")
const { eAdmin } = require("../helpers/eAdmin")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get('/postagem', eAdmin,(req, res) => {
    Postagem.find().populate("categoria").sort({ date: "desc" }).lean().then((postagens) => {
        res.render("admin/postagem", { postagens })
       
    }).catch((err) => {
        req.flash("erro_msg", "Erro na listagem")
        res.redirect("/admin")
    })
  

})
router.get("/registro", (req, res) => {
    res.render("admin/registro")


})
router.post("/registro", (req, res) => {
    var erros = []


    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome Inválido" })

    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "Email Inválido" })

    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha Inválido" })

    }
    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta" })

    }
    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "As senhas são diferentes" })

    }
    if (erros.length > 0) {
        res.render("admin/registro", { erros: erros })


    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta como este e-mail ")
                res.redirect("/admin/registro")
            } else {

                const novoUsuario = new Usuario({

                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    eAdmin: req.body.nivelAcesso
                })

                bcrypt.genSalt(10, (erro, salt) => {

                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {

                        if (erro) {

                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso... ")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente!")
                            res.redirect("/admin/registro")

                        })

                    })

                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")

        })


    }


})
router.get("/usuarios", (req, res) => {
    Usuario.find().lean().then((usuarios) => {
        res.render('admin/usuarios', { usuarios })
        //  res.render("admin/categorias", { categorias: categorias })
    }).catch((err) => {
        req.flash("erro_msg", "Erro na listagem")
        res.redirect("/admin")
    })

   


})
router.post('/usuarios/delete', eAdmin, (req, res) => {
    Usuario.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Deletado com sucesso")
        res.redirect("/admin/usuarios")
    }).catch((err) => {
        req.flash("erro_msg", "Erro ao Excluir ")
        res.redirect("/admin/usuarios")
    })

})
router.post("/usuarios/edit", eAdmin, (req, res) => {

    Usuario.findOne({ _id: req.body.id }).then((usuarios) => {

        usuarios.nome = req.body.nome
        usuarios.email = req.body.email
        usuarios.eAdmin = req.body.nivelAcesso
        usuarios.senha = req.body.senha


        usuarios.save().lean().then(() => {
            req.flash("success_msg", "Dados editada com sucesso!!!")
            res.redirect("/admin/usuarios")
        }).catch((err) => {
            req.flash("erro_msg", "Erro ao editar ")
            res.redirect("/admin/usuarios")
        })
    }).catch((err) => {
        req.flash("erro_msg", "Erro ao salvar")
        res.redirect("/admin/usuarios")
    })



})
router.get('/usuarios/edit/:id', eAdmin, (req, res) => {
    Usuario.findById(req.params.id).lean().then((usuarios) => {// pesquisando de o id passado e igual ao id no banco
   
            res.render("admin/editusuarios", {
                usuarios: usuarios
            })
        })
    })

////////Este campo esta preenchendo o combobox da tela de addpostagem por isso que ele esta pegando da classe categaria
///ele pega as categorias e joga no campo
router.get('/postagem/add',eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {

        res.render("admin/addpostagem", {  categorias })

    }).catch((err) => {
        req.flash("Erro ao carregar categorias!!")
        res.redirect("/admin")
    })
})


/////////////////////////////////////////////////////////////////////campo categorias
router.post("/postagem/nova",eAdmin, (req, res) => {
    //var erros = []
    //if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
    //    erros.push({ text: "titulo invalido" })

    //}
    //if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    //    erros.push({ text: "Slug invalido" })

    //} if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
    //    erros.push({ text: "Descricao invalido" })

    //} if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
    //    erros.push({ text: "Conteudo invalido" })

    //} if (!req.body.categoria || typeof req.body.categoria == undefined || req.body.categoria == null) {
    //    erros.push({ text: "categoria invalido" })

    //}
    //if (req.body.titulo.length < 6) {
    //    erros.push({ text: "Nome da categoria invalido" })

    //}
    //if (erros.length > 0) {
    //    erros.push({ text: "Erro aqui" })
    //}
    //else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagem).save().then(() => {

            req.flash("success_msg", "Postagem criada com sucesso!!!")
            res.redirect("/admin/postagem")
        }).catch((err) => {
            console.log("Erro ao salvar categoria!!")
        })

   // }
})
router.post("/postagem/edit",eAdmin, (req, res) => {
  
        Postagem.findOne({ _id: req.body.id }).then((postagens) => {
           
          postagens.titulo   = req.body.titulo
          postagens.slug     = req.body.slug
          postagens.descricao= req.body.descricao
          postagens.conteudo = req.body.conteudo
          postagens.categoria= req.body.categoria

          postagens.save().lean().then(() => {
                req.flash("success_msg", "Dados editada com sucesso!!!")
                res.redirect("/admin/postagem")
            }).catch((err) => {
                req.flash("erro_msg", "Erro ao editar ")
                res.redirect("/admin/postagem")
            })
        }).catch((err) => {
            req.flash("erro_msg", "Erro ao salvar")
            res.redirect("/admin/postagem")
        })


    
})
//router.get('/postagem/edit/:id', (req, res) => {
//    Postagem.findOne({ _id: req.params.id }).lean().then((postagens) => {  // pesquisando de o id passado e igual ao id no banco
//        res.render("admin/editpostagem", {  postagens }) ///o categorias está ai pois tem que preencher o campo categorias da página editpostagem
//    }).catch((err) => {
//        req.flash("erro_msg", "Erro Id não existe")
//        res.redirect("/admin/postagem")
//    })
//}) 
router.get('/postagem/edit/:id', eAdmin,(req, res) => {
    Postagem.findById(req.params.id).lean().populate('categoria').then((postagens) => {// pesquisando de o id passado e igual ao id no banco
    Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagem", {
            postagens: postagens, categorias: categorias
            })
        })
    })
})

router.post('/postagem/delete',eAdmin, (req, res) => {
    Postagem.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Deletado com sucesso")
        res.redirect("/admin/postagem")
    }).catch((err) => {  
        req.flash("erro_msg", "Erro ao Excluir ")
        res.redirect("/admin/postagem")
    })

})



router.get('/', (req, res) => {
    res.send("Página de posts")
})
router.post('/categorias/delete',eAdmin, (req, res) => {
    Categoria.remove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Deletado com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("erro_msg", "Erro ao Excluir categoria")
        res.redirect("/admin/categorias")
    })
  
})


router.post("/categorias/edit",eAdmin, (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ text: "nome invalido" })

    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ text: "Slug invalido" })

    }
    if (req.body.nome.length < 2) {
        erros.push({ text: "Nome da categoria invalido" })

    }
    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros })
    }
    else {

        Categoria.findOne({_id: req.body.id }).then((categoria) => {

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug
            categoria.save().lean().then(() => {
                req.flash("success_msg", "Academia editada com sucesso!!!")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("erro_msg", "Erro ao editar categoria")
                res.redirect("/admin/categorias")
                  })
        }).catch((err) => {
            req.flash("erro_msg", "Erro ao salvar")
            res.redirect("/admin/categorias")
        })
        

    }
})
router.get('/categorias/edit/:id',eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {  // pesquisando de o id passado e igual ao id no banco
        res.render("admin/editcategorias", { categoria })
    }).catch((err) => {
        req.flash("erro_msg", "Erro Id não existe")
        res.redirect("/admin/categorias")
    })
})
router.get('/categorias',eAdmin, (req, res) => {

    Categoria.find().sort({ date: 'desc' }).lean().then((categorias) => {
        res.render('admin/categorias', { categorias })
      //  res.render("admin/categorias", { categorias: categorias })
    }).catch((err) => {
        req.flash("erro_msg", "Erro na listagem")
        res.redirect("/admin")
        })
 
})
router.get('/categorias/add',eAdmin, (req, res) =>
{
   res.render("admin/addcategorias")
})
router.get('/pagina/login', (req, res) => {
    res.render("admin/login")
})

router.post("/categorias/nova", eAdmin, (req, res) => {
    
    var erros = []
     
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({text: "nome invalido"})

    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ text: "Slug invalido" })

    }
    if (req.body.nome.length < 2) {
        erros.push({ text:"Nome da categoria invalido" })
        
    }
    if (erros.length > 0) {
         res.render("admin/addcategorias", { erros: erros })
    }
    else {
         const novaCategoria = {
             nome: req.body.nome,
             slug: req.body.slug
         }
         new Categoria(novaCategoria).save().then(() => {
             console.log('Titulo: ', req.body.nome);
             req.flash("success_msg", "Categoria Criada com sucesso!!!")
             res.redirect("/admin/categorias")
         }).catch((err) => {
             console.log("Erro ao salvar categoria!!")
         })

     }




    
})
//Rota de pesquisa mas não está funcionando site para ver como pesquisar https://sequelize.org/v5/manual/models-usage.html#-code-findall--code----search-for-multiple-elements-in-the-database
router.post("/pesquisa", (req, res) => {
    const text = req.body.pesquisa // isso faz pesquisa pela letra  EX: /^a/
    console.log('Titulo: ', /^d/);//se jogar a variavel dentro ele pesquiso só com o nome clopleto ainda não consegui fazer pesquisar com a primeira letra
    let comk = "/^"
    
    var query = { titulo: comk.concat(text,"/") };

    Postagem.find(query).lean().populate("categoria").sort({ date: "desc" }).then((postagens) => {

        res.render("index", { postagens: postagens })



    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })

})
module.exports = router

