import cv2
import os

def place_design_on_tshirt(tshirt_image_path, design_image_path, output_path):
    # Load the T-shirt and design images
    tshirt = cv2.imread(tshirt_image_path)
    design = cv2.imread(design_image_path, cv2.IMREAD_UNCHANGED)

    # Define the placement area on the T-shirt
    # Centered horizontally and adjusted vertically
    x, y = 60, 150  # Top-left corner (x, y)
    w, h = 250, 200  # Width and height of the rectangle

    # Resize the design to fit the placement area
    design_resized = cv2.resize(design, (w, h))

    # Create a mask from the alpha channel (if present)
    if design.shape[2] == 4:
        mask = design_resized[:, :, 3]  # Extract the alpha channel
        design_resized = design_resized[:, :, :3]  # Remove the alpha channel
    else:
        mask = None

    # Place the resized design onto the T-shirt
    if mask is not None:
        # Blend the design and T-shirt using the mask
        for c in range(0, 3):
            tshirt[y:y+h, x:x+w, c] = (
                design_resized[:, :, c] * (mask / 255.0)
                + tshirt[y:y+h, x:x+w, c] * (1.0 - mask / 255.0)
            )
    else:
        # Directly overlay the design without blending
        tshirt[y:y+h, x:x+w] = design_resized

    # Save the output
    cv2.imwrite('static/generated_images/preview_tshirt.png', tshirt)
    if os.path.exists('static/generated_images/preview_tshirt.png'):
        print("File saved successfully!")
    else:
        print("File save failed!")

# Example usage:
if __name__ == "__main__":
    place_design_on_tshirt(
        'static/images/tshirt.png',  # Path to T-shirt image
        'static/generated_images/design.png',  # Path to generated design
        'static/generated_images/preview_tshirt.png'  # Output path
    )
