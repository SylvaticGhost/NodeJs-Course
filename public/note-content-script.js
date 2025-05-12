document.addEventListener("DOMContentLoaded", function () {
    loadNoteText();
});

document.addEventListener('DOMContentLoaded', function() {
    const deleteBtn = document.getElementById('delete-button');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async function() {
            if (!confirm('Are you sure you want to delete this note?')) return;
            const noteId = window.noteData.id;
            try {
                const res = await fetch(`/api/note/${noteId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                if (res.ok) {
                    window.location.href = '/'; // Redirect to home or notes list
                } else {
                    alert('Failed to delete note');
                }
            } catch (e) {
                alert('Error deleting note');
            }
        });
    }
});

async function loadNoteText() {
    console.log("loading text");
    try {
        const pathParts = window.location.pathname.split("/");
        console.log("Path parts:", pathParts);

        const noteId = pathParts[pathParts.length - 1];
        console.log("Extracted noteId:", noteId);

        if (!noteId) {
            console.error("Could not extract noteId from URL:", window.location.href);
            return;
        }

        const token = localStorage.getItem("token");
        console.log("Token found:", !!token);

        const url = `http://localhost/volume/${noteId}/note.md`;
        console.log(`url=${url}`);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        console.log("fetch response received, status:", response.status);

        if (!response.ok) {
            console.error(`Error fetching note content: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error("Server response:", errorText);
            return;
        }

        console.log("fetched");
        const noteText = await response.text();
        console.info("Note content:", noteText);

        const textarea = document.querySelector('textarea#content[name="content"]');
        if (textarea) {
            textarea.value = noteText;
        } else {
            console.error("Textarea element not found");
        }
    } catch (error) {
        console.error("Error in loadNoteText function:", error);
    }
}
