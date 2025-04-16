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
    const uploadInput = document.getElementById("upload-design");

    let selectedColor = "white"; // Default T-shirt color

    // Design Upload Logic
    if (uploadInput) {
        uploadInput.addEventListener("change", async () => {
            const file = uploadInput.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);
            formData.append("color", selectedColor);

            spinner.style.display = "block";
            designContainer.style.backgroundImage = "";
            placeholderText.style.display = "block";

            try {
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
            } catch (err) {
                alert(`Upload error: ${err}`);
            } finally {
                spinner.style.display = "none";
            }
        });
    }

    // Disable download initially
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.style.opacity = 0.5;
    }

    // Color Picker
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(o => o.classList.remove("active"));
            option.classList.add("active");
            selectedColor = option.dataset.color;
            tshirtImage.src = `/static/images/tshirt_${selectedColor}.png`;
        });
    });

    // Trigger generation on Enter
    promptInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            regenerateBtn.click();
        }
    });

    // Generate via AI
    regenerateBtn.addEventListener("click", () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert("Please enter a design idea!");
            return;
        }

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
                console.log("Fetch response:", data);
                if (data.success) {
                    placeholderText.style.display = "none";
                    designContainer.style.backgroundImage = `url(${data.image_url}?t=${Date.now()})`;
                    designContainer.style.display = "block";
                    if (downloadBtn) {
                        downloadBtn.disabled = false;
                        downloadBtn.style.opacity = 1;
                    }
                } else {
                    alert(`Backend Error: ${data.error}`);
                }
            })
            .catch(err => alert(`Request Failed: ${err}`))
            .finally(() => {
                spinner.style.display = "none";
            });
    });

    // Confirm Button
    confirmBtn.addEventListener("click", () => {
        const selectedSize = sizeSelector.value;
        alert(`Design confirmed! Size selected: ${selectedSize}`);
    });

    // Download Design
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const link = document.createElement("a");
            link.href = "/static/generated_images/output_image_1.png";
            link.download = `tshirt_design_${Date.now()}.png`;
            link.click();
        });
    }
});
