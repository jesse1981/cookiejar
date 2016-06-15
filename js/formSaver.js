/*
 * Form Saver Module
 * For retaining FORM data even when offline.
 *
 * Resources:
 * http://www.html5rocks.com/en/tutorials/indexeddb/todo/ - Simple Tutorial
 * http://robnyman.github.io/html5demos/indexeddb/ - Example on storing/loading images/blobs
 * https://developer.mozilla.org/en/docs/IndexedDB - Overview by MDN
 */

var testUrl = "http://www.google.com.au/";
var version = 1;
var formSaver = {};
window.indexedDB = window.indexedDB || window.webkitIndexedDB ||
window.mozIndexedDB;

if ('webkitIndexedDB' in window) {
    window.IDBTransaction = window.webkitIDBTransaction;
    window.IDBKeyRange = window.webkitIDBKeyRange;
}

formSaver.indexedDB = {};
formSaver.indexedDB.db = null;

formSaver.indexedDB.onerror = function(e) {
    console.log(e);
};

formSaver.indexedDB.open = function(formObj) {
    var table = $(formObj).attr("name");
    var request = indexedDB.open(table, version);

    // We can only create Object stores in a versionchange transaction.
    request.onupgradeneeded = function(e) {
        var db = e.target.result;

        // A versionchange transaction is started automatically.
        e.target.transaction.onerror = formSaver.indexedDB.onerror;

        if(db.objectStoreNames.contains(table)) {
            db.deleteObjectStore(table);
        }

        var store = db.createObjectStore(table,
        {keyPath: "timeStamp"});
    };

    request.onsuccess = function(e) {
        formSaver.indexedDB.db = e.target.result;
        formSaver.indexedDB.getAllItems();
    };

    request.onerror = formSaver.indexedDB.onerror;
};

formSaver.indexedDB.storeForm = function(formObj) {
    var db = formSaver.indexedDB.db;
    var table = $(formObj).attr("name");
    var trans = db.transaction([table], "readwrite");
    var store = trans.objectStore(table);

    data = {};
    formData = $(formObj).serialize();
    formData = formData.split('&');
    for (var i in formData) {
        data[formData[i].split('=')[0]] = formData[i].split('=')[1];
    }
    data.timeStamp = new Date();

    var request = store.put(data);

    request.onsuccess = function(e) {
        formSaver.indexedDB.getAllItems();
    };

    request.onerror = function(e) {
        console.log("Error Adding: ", e);
    };
};

formSaver.indexedDB.deleteForm = function(formObj,id) {
    var db = formSaver.indexedDB.db;
    var table = $(formObj).attr("name");
    var trans = db.transaction([table], "readwrite");
    var store = trans.objectStore(table);

    var request = store.delete(id);

    request.onsuccess = function(e) {
        formSaver.indexedDB.getAllTodoItems();
    };

    request.onerror = function(e) {
        console.log("Error Adding: ", e);
    };
};

formSaver.indexedDB.getAllItems = function(formObj) {
    var db = formSaver.indexedDB.db;
    var table = $(formObj).attr("name");
    var trans = db.transaction([table], "readwrite");
    var store = trans.objectStore(table);

    // Get everything in the store;
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);

    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if(!!result == false) return;

        //renderTodo(result.value);
        result.continue();
    };

    cursorRequest.onerror = formSaver.indexedDB.onerror;
};
/*
function renderTodo(row) {
    var todos = document.getElementById("todoItems");
    var li = document.createElement("li");
    var a = document.createElement("a");
    var t = document.createTextNode(row.text);

    a.addEventListener("click", function() {
        formSaver.indexedDB.deleteTodo(row.timeStamp);
    }, false);

    a.href = "#";
    a.textContent = " [Delete]";
    li.appendChild(t);
    li.appendChild(a);
    todos.appendChild(li);
}

function addTodo() {
    var todo = document.getElementById("todo");
    formSaver.indexedDB.addTodo(todo.value);
    todo.value = "";
}
*/
function init() {
    formSaver.indexedDB.open();
}

window.addEventListener("DOMContentLoaded", init, false);

$(document).ready(function() {
    $('input[type="submit"]').click(function(e){
        e.preventDefault();
        if (!testConnect()) {
            // Submit to indexedDB
        }
    });
});

function testConnect() {
    $.ajax({
        url: testUrl,
        async: false
    })  .done(function(){return true;})
        .fail(function(){return false;});
}