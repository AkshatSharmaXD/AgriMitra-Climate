"""Leaf detection and framing for crop-disease images.

Why this is not a simple green filter
-------------------------------------
The previous implementation masked a single HSV hue window (20–100 on OpenCV's
0–179 scale), which is green. Every diseased leaf colour therefore scored a plant
ratio of 0.0% and was rejected with "Please upload a clear image of a plant leaf":
rust (orange-brown), late blight (dark brown), necrosis (dry tan), anthracnose
(near black), red lesions and purple nutrient deficiency. A disease scanner that
only accepts healthy leaves is the wrong way round, and it is the exact photo a
worried farmer is most likely to take.

Leaf tissue is matched here across its real colour range, and the gate is
deliberately permissive: refusing a genuine photo costs the farmer their answer,
while passing a doubtful one only costs a low-confidence prediction that the
classifier and the Gemini fallback are there to catch.
"""

from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np
from PIL import Image, ImageOps

# Phone cameras write orientation to EXIF rather than rotating pixels. Without
# applying it a portrait photo reaches the model sideways, which measurably
# degrades classification.
Image.MAX_IMAGE_PIXELS = 50_000_000  # decompression-bomb guard on untrusted input

# The classifier consumes 224x224. Anything beyond this is decoded and resized
# for nothing; a 12MP phone photo costs far more time than the inference itself.
MAX_WORKING_EDGE = 1024

# Below this share of leaf-like pixels, only reject when the frame also looks
# strongly like a known non-leaf background.
MIN_LEAF_RATIO = 0.06
# Below this, reject regardless — there is nothing to classify.
ABSOLUTE_MIN_LEAF_RATIO = 0.015
MIN_CONTOUR_AREA = 400


@dataclass
class LeafFrame:
    image: Image.Image
    is_leaf: bool
    leaf_ratio: float
    background_ratio: float
    reason: str


def _leaf_mask(hsv: np.ndarray) -> np.ndarray:
    """Union of the colour families real leaf tissue actually takes.

    Hue is OpenCV's 0–179. Each band is paired with a saturation floor so that
    grey and white surfaces, which have arbitrary hue, cannot satisfy any band.
    """
    bands = [
        # Healthy green through yellow-green chlorosis.
        ((25, 40, 25), (95, 255, 255)),
        # Yellow, orange, rust, dry tan, mid-brown necrosis.
        ((5, 45, 25), (35, 255, 245)),
        # Red lesions and anthracnose margins wrap around hue 0.
        ((0, 60, 25), (8, 255, 255)),
        ((170, 60, 25), (179, 255, 255)),
        # Purple and magenta nutrient deficiency.
        ((125, 45, 25), (165, 255, 255)),
    ]
    mask = np.zeros(hsv.shape[:2], np.uint8)
    for lower, upper in bands:
        mask |= cv2.inRange(hsv, np.array(lower, np.uint8), np.array(upper, np.uint8))

    # Dark necrotic tissue loses hue reliability but keeps some chroma. Include
    # it only when it is not the near-black of an underexposed background.
    dark = cv2.inRange(hsv, np.array((0, 30, 12), np.uint8), np.array((179, 255, 70), np.uint8))
    return mask | dark


def _background_mask(hsv: np.ndarray) -> np.ndarray:
    """Surfaces that are definitely not leaf: sky, and flat grey or white."""
    sky = cv2.inRange(
        hsv, np.array((96, 40, 110), np.uint8), np.array((135, 255, 255), np.uint8)
    )
    washed = cv2.inRange(hsv, np.array((0, 0, 0), np.uint8), np.array((179, 24, 255), np.uint8))
    return sky | washed


def prepare(pil_image: Image.Image) -> LeafFrame:
    """Orient, downscale, detect leaf tissue and crop to it."""
    image = ImageOps.exif_transpose(pil_image).convert("RGB")

    if max(image.size) > MAX_WORKING_EDGE:
        image.thumbnail((MAX_WORKING_EDGE, MAX_WORKING_EDGE), Image.LANCZOS)

    rgb = np.array(image)
    bgr = rgb[:, :, ::-1].copy()
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)

    mask = _leaf_mask(hsv)
    # Close pin-holes from lesion speckle so one leaf stays one contour rather
    # than fragmenting into dozens of tiny blobs.
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    total = mask.shape[0] * mask.shape[1]
    leaf_ratio = cv2.countNonZero(mask) / total
    background_ratio = cv2.countNonZero(_background_mask(hsv)) / total

    if leaf_ratio < ABSOLUTE_MIN_LEAF_RATIO:
        return LeafFrame(image, False, leaf_ratio, background_ratio, "almost no leaf tissue")

    if leaf_ratio < MIN_LEAF_RATIO and background_ratio > 0.55:
        return LeafFrame(
            image, False, leaf_ratio, background_ratio, "mostly sky or a plain surface"
        )

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return LeafFrame(image, True, leaf_ratio, background_ratio, "no contour; using full frame")

    largest = max(contours, key=cv2.contourArea)
    if cv2.contourArea(largest) < MIN_CONTOUR_AREA:
        return LeafFrame(image, True, leaf_ratio, background_ratio, "small subject; full frame")

    # Crop to everything leaf-like, not just the biggest blob: a leaf split by a
    # large lesion would otherwise be cropped to one half of itself.
    xs, ys, widths, heights = zip(
        *[cv2.boundingRect(c) for c in contours if cv2.contourArea(c) >= MIN_CONTOUR_AREA],
        strict=False,
    )
    x0, y0 = min(xs), min(ys)
    x1 = max(x + w for x, w in zip(xs, widths, strict=False))
    y1 = max(y + h for y, h in zip(ys, heights, strict=False))

    pad = 24
    height, width = mask.shape[:2]
    box = (
        max(0, x0 - pad),
        max(0, y0 - pad),
        min(width, x1 + pad),
        min(height, y1 + pad),
    )
    return LeafFrame(image.crop(box), True, leaf_ratio, background_ratio, "cropped to leaf")
