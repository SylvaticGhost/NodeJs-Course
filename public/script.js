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

        // Initialize filter slider
        initFilterControls();

        // Load notes with current filters
        loadNoteListWithPagination(1); // Start with page 1
    }

    // Приховуємо noteEditor на auth.html
    const noteEditor = document.getElementById("noteEditor");
    if (noteEditor) noteEditor.style.display = "none";

    // Завантажуємо нотатки, якщо є username
    const username = localStorage.getItem("username");
    if (username && currentPath === "/index.html") {
        loadNoteListWithPagination(1); // Start with page 1
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
        localStorage.setItem("loggetAt", Date.now());
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

async function searchNotes(options = {}) {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Default parameters
    const searchParams = {
        page: options.page || 1,
        pageSize: options.pageSize || 5,
        filter: options.filter || "created",
        order: options.order || "asc",
        text: options.text || "",
    };

    try {
        const result = await fetch(`${API_URL}/api/note/search`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(searchParams),
        });

        const data = await result.json();
        console.log("Search response:", data);

        if (data.code === 200) {
            return { notes: data.value.notes, pagination: data.value.pagination};
        } else {
            console.error("Error searching notes:", data.message);
            return { notes: [], pagination: { total: 0, page: 1, pages: 0 } };
        }
    } catch (error) {
        console.error("Error searching notes:", error);
        return { notes: [], pagination: { total: 0, page: 1, pages: 0 } };
    }
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

// Add function to copy URL to clipboard
function copyToClipboard(text) {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            // Show a brief notification
            const notification = document.createElement("div");
            notification.textContent = "Посилання скопійовано!";
            notification.classList.add("copy-notification");
            document.body.appendChild(notification);

            // Remove the notification after a short delay
            setTimeout(() => {
                notification.classList.add("fade-out");
                setTimeout(() => document.body.removeChild(notification), 500);
            }, 1500);
        })
        .catch((err) => {
            console.error("Помилка копіювання: ", err);
        });
}

function initFilterControls() {
    const filterOptions = document.querySelectorAll(".filter-option");
    const orderSwitch = document.getElementById("orderSwitch");
    const searchInput = document.getElementById("searchNotes");
    const searchButton = document.getElementById("searchButton");
    let selectedFilter = localStorage.getItem("selectedFilter") || "createdAt";
    let currentOrder = localStorage.getItem("currentOrder") || "asc";

    filterOptions.forEach((option) => {
        if (option.dataset.filter === selectedFilter) {
            option.classList.add("active");
        } else {
            option.classList.remove("active");
        }

        option.addEventListener("click", () => {
            filterOptions.forEach((opt) => opt.classList.remove("active"));
            option.classList.add("active");
            selectedFilter = option.dataset.filter;
            localStorage.setItem("selectedFilter", selectedFilter);
            loadNoteListWithPagination(1);
        });
    });

    orderSwitch.textContent = `Порядок: ${currentOrder === "asc" ? "⬆️" : "⬇️"}`;

    // Order switch button event
    orderSwitch.addEventListener("click", () => {
        currentOrder = currentOrder === "asc" ? "desc" : "asc";
        orderSwitch.textContent = `Порядок: ${currentOrder === "asc" ? "⬆️" : "⬇️"}`;
        localStorage.setItem("currentOrder", currentOrder);

        loadNoteListWithPagination(1);
    });

    // Handle search input and button
    if (searchButton) {
        searchButton.addEventListener("click", () => {
            loadNoteListWithPagination(1); // Search with page 1
        });
    }

    if (searchInput) {
        // Trigger search on Enter key
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                loadNoteListWithPagination(1);
            }
        });
    }
}

// Updated function to load notes with pagination and filtering using the search endpoint
async function loadNoteListWithPagination(page, pageSize = 5) {
    const list = document.getElementById("noteList");
    const paginationContainer = document.getElementById("paginationContainer");

    if (!list) {
        console.error("Could not find notesList element");
        return;
    }

    list.innerHTML = '<div class="loading">Завантаження нотаток...</div>';

    try {
        const activeFilterOption = document.querySelector(".filter-option.active");
        const uiFilter = activeFilterOption ? activeFilterOption.dataset.filter : "createdAt";
        const currentOrder = localStorage.getItem("currentOrder") || "asc";
        const searchText = document.getElementById("searchNotes")?.value || "";

        const filterMapping = {
            createdAt: "created",
            updatedAt: "updated",
            interactedAt: "viewed",
        };

        const searchParams = {
            page: page,
            pageSize: pageSize,
            filter: filterMapping[uiFilter] || "created",
            order: currentOrder,
            text: searchText,
        };

        const result = await searchNotes(searchParams);
        const notes = result.notes || [];
        if (!result || !notes || notes.length === 0) {
            list.innerHTML = '<div class="no-notes">У вас поки немає нотаток.</div>';
            if (paginationContainer) paginationContainer.style.display = "none";
            return;
        }

        list.innerHTML = "";

        const div = document.createElement("div");
        notes.forEach((note) => {
            const noteElement = document.createElement("div");
            noteElement.classList.add("note-preview");
            noteElement.innerHTML = `
                <div>${note.title}</div>
                <button class="share-note-btn" title="Скопіювати посилання">📋</button>`;

            const noteUrl = "/note/" + note.id;

            noteElement.addEventListener("click", (e) => {
                if (e.target.classList.contains("share-note-btn")) {
                    e.stopPropagation();
                    copyToClipboard(window.location.origin + noteUrl);
                    return;
                }
                window.location.href = noteUrl;
            });

            div.appendChild(noteElement);
        });
        list.appendChild(div);

        if (paginationContainer) {
            updatePaginationControls(
                paginationContainer,
                result.pagination.page,
                result.pagination.pages
            );
        }
    } catch (error) {
        console.error("Error loading notes:", error);
        list.innerHTML = '<div class="error-message">Помилка завантаження нотаток</div>';
    }
}

// Function to update pagination controls with server pagination data
function updatePaginationControls(container, currentPage, totalPages) {
    container.innerHTML = "";
    container.style.display = totalPages > 1 ? "flex" : "none";

    // Previous button
    const prevButton = document.createElement("button");
    prevButton.classList.add("pagination-btn");
    prevButton.textContent = "←";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        loadNoteListWithPagination(currentPage - 1);
    });
    container.appendChild(prevButton);

    // Page indicator
    const pageIndicator = document.createElement("span");
    pageIndicator.classList.add("page-indicator");
    pageIndicator.textContent = `${currentPage} / ${totalPages}`;
    container.appendChild(pageIndicator);

    // Next button
    const nextButton = document.createElement("button");
    nextButton.classList.add("pagination-btn");
    nextButton.textContent = "→";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        loadNoteListWithPagination(currentPage + 1);
    });
    container.appendChild(nextButton);
}
