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
