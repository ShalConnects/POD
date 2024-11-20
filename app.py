from flask import Flask, render_template, request, jsonify
import os
from generate_image import generate_image

app = Flask(__name__, static_folder="static", template_folder="Templates")
app.config['UPLOAD_FOLDER'] = 'static/generated_images'


@app.route('/')
def index():
    """
    Serve the main page with the T-shirt design interface.
    """
    # Default generated image for display
    generated_image_url = os.path.join(app.config['UPLOAD_FOLDER'], "output_image_1.png")
    return render_template("index.html", generated_image_url=generated_image_url)


@app.route('/generate', methods=['POST'])
def generate():
    """
    API endpoint to generate an image using Stability AI.
    """
    try:
        # Parse prompt from the incoming JSON request
        data = request.get_json()
        prompt = data.get("prompt", "Default design prompt")  # Fallback prompt
        
        # Generate a new image using Stability AI
        output_path = generate_image(prompt, method="stability")
        return jsonify({'success': True, 'image_url': '/' + output_path})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


if __name__ == '__main__':
    """
    Run the Flask application.
    """
    # Ensure the directory for generated images exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=True)
