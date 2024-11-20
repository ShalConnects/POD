from stability_sdk import client
from stability_sdk.interfaces.gooseai import generation
from diffusers import StableDiffusionPipeline
import torch
import os

# Disable GPU entirely to avoid CUDA errors
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

# API key for Stability AI
STABILITY_API_KEY = "sk-vXI2eJHXWOadIr8a2gCbES8IWFEBiVAwYvY9IjKqCGi24SPT"

# Define ARTIFACT_IMAGE manually if not in SDK
ARTIFACT_IMAGE = 1

# Load Stable Diffusion pipeline for diffusers (if required)
print("Loading Stable Diffusion model on CPU...")
pipe = StableDiffusionPipeline.from_pretrained("CompVis/stable-diffusion-v1-4", torch_dtype=torch.float32)
pipe.to("cpu")  # Explicitly set the pipeline to use CPU
print("Stable Diffusion model loaded successfully!")

def generate_image_stability(prompt):
    """
    Generate an image using Stability AI API.
    """
    stability_api = client.StabilityInference(
        key=STABILITY_API_KEY,
        verbose=True,
        engine="stable-diffusion-768-v2-1"  # Ensure this matches the correct engine
    )

    response = stability_api.generate(
        prompt=prompt,
        steps=20,  # Adjust steps for faster generation
        width=384,  # Lower resolution to save memory
        height=384,  # Lower resolution to save memory
        cfg_scale=7.0,  # Guidance scale
    )

    output_path = "static/generated_images/output_image_1.png"
    for resp in response:
        if hasattr(resp, "artifacts"):
            for artifact in resp.artifacts:
                if artifact.type == ARTIFACT_IMAGE:
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    with open(output_path, "wb") as img_file:
                        img_file.write(artifact.binary)
    return output_path


def generate_image_diffusers(prompt):
    """
    Generate an image using Stable Diffusion with diffusers.
    """
    try:
        print(f"Generating image with Stable Diffusion for prompt: {prompt}")
        output_path = "static/generated_images/output_image_1.png"
        image = pipe(prompt).images[0]
        os.makedirs(os.path.dirname(output_path), exist_ok=True)  # Ensure directory exists
        image.save(output_path)
        print(f"Image saved to {output_path}")
        return output_path
    except Exception as e:
        print(f"Error generating image: {e}")
        raise


def generate_image(prompt, method="stability"):
    """
    Wrapper function to generate an image using the specified method.
    - method="stability": Use Stability AI API
    - method="diffusers": Use diffusers for image generation
    """
    if method == "stability":
        return generate_image_stability(prompt)
    elif method == "diffusers":
        return generate_image_diffusers(prompt)
    else:
        raise ValueError(f"Unsupported method: {method}")
