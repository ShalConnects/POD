from stability_sdk import client
import os

# API Key for Stability AI
STABILITY_API_KEY = "sk-vXI2eJHXWOadIr8a2gCbES8IWFEBiVAwYvY9IjKqCGi24SPT"

# Define ARTIFACT_IMAGE manually (used in Stability API responses)
ARTIFACT_IMAGE = 1

def generate_image_stability_api(prompt):
    """
    Generate an image using Stability AI's API.
    """
    stability_api = client.StabilityInference(
        key=STABILITY_API_KEY,
        verbose=True,  # Enables detailed logging for debugging
        engine="stable-diffusion-v1"  # Ensure this matches the correct engine
    )

    # Generate the image
    response = stability_api.generate(
        prompt=prompt,
        steps=30,  # Adjust steps for desired quality
        width=512,  # Recommended resolution for better results
        height=512,
        cfg_scale=7.0,  # Guidance scale for creativity
    )

    # Save the first returned image
    output_path = "static/generated_images/output_image_1.png"
    for resp in response:
        if hasattr(resp, "artifacts"):
            for artifact in resp.artifacts:
                if artifact.type == ARTIFACT_IMAGE:  # Image artifact type
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    with open(output_path, "wb") as img_file:
                        img_file.write(artifact.binary)
    return output_path


def generate_image(prompt, method="stability"):
    """
    Wrapper function to generate an image.
    Only Stability AI API is supported in this version.
    """
    if method == "stability":
        return generate_image_stability_api(prompt)
    else:
        raise ValueError(f"Unsupported method: {method}")
