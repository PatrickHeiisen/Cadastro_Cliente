const { ipcRenderer, contextBridge } = require('electron')

ipcRenderer.send('db-connect')

contextBridge.exposeInMainWorld('api', {
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    aboutExit: () => ipcRenderer.send('about-exit'),
    createCliente: (newCliente) => ipcRenderer.send('create-cliente', newCliente),
    resetForm: (args) => ipcRenderer.on('reset-form', args)
})
