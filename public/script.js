
function signUp() {
    const username = document.getElementById("username").value;
    if (username.trim() === "") return;
    localStorage.setItem("username", username);
    document.getElementById("userProfile").innerText = username;
    document.getElementById("authPage").style.display = "none";
    document.getElementById("notesPage").style.display = "block";
    document.querySelector(".header").style.display = "flex"; 
}

function createNote() {
    document.getElementById("notesPage").style.display = "none";
    document.getElementById("noteEditor").style.display = "block";
}

function saveNote() {
    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;
    const date = new Date().toLocaleString();
    if (title.trim() === "" || content.trim() === "") return;
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push({ title, content, date });
    localStorage.setItem("notes", JSON.stringify(notes));
    document.getElementById("noteEditor").style.display = "none";
    document.getElementById("notesPage").style.display = "block";
    loadNotes();
}

function logout() {
    localStorage.removeItem("username");
    document.getElementById("authPage").style.display = "block";
    document.getElementById("notesPage").style.display = "none";
    document.querySelector(".header").style.display = "none";

}

document.addEventListener("DOMContentLoaded", function() {
    let username = localStorage.getItem("username");
    if (username) {
        document.getElementById("userProfile").innerText = username;
        document.getElementById("authPage").style.display = "none";
        document.getElementById("notesPage").style.display = "block";
        document.querySelector(".header").style.display = "flex";
        loadNotes();
    }
});
function loadNotes() {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let notesList = document.getElementById("notesList");
    notesList.innerHTML = ""; // Очищаємо список перед оновленням

    notes.forEach((note, index) => {
    let noteElement = document.createElement("div");
    noteElement.classList.add("note");

    noteElement.innerHTML = `
        <button class="delete-btn" onclick="deleteNote(${index})">×</button>
        <div class="note-title">${note.title}</div>
        <div class="note-content">${note.content}</div>
        <div class="note-date">${note.date}</div>
    `;

    notesList.appendChild(noteElement);
    });
}
function deleteNote(index) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    loadNotes();
    }
    function shareNote(title, content) {
    if (navigator.share) {
    navigator.share({
        title: title,
        text: content,
    }).catch(error => console.log("Помилка при шарінгу:", error));
    } else {
    alert("Ваш браузер не підтримує спільний доступ до нотаток.");
    }
}

function showForm(formType) {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const loginTab = document.querySelector(".tabs .tab:nth-child(1)");
    const signupTab = document.querySelector(".tabs .tab:nth-child(2)");

    if (formType === "login") {
        loginForm.classList.add("active");
        signupForm.classList.remove("active");
        loginTab.classList.add("active");
        signupTab.classList.remove("active");
    } else {
        signupForm.classList.add("active");
        loginForm.classList.remove("active");
        signupTab.classList.add("active");
        loginTab.classList.remove("active");
    }
}

function validateInput(username, password) {
    const minLength = 3;
    const maxLength = 20;
    return username.length >= minLength && username.length <= maxLength &&
           password.length >= minLength && password.length <= maxLength;
}

async function sendRequest(url, data, token = null) {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        const response = await fetch(url, {
            method: data ? "POST" : "GET", // POST для login/register, GET для who-am-i
            headers,
            body: data ? JSON.stringify(data) : null,
        });
        return await response.json();
    } catch (error) {
        return { code: 500, message: "Server connection error" };
    }
}

async function getWhoAmI(token) {
    const result = await sendRequest("http://localhost:3000/api/who-am-i", null, token);
    if (result.username) {
        return result.username;
    } else {
        throw new Error(result.message || "Помилка отримання імені користувача");
    }
}

async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const errorElement = document.getElementById("login-error");

    if (!validateInput(username, password)) {
        errorElement.textContent = "Логін і пароль мають бути від 3 до 20 символів!";
        errorElement.style.display = "block";
        return;
    }

    const result = await sendRequest("http://localhost:3000/api/login", {
        username,
        password,
    });

    if (result.code === 200) {
        const token = result.value.token;
        localStorage.setItem("token", token);

        try {
            const fetchedUsername = await getWhoAmI(token);
            localStorage.setItem("username", fetchedUsername);
            window.location.href = "index.html";
        } catch (error) {
            errorElement.textContent = error.message || "Помилка отримання даних користувача";
            errorElement.style.display = "block";
        }
    } else {
        errorElement.textContent = result.message || "Помилка входу";
        errorElement.style.display = "block";
    }
}

async function signUp() {
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    const errorElement = document.getElementById("signup-error");

    if (!validateInput(username, password)) {
        errorElement.textContent = "Логін і пароль мають бути від 3 до 20 символів!";
        errorElement.style.display = "block";
        return;
    }

    const registerResult = await sendRequest("http://localhost:3000/api/register", {
        username,
        password,
    });

    if (registerResult.code === 201) {
        const loginResult = await sendRequest("http://localhost:3000/api/login", {
            username,
            password,
        });

        if (loginResult.code === 200) {
            const token = loginResult.value.token;
            localStorage.setItem("token", token);

            try {
                const fetchedUsername = await getWhoAmI(token);
                localStorage.setItem("username", fetchedUsername);
                window.location.href = "index.html";
            } catch (error) {
                errorElement.textContent = error.message || "Помилка отримання даних користувача";
                errorElement.style.display = "block";
            }
        } else {
            errorElement.textContent = loginResult.message || "Помилка автоматичного входу";
            errorElement.style.display = "block";
        }
    } else {
        errorElement.textContent = registerResult.message || "Помилка реєстрації";
        errorElement.style.display = "block";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "auth.html"; 
        return;
    }
    const username = localStorage.getItem("username");
    if (username) {
        document.getElementById("userProfile").textContent = username;
    } else {
        document.getElementById("userProfile").textContent = "Користувач";
    }
});

function logout() {
    localStorage.removeItem("token"); 
    localStorage.removeItem("username"); 
    window.location.href = "auth.html"; 
}
