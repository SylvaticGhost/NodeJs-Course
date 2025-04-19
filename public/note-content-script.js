document.addEventListener("DOMContentLoaded", function () {
    loadNoteText();
});

async function loadNoteText() {
    console.log("loading text"); // <<< Should print
    try {
        // --- DEFINE pathParts HERE ---
        const pathParts = window.location.pathname.split("/");
        console.log("Path parts:", pathParts); // <<< Add logging

        const noteId = pathParts[pathParts.length - 1];
        console.log("Extracted noteId:", noteId); // <<< Should print if pathParts is valid

        if (!noteId) {
            console.error("Could not extract noteId from URL:", window.location.href);
            return;
        }

        const token = localStorage.getItem("token");
        console.log("Token found:", !!token); // <<< Add logging

        const url = `http://localhost/volume/${noteId}/note.md`;
        console.log(`url=${url}`);

        // --- Fetch call ---
        const response = await fetch(url, {
            method: "GET",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        // --- This part should now be reached if fetch initiates ---
        console.log("fetch response received, status:", response.status);

        if (!response.ok) {
            console.error(`Error fetching note content: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error("Server response:", errorText);
            return;
        }

        console.log("fetched"); // <<< Should print if response.ok
        const noteText = await response.text();
        console.info("Note content:", noteText);

        const textarea = document.querySelector('textarea[name="content"]');
        if (textarea) {
            textarea.value = noteText;
        } else {
            console.error("Textarea element not found");
        }
    } catch (error) {
        // --- Catch block ---
        console.error("Error in loadNoteText function:", error); // <<< Check browser console for this!
    }
}
