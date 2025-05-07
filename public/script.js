const API_URL = "http://localhost:3000";

// Перевірка токену для index.html
document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname;
    if (currentPath === "/" || currentPath === "/index.html") {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/auth.html";
            return;
        }
        const username = localStorage.getItem("username");
        if (username) {
            const userProfile = document.getElementById("userProfile");
            if (userProfile) userProfile.textContent = username;
        } else {
            const userProfile = document.getElementById("userProfile");
            if (userProfile) userProfile.textContent = "Користувач";
        }
    }

    // Приховуємо noteEditor на auth.html
    const noteEditor = document.getElementById("noteEditor");
    if (noteEditor) noteEditor.style.display = "none";

    // Завантажуємо нотатки, якщо є username
    const username = localStorage.getItem("username");
    if (username && currentPath === "/index.html") {
        const notes = getNoteLists();
        let list = document.getElementById("noteList");

        if (!list) {
            console.log("Could not find notesList element");
            return;
        }

        const div = document.createElement("div");
        notes.then((result) => {
            result.forEach((note) => {
                console.log(note);
                const noteElement = document.createElement("div");
                noteElement.classList.add("note-preview");
                noteElement.innerHTML = `
                        <div>${note.title}</div> `;
                noteElement.addEventListener(
                    "click",
                    (e) => (window.location.href = "/note/" + note.id)
                );
                div.appendChild(noteElement);
            });
            list.append(div);
        });
    }
});

// Єдина функція logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/auth.html";
}

// Перемикання форм
function showForm(formType) {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const loginTab = document.querySelector(".tabs .tab:nth-child(1)");
    const signupTab = document.querySelector(".tabs .tab:nth-child(2)");

    if (formType === "login") {
        if (loginForm) loginForm.classList.add("active");
        if (signupForm) signupForm.classList.remove("active");
        if (loginTab) loginTab.classList.add("active");
        if (signupTab) signupTab.classList.remove("active");
    } else {
        if (signupForm) signupForm.classList.add("active");
        if (loginForm) loginForm.classList.remove("active");
        if (signupTab) signupTab.classList.add("active");
        if (loginTab) loginTab.classList.remove("active");
    }
}

// Валідація введення
function validateInput(username, password) {
    const minLength = 3;
    const maxLength = 20;
    return (
        username.length >= minLength &&
        username.length <= maxLength &&
        password.length >= minLength &&
        password.length <= maxLength
    );
}

// Відправка запитів
async function sendRequest(path, data, token = null) {
    try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const response = await fetch(API_URL + path, {
            method: data ? "POST" : "GET",
            headers,
            body: data ? JSON.stringify(data) : null,
        });
        return await response.json();
    } catch (error) {
        console.log("Error:", error);
        return { code: 500, message: "Server connection error" };
    }
}

// Отримання імені користувача
async function getWhoAmI(token) {
    const result = await sendRequest("/api/who-am-i", null, token);
    if (result.username) return result.username;
    throw new Error(result.message || "Помилка отримання імені користувача");
}

// Логін
async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const errorElement = document.getElementById("login-error");

    if (!validateInput(username, password)) {
        if (errorElement) {
            errorElement.textContent = "Логін і пароль мають бути від 3 до 20 символів!";
            errorElement.style.display = "block";
        }
        return;
    }

    const result = await sendRequest("/api/login", { username, password });
    if (result.code === 200) {
        const token = result.value.token;
        localStorage.setItem("token", token);
        try {
            const fetchedUsername = await getWhoAmI(token);
            localStorage.setItem("username", fetchedUsername);
            window.location.href = "/index.html";
        } catch (error) {
            if (errorElement) {
                errorElement.textContent = error.message || "Помилка отримання даних користувача";
                errorElement.style.display = "block";
            }
        }
    } else {
        if (errorElement) {
            errorElement.textContent = result.message || "Помилка входу";
            errorElement.style.display = "block";
        }
    }
}

// Реєстрація
async function signUp() {
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    const errorElement = document.getElementById("signup-error");

    if (!validateInput(username, password)) {
        if (errorElement) {
            errorElement.textContent = "Логін і пароль мають бути від 3 до 20 символів!";
            errorElement.style.display = "block";
        }
        return;
    }

    const registerResult = await sendRequest("/api/register", {
        username,
        password,
    });
    if (registerResult.code === 201) {
        //TODO: @layron11 to reuse login func
        const loginResult = await sendRequest("/api/login", { username, password });
        if (loginResult.code === 200) {
            const token = loginResult.value.token;
            localStorage.setItem("token", token);
            try {
                const fetchedUsername = await getWhoAmI(token);
                localStorage.setItem("username", fetchedUsername);
                window.location.href = "/index.html";
            } catch (error) {
                if (errorElement) {
                    errorElement.textContent =
                        error.message || "Помилка отримання даних користувача";
                    errorElement.style.display = "block";
                }
            }
        } else {
            if (errorElement) {
                errorElement.textContent = loginResult.message || "Помилка автоматичного входу";
                errorElement.style.display = "block";
            }
        }
    } else {
        if (errorElement) {
            errorElement.textContent = registerResult.message || "Помилка реєстрації";
            errorElement.style.display = "block";
        }
    }
}

async function getNoteLists() {
    const token = localStorage.getItem("token");
    if (!token) return;
    const result = await sendRequest("/api/note/user", null, token);
    console.log(result);
    return result.value;
}

// Логіка нотаток
function createNote() {
    const notesPage = document.getElementById("notesPage");
    if (notesPage) notesPage.style.display = "none";
    const noteEditor = document.getElementById("noteEditor");
    if (noteEditor) noteEditor.style.display = "block";
}

function saveNote() {
    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;
    const date = new Date().toLocaleString();
    if (title.trim() === "" || content.trim() === "") return;
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push({ title, content, date });
    localStorage.setItem("notes", JSON.stringify(notes));
    const noteEditor = document.getElementById("noteEditor");
    if (noteEditor) noteEditor.style.display = "none";
    const notesPage = document.getElementById("notesPage");
    if (notesPage) notesPage.style.display = "block";
    loadNotes();
}

function loadNotes() {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let notesList = document.getElementById("notesList");
    if (notesList) {
        notesList.innerHTML = "";
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
}

function deleteNote(index) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    loadNotes();
}

function shareNote() {
    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;
    if (navigator.share) {
        navigator
            .share({
                title: title,
                text: content,
            })
            .catch((error) => console.log("Помилка при шарінгу:", error));
    } else {
        alert("Ваш браузер не підтримує спільний доступ до нотаток.");
    }
}
