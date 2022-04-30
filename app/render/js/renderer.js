const dragDrop = require("drag-drop");
const { ipcRenderer } = require("electron");

// local dependencies
const dom = require("./dom");

/*****************************/

// get list of files from the `main` process
ipcRenderer.invoke("app:get-files").then((files = []) => {
  dom.displayFiles(files);
});

// handle file delete event
ipcRenderer.on("app:delete-file", (event, filename) => {
  document.getElementById(filename).remove();
});

/*****************************/

// add files drop listener
dragDrop("#uploader", (files) => {
  const _files = files.map((file) => {
    return {
      name: file.name,
      path: file.path,
    };
  });

  // send file(s) add event to the `main` process
  ipcRenderer.invoke("app:on-file-add", _files).then(() => {
    ipcRenderer.invoke("app:get-files").then((files = []) => {
      dom.displayFiles(files);
    });
  });
});

// open filesystem dialog
window.openDialog = () => {
  ipcRenderer.invoke("app:on-fs-dialog-open").then(() => {
    ipcRenderer.invoke("app:get-files").then((files = []) => {
      dom.displayFiles(files);
    });
  });
};
// open filesystem dialog
window.test = () => {
  ipcRenderer.invoke("app:test").then((dest) => dom.displayDestination(dest));
};
window.addDest = () => {
  let filesdest = document.getElementById("loco").innerHTML;
  ipcRenderer.invoke("app:get-files").then((testando = []) => {
    ipcRenderer
      .invoke("app:custom-dest", testando, filesdest)
      .then(() => console.log("done"));
  });
};
