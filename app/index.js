const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

// local dependencies
const io = require("./main/io");

// open a window
const openWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // load `index.html` file
  win.loadFile(path.resolve(__dirname, "render/html/index.html"));

  /*-----*/

  return win; // return window
};

// when app is ready, open a window
app.on("ready", () => {
  const win = openWindow();

  // watch files
  io.watchFiles(win);
});

// when all windows are closed, quit the app
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// when app activates, open a window
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    openWindow();
  }
});

/************************/

// return list of files
ipcMain.handle("app:get-files", () => {
  return io.getFiles();
});

// listen to file(s) add event
ipcMain.handle("app:on-file-add", (event, files = []) => {
  io.addFiles(files);
});

// add file to custom destination
ipcMain.handle("app:custom-dest", (event, files = [], location) => {
  return io.addFilesToDestination(files, location);
});

// open filesystem dialog to choose files
ipcMain.handle("app:on-fs-dialog-open", (event) => {
  const files = dialog.showOpenDialogSync({
    properties: ["openFile", "multiSelections"],
  });

  io.addFiles(
    files.map((filepath) => {
      return {
        name: path.parse(filepath).base,
        path: filepath,
      };
    })
  );
});

// open filesystem dialog to choose files
ipcMain.handle("app:test", (event) => {
  const folder = dialog.showOpenDialogSync({
    properties: ["openDirectory"],
  });
  //   console.log(folder[0]);
  return io.getdestination(folder[0]);
});

/*-----*/

// listen to file delete event
ipcMain.on("app:on-file-delete", (event, file) => {
  io.deleteFile(file.filepath);
});

// listen to file open event
ipcMain.on("app:on-file-open", (event, file) => {
  io.openFile(file.filepath);
});

// listen to file copy event
ipcMain.on("app:on-file-copy", (event, file) => {
  event.sender.startDrag({
    file: file.filepath,
    icon: path.resolve(__dirname, "./resources/paper.png"),
  });
});
