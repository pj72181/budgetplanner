// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { jsPDF } from "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// User Signup
if (document.getElementById("signup-btn")) {
    document.getElementById("signup-btn").addEventListener("click", async () => {
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Signup successful!");
        } catch (error) {
            alert("Error: " + error.message);
        }
    });
}

// User Login
if (document.getElementById("login-btn")) {
    document.getElementById("login-btn").addEventListener("click", async () => {
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login successful!");
            window.location.href = "home.html";
        } catch (error) {
            alert("Error: " + error.message);
        }
    });
}

// User Logout
if (document.getElementById("logout-btn")) {
    document.getElementById("logout-btn").addEventListener("click", async () => {
        try {
            await signOut(auth);
            alert("Logged out successfully!");
            window.location.href = "index.html";
        } catch (error) {
            alert("Error: " + error.message);
        }
    });
}

// Add Transaction
if (document.getElementById("add-transaction-btn")) {
    document.getElementById("add-transaction-btn").addEventListener("click", async () => {
        const desc = document.getElementById("desc").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const category = document.getElementById("category").value;

        if (!desc || isNaN(amount)) return alert("Please enter valid details.");

        try {
            await addDoc(collection(db, "transactions"), {
                description: desc,
                amount: amount,
                category: category,
                timestamp: new Date().toISOString()
            });
            alert("Transaction Added!");
            loadTransactions();
        } catch (error) {
            alert("Error adding transaction: " + error.message);
        }
    });
}

// Load Transactions
async function loadTransactions(filter = "all") {
    const transactionList = document.getElementById("transaction-list");
    if (!transactionList) return;
    
    let q = collection(db, "transactions");
    if (filter !== "all") {
        q = query(q, where("category", "==", filter));
    }
    
    const querySnapshot = await getDocs(q);
    transactionList.innerHTML = "";

    querySnapshot.forEach(doc => {
        const li = document.createElement("li");
        li.innerHTML = `${doc.data().description} - $${doc.data().amount} <button onclick='deleteTransaction("${doc.id}")'>❌</button>`;
        transactionList.appendChild(li);
    });
}

// Delete Transaction
async function deleteTransaction(id) {
    try {
        await deleteDoc(doc(db, "transactions", id));
        alert("Transaction Deleted!");
        loadTransactions();
    } catch (error) {
        alert("Error deleting transaction: " + error.message);
    }
}

// Apply Filter
if (document.getElementById("apply-filter")) {
    document.getElementById("apply-filter").addEventListener("click", () => {
        const filterCategory = document.getElementById("filter-category").value;
        loadTransactions(filterCategory);
    });
}

// Download Report
if (document.getElementById("download-report")) {
    document.getElementById("download-report").addEventListener("click", async () => {
        const doc = new jsPDF();
        doc.text("Budget Report", 10, 10);
        let y = 20;
        const querySnapshot = await getDocs(collection(db, "transactions"));
        querySnapshot.forEach(docSnap => {
            doc.text(`${docSnap.data().description}: $${docSnap.data().amount} (${docSnap.data().category})`, 10, y);
            y += 10;
        });
        doc.save("budget_report.pdf");
    });
}

// Load transactions on page load
loadTransactions();
