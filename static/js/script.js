document.addEventListener("DOMContentLoaded", () => {

    // Color Selection Code
    const colorOptions = document.querySelectorAll('.color-option');
    const tshirtImage = document.getElementById('tshirt');

    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedColor = option.dataset.color;
            tshirtImage.src = `/static/images/tshirt_${selectedColor}.png`;
        });
    });

    const regenerateBtn = document.getElementById("regenerate");
    const confirmBtn = document.getElementById("confirm");
    const downloadBtn = document.getElementById("download");
    const designContainer = document.querySelector('.design-container');
    const spinner = document.getElementById("spinner");
    const sizeSelector = document.getElementById("size");
    const promptInput = document.getElementById("prompt");
    const placeholderText = document.getElementById("placeholder-text");

    // Check if the Download button exists before manipulating it
    if (downloadBtn) {
        // Disable the Download button for now
        downloadBtn.disabled = true;
        downloadBtn.style.opacity = 0.5; // To give a visual cue that it's disabled
    }

    // Trigger the generate process when Enter key is pressed in the textarea
    promptInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent adding a new line
            regenerateBtn.click(); // Trigger the click event on the Generate button
        }
    });

    // Regenerate design process
    regenerateBtn.addEventListener("click", () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert("Please enter a design idea!");
            return;
        }

        // Show spinner and hide design while generating
        spinner.style.display = "block";
        designContainer.style.display = "none";
        placeholderText.style.display = "block"; // Show the placeholder text

        fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Hide the placeholder text and update the circular container's background image
                    placeholderText.style.display = "none"; // Hide placeholder
                    designContainer.style.backgroundImage = `url(${data.image_url}?t=${new Date().getTime()})`; // Prevent caching
                    designContainer.style.display = "block"; // Show the design
                    // Enable download button after the design is generated (if it exists)
                    if (downloadBtn) {
                        downloadBtn.disabled = false;
                        downloadBtn.style.opacity = 1; // Restore opacity to normal
                    }
                } else {
                    alert(`Error: ${data.error}`);
                }
            })
            .catch(err => alert(`Fetch Error: ${err}`))
            .finally(() => {
                // Hide spinner after the image is loaded
                spinner.style.display = "none";
            });
    });

    // Confirm design process
    confirmBtn.addEventListener("click", () => {
        const selectedSize = sizeSelector.value;
        alert(`Design confirmed! Size selected: ${selectedSize}`);
    });
});
