console.log("Processo Principal")

// shell acessar links e aplicações externas

const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')

const path = require('node:path')

const { conectar, desconectar } = require('./database.js')

const clienteModel = require('./src/models/Clientes.js')

// Importação da biblioteca nativa do js para manipular arquivos
const fs = require('fs')

// IMportação do pacote jspdf (arquivos pdf) npm install jspdf
const { jspdf, default: jsPDF } = require('jspdf')

//Janela Principal
let win
const createWindow = () => {
  nativeTheme.themeSource = 'light'
  win = new BrowserWindow({
    width: 1080,
    height: 900,

    webPreferences: {
      preload: path.join(__dirname, './preload.js')
    }
  })

  Menu.setApplicationMenu(Menu.buildFromTemplate(templete))

  win.loadFile('./src/views/index.html')
}

let about
function aboutWindow() {
  nativeTheme.themeSource = 'light'

  const mainWindow = BrowserWindow.getFocusedWindow()

  if (mainWindow) {
    about = new BrowserWindow({
      width: 415,
      height: 350,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, './preload.js')
      }
    })
  }

  about.loadFile('./src/views/sobre.html')

  ipcMain.on('about-exit', () => {
    if (about && !about.isDestroyed()) {
      about.close()
    }

  })
}

app.whenReady().then(() => {
  createWindow()

  ipcMain.on('db-connect', async (event) => {
    const conectado = await conectar()
    if (conectado) {
      setTimeout(() => {
        event.reply('db-status', "conectado")
      }, 500)
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  await desconectar()
})

app.commandLine.appendSwitch('log-level', '3')

const templete = [
  {
    label: 'Cadastro',
    submenu: [
      {
        label: 'Sair',
        accelerator: 'Esc'
      }
    ]
  },
  {
    label: 'Relatórios',
    submenu: [
      {
        label: 'Clientes',
        click: () => relatorioClientes()
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Ampliar',
        role: 'zoomIn',
        accelerator: 'Ctrl+='
      },
      {
        label: 'Reduzir',
        role: 'zoomOut',
        accelerator: 'Ctrl+-'
      },
      {
        label: 'Tamanho padrão',
        role: 'resetZoom',
        accelerator: 'Ctrl+0'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: 'reload'
      },
      {
        label: 'DevTools',
        role: 'toggleDevTools',
        accelerator: 'Ctrl+Shift'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Repositório',
        click: () => shell.openExternal('')
      },
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
]

//= CRUD CREATE ==================================================
ipcMain.on('create-cliente', async (event, newCliente) => {
  console.log(newCliente)

  try {
    const newClientes = clienteModel({
      nome: newCliente.nomeCli,
      sexo: newCliente.sexoCli,
      cpf: newCliente.cpfCli,
      email: newCliente.emailCli,
      telefone: newCliente.telCli,
      cep: newCliente.cepCli,
      logradouro: newCliente.logradouroCli,
      numero: newCliente.numeroCli,
      complemento: newCliente.complementoCli,
      bairro: newCliente.bairroCli,
      cidade: newCliente.cidadeCli,
      uf: newCliente.ufCli,
    })

    await newClientes.save()

    dialog.showMessageBox({
      type: 'info',
      title: "Aviso",
      message: "Cliente adicionado com sucesso.",
      buttons: ['OK']
    }).then((result) => {
      if (result.response === 0) {
        event.reply('reset-form')
      }
    })

  } catch (error) {
    // Tratamento da excessão "CPF duplicado"
    if (error.code === 11000) {
      dialog.showMessageBox({
        type: 'error',
        title: "Atenção!!!",
        message: "CPF já cadastrado.\nVerifique o número digitado",
        buttons: ['OK']
      }).then((result) => {
        // Se o botão OK for pressionado
        if (result.response === 0) {
          // Encontrar o campo de CPF
          event.reply('reset-cpf')
        }
      })
    } else {
      console.log(error);
    }
  }

})
//= FIM CREATE ==================================================

//===============================================================
//===============================================================

//=== Relatorio de Clientes =====================================
async function relatorioClientes() {
  try {
    //============================================================================
    // Configuração do documento pdf
    //============================================================================
    // p (portrait) l (landescape)
    const doc = new jsPDF('p', 'mm', 'a4')

    //Inserir data atual no documento
    const dataAtual = new Date().toLocaleString('pt-BR')
    // doc.setFontSize() tamanho da fonte
    doc.setFontSize(10)
    // doc.text() escreve um texto no documento
    doc.text(`Data: ${dataAtual}`, 160, 15) // (x, y (mm))
    doc.setFontSize(18)
    doc.text("Relatorio de Cliente", 15, 30)
    doc.setFontSize(12)
    let y = 50 // variavel de apoio
    doc.text("Nome", 14, y)
    doc.text("Telefone", 85, y)
    doc.text("E-mail", 130, y)
    y += 5
    // Desenhar uma linha
    doc.setLineWidth(0.5)
    doc.line(10, y, 200, y) // (10 (inicio)_______________________ 200(fim))
    y += 10

    //===========================================================================
    // Obter a listagem de clientes (ordem alfabetica)
    //===========================================================================
    const clientes = await clienteModel.find().sort({ nome: 1 })
    // Teste de recebimento
    //console.log(clientes)
    // Popular o documento pdf com os clientes cadastrados
    clientes.forEach((c) => {
      // Criar uma nova pagina se y > 280mm (A4 = 297mm)
      if (y > 280) {
        doc.addPage()
        y = 20 // Margem de 20mm para iniciar a nova folha
        doc.text("Nome", 14, y)
        doc.text("Telefone", 85, y)
        doc.text("E-mail", 130, y)
        y += 5
        // Desenhar uma linha
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y) // (10 (inicio)_______________________ 200(fim))
        y += 10
      }
      doc.text(c.nome, 15, y)
      doc.text(c.telefone, 85, y)
      doc.text(c.email, 130, y)
      y += 10
    })

    //============================================================================
    // Numeração automatica de pagina
    //============================================================================
    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.getFontSize(10)
      doc.text(`Pagina ${i} de ${pages}`, 105, 297, { align: 'center' })
    }

    //============================================================================
    // Abrir o arquivo pdf no sistema operacional 
    //============================================================================

    // Definir o caminho do arquivo temporário e nome do arquivo com extenção .pdf
    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'clientes.pdf')
    // salvar temporariamente o arquivo
    doc.save(filePath)
    // abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }

}
//=== FIM - Relatorio de Clientes =================================================

//=================================================================================

//= CRUD READ =====================================================================

// Validação da busca
ipcMain.on('validate-search', () => {
  dialog.showMessageBox({
    type: 'warning',
    title: 'atenção',
    message: 'Preencher o campo de busca',
    buttons: ['OK']
  })
})

ipcMain.on('search-name', async (event, cliName) => {
  // Teste do recebimento do nome do cliente (Passo 2)
  console.log(cliName)
  try {
    // Passos 3 e 4 (Busca dos dados do cliente pelo nome)
    // RegExp (expresão regular 'i' -> insentive (ignorar letra maiuscula ou minuscula))
    const client = await clienteModel.find({
      nome: new RegExp(cliName, 'i')
    })
    // teste da busca do cliente pelo nome (Passo 3 e 4)
    console.log(client)
    // Melhoria da experiencia do usuario (se não existir um cliente cadastrado enviar uma mensagem)
    if (client.length === 0) {
      // Questionar o usuario.....
      dialog.showMessageBox({
        type: 'warning',
        title: 'Aviso',
        message: 'Cliente não cadastrado. \nDeseja cadastrar este cliente',
        defaultId: 0,
        buttons: ['Sim', 'Não']
      }).then((result) => {
        // se o botão sim for pressionado
        if(result.response === 0){
          // Enviar ao pedido para renderer um pedido para recortar e copiar o nome do cliente
          event.reply('set-name')
        }else{
        // Enviar ao renderer um pedido para limpar o campo
        event.reply('reset-form')
        }
      })

    } else {
      // Enviar ao renderizador (rendererCliente) os dados do cliente (Passo 5) OBS: converter para string
      event.reply('render-client', JSON.stringify(client))
    }
  } catch (error) {
    console.log(error)
  }
})
//= FIM CRUD ======================================================================