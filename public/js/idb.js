let db;

const request = indexedDB.open('budget', 1);


request.onupgradeneeded = function(event) {
     
    const db = event.target.result;
     
    db.createObjectStore('new_item', { autoIncrement: true });
};

request.onsuccess = function(event) {
    
    db = event.target.result;
  
    
    if (navigator.onLine) {
      
      uploadItem();
    }
};
  
request.onerror = function(event) {
    
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_item'], 'readwrite');

    const itemObjectStore = transaction.objectStore('new_item');

    itemObjectStore.add(record);
}

function uploadItem() {
    // open a transaction on your db
    const transaction = db.transaction(['new_item'], 'readwrite');
  
    // access your object store
    const itemObjectStore = transaction.objectStore('new_item');
  
    // get all records from store and set to a variable
    const getAll = itemObjectStore.getAll();
  
    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
        fetch('/api/transaction', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }
            // open one more transaction
            const transaction = db.transaction(['new_item'], 'readwrite');
            // access the new_pizza object store
            const itemObjectStore = transaction.objectStore('new_item');
            // clear all items in your store
            itemObjectStore.clear();

            alert('All saved transactions have been submitted!');
            })
            .catch(err => {
            console.log(err);
            });
        }
    };
};

window.addEventListener('online', uploadItem);