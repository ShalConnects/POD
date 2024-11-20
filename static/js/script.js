document.addEventListener("DOMContentLoaded", () => {
    // Color Selection Code
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

    // Initialize the UI
    if (downloadBtn) {
        downloadBtn.disabled = true; // Disable download button initially
        downloadBtn.style.opacity = 0.5; // Dim it to indicate it's disabled
    }

    // Handle color selection for the T-shirt
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedColor = option.dataset.color;
            tshirtImage.src = `/static/images/tshirt_${selectedColor}.png`;
        });
    });

    // Trigger the generate process when Enter key is pressed in the textarea
    promptInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent adding a new line
            regenerateBtn.click(); // Trigger the click event on the Generate button
        }
    });

    // Handle Generate Design button click
    regenerateBtn.addEventListener("click", () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert("Please enter a design idea!");
            return;
        }

        // Show spinner and reset the UI for a new design
        spinner.style.display = "block";
        designContainer.style.backgroundImage = ""; // Clear previous design
        designContainer.style.display = "none";
        placeholderText.style.display = "block"; // Show placeholder text

        // Disable download button during generation
        if (downloadBtn) {
            downloadBtn.disabled = true;
            downloadBtn.style.opacity = 0.5;
        }

        fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the design container with the new image
                    placeholderText.style.display = "none"; // Hide placeholder text
                    designContainer.style.backgroundImage = `url(${data.image_url}?t=${new Date().getTime()})`; // Prevent caching
                    designContainer.style.display = "block"; // Show design container

                    // Enable the download button
                    if (downloadBtn) {
                        downloadBtn.disabled = false;
                        downloadBtn.style.opacity = 1;
                    }
                } else {
                    alert(`Error: ${data.error}`);
                }
            })
            .catch(err => alert(`Error generating design: ${err}`))
            .finally(() => {
                spinner.style.display = "none"; // Hide spinner
            });
    });

    // Handle Confirm Design button click
    confirmBtn.addEventListener("click", () => {
        const selectedSize = sizeSelector.value;
        alert(`Design confirmed! Size selected: ${selectedSize}`);
    });

    // Handle Download Design button click
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const link = document.createElement("a");
            link.href = "/static/generated_images/output_image_1.png"; // Use the generated image path
            link.download = `tshirt_design_${new Date().getTime()}.png`; // Add timestamp for uniqueness
            link.click();
        });
    }
});
