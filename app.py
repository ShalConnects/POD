from flask import Flask, render_template, request, jsonify
import os
from generate_image import generate_image
from warp_design import place_design_on_tshirt  # <-- Make sure this is your blending function

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config['UPLOAD_FOLDER'] = 'static/generated_images'
app.config['SHIRT_IMAGE_FOLDER'] = 'static/images'

@app.route('/')
def index():
    """
    Serve the main page with the T-shirt design interface.
    """
    generated_image_url = os.path.join(app.config['UPLOAD_FOLDER'], "output_image_1.png")
    return render_template("index.html", generated_image_url=generated_image_url)


@app.route('/generate', methods=['POST'])
def generate():
    """
    Generate a T-shirt design image using Stability AI and blend it onto the selected T-shirt.
    """
    try:
        # Get data from frontend
        data = request.get_json()
        prompt = data.get("prompt", "A cool design")
        color = data.get("color", "white")  # Default color

        # Generate the AI design
        design_path = generate_image(prompt, method="stability")  # e.g., output: static/generated_images/design.png

        # Determine T-shirt mockup based on selected color
        shirt_map = {
            "white": "tshirt_white.png",
            "black": "tshirt_black.png",
            "blue": "tshirt_blue.png"
        }
        shirt_filename = shirt_map.get(color, "tshirt_white.png")
        shirt_path = os.path.join(app.config['SHIRT_IMAGE_FOLDER'], shirt_filename)

        # Output path for preview
        preview_path = os.path.join(app.config['UPLOAD_FOLDER'], "output_image_1.png")

        # Blend the design onto the shirt
        place_design_on_tshirt(
            tshirt_image_path=shirt_path,
            design_image_path=design_path,
            output_path=preview_path
        )

        return jsonify({'success': True, 'image_url': '/' + preview_path})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


if __name__ == '__main__':
    """
    Run the Flask development server.
    """
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=True)
