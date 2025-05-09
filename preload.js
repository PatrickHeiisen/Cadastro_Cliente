const { ipcRenderer, contextBridge } = require('electron')

ipcRenderer.send('db-connect')

contextBridge.exposeInMainWorld('api', {
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    aboutExit: () => ipcRenderer.send('about-exit'),
    createCliente: (newCliente) => ipcRenderer.send('create-cliente', newCliente),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
    resetCpf:  (args) => ipcRenderer.on('reset-cpf', args),
    searchName: (cliName) => ipcRenderer.send('search-name', cliName),
    renderClient: (client) => ipcRenderer.on('render-client', client),
    validateSearch: () => ipcRenderer.send('validate-search'),
    setName: (args) => ipcRenderer.on('set-name', args),
    buscarCpf: (cliCpf) => ipcRenderer.send('search-cpf', cliCpf),
    setCpf: (args) => ipcRenderer.on('set-cpf', args),
    deleteCli: (id) => ipcRenderer.send('delete-cli', id),
    limparForm: (callback) => ipcRenderer.on('limpar-form', callback),
    updateClient: (client) => ipcRenderer.send('update-client', client)
})
