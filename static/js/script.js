document.addEventListener("DOMContentLoaded", () => {
    const colorOptions = document.querySelectorAll('.color-option');
    const tshirtImage = document.getElementById('tshirt');
    const regenerateBtn = document.getElementById("regenerate");
    const confirmBtn = document.getElementById("confirm");
    const downloadBtn = document.getElementById("download");
    const designContainer = document.querySelector('.design-container');
    const spinner = document.getElementById("spinner");
    const sizeSelector = document.getElementById("size");
    const promptInput = document.getElementById("prompt");
    const placeholderText = document.getElementById("placeholder-text");

    let selectedColor = "white"; // Default T-shirt color

    const uploadInput = document.getElementById("upload-design");

uploadInput.addEventListener("change", async () => {
    const file = uploadInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("color", selectedColor);

    spinner.style.display = "block";
    designContainer.style.backgroundImage = "";
    placeholderText.style.display = "block";

    const response = await fetch('/upload', {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    if (data.success) {
        designContainer.style.backgroundImage = `url(${data.image_url}?t=${Date.now()})`;
        placeholderText.style.display = "none";
        designContainer.style.display = "block";
    } else {
        alert("Upload failed: " + data.error);
    }

    spinner.style.display = "none";
});


    // Initialize the UI
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.style.opacity = 0.5;
    }

    // Handle color selection and highlight active color
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(o => o.classList.remove("active")); // Remove from others
            option.classList.add("active"); // Highlight selected

            selectedColor = option.dataset.color;
            tshirtImage.src = `/static/images/tshirt_${selectedColor}.png`;
        });
    });

    // Trigger generate on Enter
    promptInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            regenerateBtn.click();
        }
    });

    // Handle Generate Design
    regenerateBtn.addEventListener("click", () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert("Please enter a design idea!");
            return;
        }

        // Show spinner and reset preview
        spinner.style.display = "block";
        designContainer.style.backgroundImage = "";
        designContainer.style.display = "none";
        placeholderText.style.display = "block";

        if (downloadBtn) {
            downloadBtn.disabled = true;
            downloadBtn.style.opacity = 0.5;
        }

        fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, color: selectedColor }),
        })
            .then(response => response.json())
            .then(data => {
                console.log("Fetch response:", data); // 👈 ADD THIS
                if (data.success) {
                    placeholderText.style.display = "none";
                    designContainer.style.backgroundImage = `url(${data.image_url}?t=${Date.now()})`;
                    designContainer.style.display = "block";
        
                    if (downloadBtn) {
                        downloadBtn.disabled = false;
                        downloadBtn.style.opacity = 1;
                    }
                } else {
                    alert(`Backend Error: ${data.error}`); // 👈 SHOW ERROR
                }
            })
            .catch(err => alert(`Request Failed: ${err}`))
            .finally(() => {
                spinner.style.display = "none";
            });
    });

    // Confirm button
    confirmBtn.addEventListener("click", () => {
        const selectedSize = sizeSelector.value;
        alert(`Design confirmed! Size selected: ${selectedSize}`);
    });

    // Download button
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const link = document.createElement("a");
            link.href = "/static/generated_images/output_image_1.png";
            link.download = `tshirt_design_${Date.now()}.png`;
            link.click();
        });
    }
});
