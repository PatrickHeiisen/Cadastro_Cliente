function buscarEndereco() {
    let cep = document.getElementById('inputCep').value
    let urlAPI = `https://viacep.com.br/ws/${cep}/json/`

    fetch(urlAPI)
        .then(response => response.json())
        .then(dados => {
            document.getElementById('inputLogradouro').value = dados.logradouro
            document.getElementById('inputBairro').value = dados.bairro
            document.getElementById('inputCidade').value = dados.localidade
            document.getElementById('inputUf').value = dados.uf;
        })
}

function limparFormulario() {
    document.getElementById("formCliente").reset();
    document.getElementById("cpfErro").style.display = "none";
    document.getElementById("mensagemSucesso").style.display = "none";
}

// Validação de CPF
function validarCPF() {
    let cpfInput = document.getElementById('inputCpf');
    let cpf = cpfInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Resetando o estilo
    cpfInput.style.border = "";

    // Verifica se o CPF é composto por 11 dígitos e não é uma sequência repetida
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        cpfInput.style.border = "2px solid red";
        return;
    }

    let soma = 0, resto;

    // Validação do primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf[i - 1]) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) {
        cpfInput.style.border = "2px solid red";
        return;
    }

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf[i - 1]) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) {
        cpfInput.style.border = "2px solid red";
        return;
    }

    // CPF válido, remove borda vermelha
    cpfInput.style.border = "";
}

// Validação de e-mail
function validarEmail() {
    let email = document.getElementById('inputEmail').value;
    let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let emailInput = document.getElementById('inputEmail');

    if (!regexEmail.test(email)) {
        alert('E-mail inválido! Insira um e-mail válido.');
        emailInput.focus();
        return false;
    }
    return true;
}

// Validar Formulario
function validarFormulario(event) {
    event.preventDefault();
    let form = document.getElementById("formCliente");
    let inputs = form.querySelectorAll("input[required]");
    let valido = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            valido = false;
        }
    });

    if (!validarCPF()) {
        valido = false;
    }

    if (valido) {
        document.getElementById("mensagemSucesso").style.display = "block";
        form.reset();
    }
}
//===========================================================================
function obterData() {
    const data = new Date()
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return data.toLocaleDateString('pt-BR', options)
}

document.getElementById('dataAtual').innerHTML = obterData()

api.dbStatus((event, message) => {
    console.log(message)
    if (message === "conectado") {
        document.getElementById('iconeDB').src = "../public/img/dbon.png"
    } else {
        document.getElementById('iconeDB').src = "../public/img/dboff.png"
    }
})
//=============================================================================
// processo de cadastro do cliente //
const foco = document.getElementById('searchCliente')

// Criar um vetor global para extrair os dados do cliente
let arrayClient = []

document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    foco.focus()
})
//=============================================================================
// Captura de dados
let formCli = document.getElementById('formCliente')
let nome = document.getElementById('inputNome')
let sexo = document.getElementById('inputSexo')
let cpf = document.getElementById('inputCpf')
let email = document.getElementById('inputEmail')
let tel = document.getElementById('inputTelefone')
let cep = document.getElementById('inputCep')
let logradouro = document.getElementById('inputLogradouro')
let numero = document.getElementById('inputNumero')
let complemento = document.getElementById('inputComplemento')
let bairro = document.getElementById('inputBairro')
let cidade = document.getElementById('inputCidade')
let uf = document.getElementById('inputUf')
//= CRUD CREATE ===============================================
formCli.addEventListener('submit', async (event) => {
    // evitar comportamento padrão de recarregar a página
    event.preventDefault()
    console.log(
        nome.value,
        sexo.value,
        cpf.value,
        email.value,
        tel.value,
        cep.value,
        logradouro.value,
        numero.value,
        complemento.value,
        bairro.value,
        cidade.value,
        uf.value,
    )
    const newCliente = {
        nomeCli: nome.value,
        sexoCli: sexo.value,
        cpfCli: cpf.value,
        emailCli: email.value,
        telCli: tel.value,
        cepCli: cep.value,
        logradouroCli: logradouro.value,
        numeroCli: numero.value,
        complementoCli: complemento.value,
        bairroCli: bairro.value,
        cidadeCli: cidade.value,
        ufCli: uf.value,
    }
    api.createCliente(newCliente)
})
//==================================================================
//= RESET FORM =====================================================
function resetForm() {
    location.reload()
}
api.resetForm((args) => {
    resetForm()
})
//= FIM RESET FORM =================================================

// Reset CPF =======================================================
function resetCpf() {
    const erroCpf = document.getElementById('inputCpf')
    erroCpf.style.border = "2px solid red";
    erroCpf.value = ""
    erroCpf.focus()
}
api.resetCpf((args) => {
    resetCpf()
})
//==================================================================

//= CRUD CREATE ====================================================
// Setar o nome do cliente para fazer um novo cadastro se a busca retornar que o cliente não esta cadastrado
api.setName((args) => {
    console.log("Teste")
    // Recortar o nome da busca e setar no campo 'nome'
    let busca = document.getElementById('searchCliente').value
    // foco no campo nome
    nome.focus()
    // limpar o campo busca
    foco.value = ""
    // copiar o nome do cliente para o campo nome
    nome.value = busca

})

function searchName() {
    //console.log("Teste do botao buscar")
    // Capturar o nome a ser pesquisado (Passo 1)
    let cliName = document.getElementById('searchCliente').value
    console.log(cliName) // teste passo 1
    // Validação do campo obrigatorio
    // SE o campo de buscar não for preenchido
    if (cliName == "") {
        // Enviar ao main um pedido para alertar o usuario
        // Precisa usar o preload.js
        api.validateSearch()
    } else {
        // Enviar o nome do cliente ao main (Passo 2)
        api.searchName(cliName)
        // Receber os dados do cliente (Passo 5)
        api.renderClient((event, client) => {
            // Teste de recebimento dos dados do cliente
            console.log(client)
            // Passo 6 - renderização dos dados do cliente, preencher os inputs do form
            const clientData = JSON.parse(client)
            arrayClient = clientData
            // uso do ForEach para percorrer o vetor e extrair os dados
            arrayClient.forEach((c) => {
                nome.value = c.nome
                sexo.value = c.sexo
                cpf.value = c.cpf
                email.value = c.email
                tel.value = c.telefone
                cep.value = c.cep
                logradouro.value = c.logradouro
                numero.value = c.numero
                complemento.value = c.complemento
                bairro.value = c.bairro
                cidade.value = c.cidade
                uf.value = c.uf
            })
        })
    }
}
//= FIM CREATE ==================================================================
//===============================================================================

//= CRUD CREATE - Buscar Cpf ====================================================
function buscarCpf() {
    // Capturar o nome a ser pesquisado (Passo 1)
    let cliCpf = document.getElementById('inputCpf').value
    console.log(cliCpf) // teste passo 1
    // Validação do campo obrigatorio
    // SE o campo de buscar não for preenchido
    if (cliCpf == "") {
        // Enviar ao main um pedido para alertar o usuario
        // Precisa usar o preload.js
        api.validateCpf()
    } else {
        // Enviar o nome do cliente ao main (Passo 2)
        api.buscarCpf(cliCpf)
        // Receber os dados do cliente (Passo 5)
        api.renderClient((event, client) => {
            // Teste de recebimento dos dados do cliente
            console.log(client)
            // Passo 6 - renderização dos dados do cliente, preencher os inputs do form
            const clientData = JSON.parse(client)
            arrayClient = clientData
            // uso do ForEach para percorrer o vetor e extrair os dados
            arrayClient.forEach((c) => {
                nome.value = c.nome
                sexo.value = c.sexo
                cpf.value = c.cpf
                email.value = c.email
                tel.value = c.telefone
                cep.value = c.cep
                logradouro.value = c.logradouro
                numero.value = c.numero
                complemento.value = c.complemento
                bairro.value = c.bairro
                cidade.value = c.cidade
                uf.value = c.uf
            })
        })
    }
}
//= FIM CREATE ===============================================================
//============================================================================