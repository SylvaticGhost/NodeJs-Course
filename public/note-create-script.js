document.addEventListener("DOMContentLoaded", function () {
    const markdownEditor = document.getElementById("markdown-editor");
    const markdownPreview = document.getElementById("markdown-preview");
    const dropzone = document.getElementById("dropzone");
    const imageUpload = document.getElementById("image-upload");
    const selectImagesButton = document.getElementById("select-images");
    const imagePreview = document.getElementById("image-preview");
    const noteForm = document.getElementById("noteForm");

    let uploadedImages = [];

    // Handle markdown live preview
    markdownEditor.addEventListener("input", updatePreview);

    function updatePreview() {
        const markdown = markdownEditor.value;
        // Basic markdown to HTML conversion
        const html = convertMarkdownToHtml(markdown);
        markdownPreview.innerHTML = html;
    }

    function convertMarkdownToHtml(markdown) {
        // This is a very simple markdown converter
        // For production, you'd use a library like marked.js
        let html = markdown
            // Headers
            .replace(/^### (.*$)/gm, "<h3>$1</h3>")
            .replace(/^## (.*$)/gm, "<h2>$1</h2>")
            .replace(/^# (.*$)/gm, "<h1>$1</h1>")
            // Bold and italic
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            // Lists
            .replace(/^\s*\n\* (.*)/gm, "<ul>\n<li>$1</li>")
            .replace(/^(\* )(.*)/gm, "<li>$2</li>")
            .replace(/^\* (.*)$/gm, "<ul>\n<li>$1</li>\n</ul>")
            // Code blocks
            .replace(/```([^`]+)```/g, "<pre><code>$1</code></pre>")
            .replace(/`([^`]+)`/g, "<code>$1</code>")
            // Images (regular markdown syntax)
            .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
            // Paragraphs
            .replace(/^\s*(\n)?(.+)/gm, function (m) {
                return /\<(\/)?(h|ul|ol|li|blockquote|pre|img)/.test(m) ? m : "<p>" + m + "</p>";
            })
            // Line breaks
            .replace(/\n/g, "<br>");

        return html;
    }

    // Handle drag and drop for images
    dropzone.addEventListener("dragover", function (e) {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", function () {
        dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", function (e) {
        e.preventDefault();
        dropzone.classList.remove("dragover");

        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    });

    // Handle file input change
    imageUpload.addEventListener("change", function () {
        handleFiles(this.files);
    });

    // Handle select images button
    selectImagesButton.addEventListener("click", function () {
        imageUpload.click();
    });

    // Process selected files
    function handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!file.type.match("image.*")) {
                continue; // Skip non-image files
            }

            uploadedImages.push(file);

            // Create image preview
            const reader = new FileReader();

            reader.onload = function (e) {
                const previewContainer = document.createElement("div");
                previewContainer.className = "image-preview-container";

                const img = document.createElement("img");
                img.src = e.target.result;

                const removeBtn = document.createElement("button");
                removeBtn.className = "remove-image";
                removeBtn.textContent = "×";
                removeBtn.dataset.filename = file.name;

                removeBtn.addEventListener("click", function () {
                    // Remove the image from uploadedImages array
                    const filename = this.dataset.filename;
                    uploadedImages = uploadedImages.filter((img) => img.name !== filename);

                    // Remove the preview
                    previewContainer.remove();

                    // Insert markdown image tag at cursor position if needed
                    const imageMarkdown = `![${file.name}](${file.name})`;
                    const regex = new RegExp(imageMarkdown, "g");
                    markdownEditor.value = markdownEditor.value.replace(regex, "");
                    updatePreview();
                });

                previewContainer.appendChild(img);
                previewContainer.appendChild(removeBtn);
                imagePreview.appendChild(previewContainer);

                // Insert markdown image tag at cursor position
                const imageMarkdown = `![${file.name}](${file.name})`;
                const cursorPos = markdownEditor.selectionStart;

                markdownEditor.value =
                    markdownEditor.value.substring(0, cursorPos) +
                    "\n" +
                    imageMarkdown +
                    "\n" +
                    markdownEditor.value.substring(cursorPos);

                updatePreview();
            };

            reader.readAsDataURL(file);
        }
    }

    // Handle form submission
    noteForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const titleInput = document.getElementById("title");
        const title = titleInput.value.trim();
        const content = markdownEditor.value;

        if (!title) {
            alert("Please enter a title for your note");
            return;
        }

        // Create FormData object to send files and data
        const formData = new FormData();
        formData.append("title", title);

        // Create a text file with markdown content
        const noteBlob = new Blob([content], { type: "text/markdown" });
        formData.append("note", noteBlob, "note.md");

        // Add all images
        uploadedImages.forEach((image) => {
            formData.append("images", image);
        });

        try {
            // Get the token from localStorage
            const token = localStorage.getItem("token");

            if (!token) {
                alert("You must be logged in to create a note");
                window.location.href = "/";
                return;
            }

            // Send the request
            const response = await fetch("/api/note", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert("Note created successfully!");
                window.location.href = "/";
            } else {
                alert(`Error: ${result.message || "Failed to create note"}`);
            }
        } catch (error) {
            console.error("Error creating note:", error);
            alert("An error occurred while creating the note");
        }
    });

    // Initialize preview
    updatePreview();
});
