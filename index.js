const path = require('path')
const { app, BrowserWindow } = require('electron')
const isProduction = process.env.NODE_ENV === 'production'
let mainWindow
let forceQuit = false

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
}

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', async () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 640,
    minHeight: 480,
    show: false
  })

  if (!isProduction) {
    await installExtensions()
    const chokidar = require('chokidar')
    chokidar.watch('./index.js').on('change',
      () => {
        app.relaunch()
        app.exit()
      })
    mainWindow.loadURL('http://localhost:4567')
  } else {
    mainWindow.loadFile(path.resolve(path.join(__dirname, './dist/index.html')))
  }

  // show window once on first load
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.show()
  })

  mainWindow.webContents.on('did-finish-load', () => {
    // Handle window logic properly on macOS:
    // 1. App should not terminate if window has been closed
    // 2. Click on icon in dock should re-open the window
    // 3. ⌘+Q should close the window and quit the app
    if (process.platform === 'darwin') {
      mainWindow.on('close', function (e) {
        if (!forceQuit) {
          e.preventDefault()
          mainWindow.hide()
        }
      })

      app.on('activate', () => {
        mainWindow.show()
      })

      app.on('before-quit', () => {
        forceQuit = true
      })
    } else {
      mainWindow.on('closed', () => {
        mainWindow = null
      })
    }
  })
})