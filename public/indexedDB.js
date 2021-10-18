let database;
// Adding the call constant to 
const call = indexeddatabase.open("budget", 1);

call.onupgradeneeded = (e) => {
  const database = e.target.result;
  database.createObjectStore("transaction", { autoIncrement: true });
};

call.onsuccess = (e) => {
  database = e.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

function checkDatabase() {
  const transaction = database.transaction(["transaction"], "readwrite");
  // access your transaction object
  const store = transaction.objectStore("transaction");
  const getAll = store.getAll();

  // If the call was successful
  getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // If our returned response is not empty
          if (res.length !== 0) {
            // Open another transaction to transaction with the ability to read and write
            transaction = database.transaction(['transaction'], 'readwrite');

            // Assign the current store to a variable
            const currentStore = transaction.objectStore('transaction');

            // Clear existing entries because our bulk add was successful
            currentStore.clear();
            console.log('Clearing store 🧹');
          }
        });
    }
  };
}

const saveRecord = (record) => {
    // Open a transaction on your transaction database
      const transaction = database.transaction(["transaction"], "readwrite");
    
      const store = transaction.objectStore("transaction");
    
      store.add(record);
    };
// Listen for app coming back online
window.addEventListener("online", checkDatabase);