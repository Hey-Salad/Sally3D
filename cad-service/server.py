"""
CadQuery CAD Service for ProtoForge AI
Run this on your Mac Mini or Raspberry Pi with Python 3.10+

Setup:
  pip install -r requirements.txt
  python server.py

For production:
  gunicorn -w 2 -b 0.0.0.0:5001 server:app
"""

import os
import json
import tempfile
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# CadQuery import (requires installation)
try:
    import cadquery as cq
    CADQUERY_AVAILABLE = True
except ImportError:
    CADQUERY_AVAILABLE = False
    print("WARNING: CadQuery not installed. Install with: pip install cadquery")

app = Flask(__name__)
CORS(app)

# Store generated models in memory (use Redis/disk for production)
models = {}


def generate_enclosure(params: dict) -> str:
    """Generate a parametric enclosure using CadQuery"""
    if not CADQUERY_AVAILABLE:
        raise RuntimeError("CadQuery not installed")
    
    inner = params.get("innerDimensions", {"length": 80, "width": 50, "height": 30})
    wall = params.get("wallThickness", 2.5)
    corner_radius = params.get("cornerRadius", 3)
    lid_type = params.get("lidType", "snap")
    
    # Outer dimensions
    outer_length = inner["length"] + (wall * 2)
    outer_width = inner["width"] + (wall * 2)
    outer_height = inner["height"] + wall
    lid_height = 5
    
    # Create base shell
    base = (
        cq.Workplane("XY")
        .box(outer_length, outer_width, outer_height - lid_height)
        .edges("|Z").fillet(min(corner_radius, outer_width/3))
    )
    
    # Shell out the interior
    base = base.faces(">Z").shell(-wall)
    
    # Add mounting holes if specified
    mounting_holes = params.get("mountingHoles", [])
    for hole in mounting_holes:
        x = hole.get("x", 0) - inner["length"]/2
        y = hole.get("y", 0) - inner["width"]/2
        diameter = hole.get("diameter", 3)
        standoff_height = params.get("standoffHeight", 4)
        
        # Add standoff
        standoff = (
            cq.Workplane("XY")
            .center(x, y)
            .circle(diameter + 2)
            .extrude(standoff_height)
            .faces(">Z")
            .hole(diameter)
        )
        base = base.union(standoff.translate((0, 0, wall)))
    
    # Add port cutouts
    port_cutouts = params.get("portCutouts", [])
    for port in port_cutouts:
        wall_side = port.get("wall", "front")
        px = port.get("x", 0)
        py = port.get("y", 0)
        pw = port.get("width", 10)
        ph = port.get("height", 5)
        
        # Calculate cutout position based on wall
        if wall_side == "front":
            cutout = (
                cq.Workplane("XZ")
                .center(px - inner["length"]/2, py)
                .rect(pw, ph)
                .extrude(-wall * 2)
                .translate((0, -outer_width/2, wall))
            )
        elif wall_side == "back":
            cutout = (
                cq.Workplane("XZ")
                .center(px - inner["length"]/2, py)
                .rect(pw, ph)
                .extrude(wall * 2)
                .translate((0, outer_width/2 - wall, wall))
            )
        elif wall_side == "left":
            cutout = (
                cq.Workplane("YZ")
                .center(px - inner["width"]/2, py)
                .rect(pw, ph)
                .extrude(-wall * 2)
                .translate((-outer_length/2, 0, wall))
            )
        elif wall_side == "right":
            cutout = (
                cq.Workplane("YZ")
                .center(px - inner["width"]/2, py)
                .rect(pw, ph)
                .extrude(wall * 2)
                .translate((outer_length/2 - wall, 0, wall))
            )
        else:
            continue
            
        base = base.cut(cutout)
    
    # Add ventilation if specified
    vent = params.get("ventilation", {})
    if vent.get("type") == "slots":
        slot_width = 2
        slot_spacing = 4 if vent.get("density") == "high" else 6 if vent.get("density") == "medium" else 8
        num_slots = int((inner["length"] - 20) / slot_spacing)
        
        for i in range(num_slots):
            x_pos = -inner["length"]/2 + 10 + i * slot_spacing
            slot = (
                cq.Workplane("XY")
                .center(x_pos, 0)
                .rect(slot_width, inner["width"] - 10)
                .extrude(wall * 2)
                .translate((0, 0, outer_height - lid_height - wall))
            )
            base = base.cut(slot)
    
    # Create lid
    lid = (
        cq.Workplane("XY")
        .box(outer_length, outer_width, lid_height)
        .edges("|Z").fillet(min(corner_radius, outer_width/3))
    )
    
    # Add lip to lid for snap/slide fit
    lip_depth = 2 if lid_type in ["snap", "slide"] else 0
    if lip_depth > 0:
        lip = (
            cq.Workplane("XY")
            .box(outer_length - wall*2 - 0.4, outer_width - wall*2 - 0.4, lip_depth)
            .translate((0, 0, -lid_height/2 - lip_depth/2))
        )
        lid = lid.union(lip)
    
    # Add screw holes to lid if screw type
    if lid_type == "screw":
        screw_positions = [
            (outer_length/2 - 5, outer_width/2 - 5),
            (outer_length/2 - 5, -outer_width/2 + 5),
            (-outer_length/2 + 5, outer_width/2 - 5),
            (-outer_length/2 + 5, -outer_width/2 + 5),
        ]
        for sx, sy in screw_positions:
            lid = lid.faces(">Z").workplane().center(sx, sy).hole(3.2)
    
    # Add text emboss if specified
    text_emboss = params.get("textEmboss")
    if text_emboss and text_emboss.get("text"):
        # Note: CadQuery text requires additional fonts setup
        pass
    
    # Export both parts
    with tempfile.NamedTemporaryFile(suffix=".stl", delete=False) as base_file:
        cq.exporters.export(base, base_file.name)
        base_stl = base_file.name
    
    with tempfile.NamedTemporaryFile(suffix=".stl", delete=False) as lid_file:
        cq.exporters.export(lid.translate((0, 0, outer_height)), lid_file.name)
        lid_stl = lid_file.name
    
    return base_stl, lid_stl


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "cadquery_available": CADQUERY_AVAILABLE,
        "version": "1.0.0"
    })


@app.route("/generate", methods=["POST"])
def generate():
    """Generate an enclosure from parameters"""
    if not CADQUERY_AVAILABLE:
        return jsonify({"error": "CadQuery not installed on server"}), 500
    
    try:
        params = request.json
        model_id = params.get("modelId", f"model_{os.urandom(4).hex()}")
        
        base_stl, lid_stl = generate_enclosure(params)
        
        # Store file paths
        models[model_id] = {
            "base": base_stl,
            "lid": lid_stl,
            "params": params
        }
        
        return jsonify({
            "success": True,
            "modelId": model_id,
            "files": {
                "base": f"/download/{model_id}/base",
                "lid": f"/download/{model_id}/lid"
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/download/<model_id>/<part>", methods=["GET"])
def download(model_id: str, part: str):
    """Download a generated STL file"""
    if model_id not in models:
        return jsonify({"error": "Model not found"}), 404
    
    model = models[model_id]
    if part == "base":
        return send_file(model["base"], mimetype="model/stl", as_attachment=True, download_name=f"{model_id}_base.stl")
    elif part == "lid":
        return send_file(model["lid"], mimetype="model/stl", as_attachment=True, download_name=f"{model_id}_lid.stl")
    else:
        return jsonify({"error": "Invalid part"}), 400


@app.route("/preview/<model_id>", methods=["GET"])
def preview(model_id: str):
    """Get preview data for the 3D viewer"""
    if model_id not in models:
        return jsonify({"error": "Model not found"}), 404
    
    # Return the raw STL data as base64 for the viewer
    import base64
    
    model = models[model_id]
    with open(model["base"], "rb") as f:
        base_data = base64.b64encode(f.read()).decode()
    with open(model["lid"], "rb") as f:
        lid_data = base64.b64encode(f.read()).decode()
    
    return jsonify({
        "modelId": model_id,
        "base": base_data,
        "lid": lid_data,
        "params": model["params"]
    })


if __name__ == "__main__":
    print("=" * 50)
    print("ProtoForge CAD Service")
    print("=" * 50)
    if not CADQUERY_AVAILABLE:
        print("WARNING: CadQuery not installed!")
        print("Install with: pip install cadquery")
    print("Starting server on http://0.0.0.0:5001")
    print("=" * 50)
    app.run(host="0.0.0.0", port=5001, debug=True)
