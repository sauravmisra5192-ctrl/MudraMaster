# Classical Indian Dance Hastha Mudra Guide & Design Manual

## Theoretical Foundations
In classical Indian dance (including Bharatnatyam, Kuchipudi, Kathakali, and Odissi), hand gestures are referred to as **Hastha Mudras** or **Hasthas**. They are codified in canonical texts, most notably:
1. **Natyashastra** (attributed to Sage Bharata, c. 200 BCE – 200 CE)
2. **Abhinaya Darpana** ("The Mirror of Gesture" by Nandikesvara, c. 5th - 11th century CE)

Hand gestures are divided into two main categories:
- **Asamyuta Hasthas**: Single-hand gestures (28 foundational in Abhinaya Darpana, e.g., Pataka, Tripataka, Suchi, Shikhara, etc.)
- **Samyuta Hasthas**: Double-hand gestures (24 in Abhinaya Darpana, formed by combining both hands, e.g., Anjali, Kapotha, Karkata)

This application focuses on teaching and correcting foundational **Asamyuta Hasthas** (Single-Hand Gestures).

---

## Hand Landmark Coordinate Protocol
To digitize and classify gestures, we mapping the human hand to the 21 reference landmarks defined by the standard **MediaPipe Hands** skeleton:

```
          8 (Index Tip)      12 (Middle Tip)      16 (Ring Tip)      20 (Pinky Tip)
          |                  |                    |                  |
          7                  11                   15                 19
          |                  |                    |                  |
          6                  10                   14                 18
          |                  |                    |                  |
   4 (Thumb Tip)             9 (Middle MCP)       13 (Ring MCP)      17 (Pinky MCP)
   \      5 (Index MCP)      /
    3    /                  /
     \  /                  /
      2                   /
       \                 /
        1               /
         \             /
          \           /
           0 (Wrist)
```

---

## Neural & Geometric Classifier Mappings

This application uses a deterministic geometric classifier that evaluates the joint relationships relative to the scale-invariant hand size ($H$), measured as the distance between the **Wrist (0)** and the **Middle MCP (9)**:
$$H = \text{distance}(\text{Landmark 0}, \text{Landmark 9})$$

By calculating normalized ratios of distances between joints, we classify the mudras efficiently with $0\,\text{ms}$ computational overhead, bypassing large neural-net runtime downloads.

### 1. Pataka (The Flag)
- **Visual Description**: Palm open, all fingers straight and joined together. Thumb tucked tight.
- **Formulas**:
  - Finger extension heights: $\text{distance}(\text{Tip}, \text{MCP}) / H \ge 1.2$ for Index, Middle, Ring, Pinky.
  - Fingers joined: $\sum \text{tip-to-tip distances} / H \le 0.95$
  - Thumb adduction: $\text{distance}(\text{Thumb Tip}, \text{Index MCP}) / H \le 0.6$

### 2. Tripataka (Three-Part Flag)
- **Visual Description**: Pataka but the Ring finger is curled down towards palm.
- **Formulas**:
  - Index, Middle, Pinky $\ge 1.2$ extension.
  - Ring Tip extension $\le 0.75$.

### 3. Kartarimukha (Scissors)
- **Visual Description**: Index and Middle open in a 'V'. Ring and Pinky pinned down by thumb.
- **Formulas**:
  - Index & Middle extension $\ge 1.1$.
  - Index Tip to Middle Tip distance / $H \ge 0.65$ (V separation).
  - Ring and Pinky extension $\le 0.55$.

### 4. Mayura (The Peacock)
- **Visual Description**: Ring finger tip touches thumb tip. Other three fingers erect.
- **Formulas**:
  - Index, Middle, Pinky extensions $\ge 1.0$.
  - $\text{distance}(\text{Thumb Tip}, \text{Ring Tip}) / H \le 0.35$ (Pinch).

### 5. Alapadma (Bloomed Lotus)
- **Visual Description**: All fingers fanned out wide in a curved lotus petal cup.
- **Formulas**:
  - All finger extensions $\ge 0.95$ with backward curvature.
  - Tips distance (Index-Middle, Middle-Ring, Ring-Pinky) / $H \ge 0.45$ each.

### 6. Suchi (The Needle)
- **Visual Description**: Index finger pointing up; other fingers curled flat under thumb.
- **Formulas**:
  - Index extension $\ge 1.25$.
  - Middle, Ring, Pinky extensions $\le 0.5$.
  - Thumb tucked over folded knuckles.

### 7. Shikhara (The Peak)
- **Visual Description**: Closed fist with thumb straight up.
- **Formulas**:
  - Index, Middle, Ring, Pinky extensions $\le 0.5$.
  - Thumb extension $\ge 0.85$.

### 8. Kapittha (Elephant Apple)
- **Visual Description**: Shikhara fist but index finger bent over the tip of thumb.
- **Formulas**:
  - Middle, Ring, Pinky $\le 0.5$.
  - Thumb upright $\ge 0.75$.
  - $\text{distance}(\text{Index Tip}, \text{Thumb Tip}) / H \le 0.4$.

---

## Training Schema & Labeled Gesture Dataset
To scale this prototype into a deep convolutional neural network model (using TensorFlow Lite or PyTorch), reference the following dataset schema:

```json
{
  "dataset_metadata": {
    "num_classes": 8,
    "framework": "MediaPipe Hands",
    "classes": ["pataka", "tripataka", "kartarimukha", "mayura", "alapadma", "suchi", "shikhara", "kapittha"]
  },
  "data_schema": {
    "type": "object",
    "properties": {
      "image_id": { "type": "string" },
      "mudra_label": { "type": "string", "enum": ["pataka", "tripataka", "kartarimukha", "mayura", "alapadma", "suchi", "shikhara", "kapittha"] },
      "dance_form": { "type": "string", "enum": ["Bharatnatyam", "Kuchipudi", "Kathakali", "Odissi"] },
      "asamyuta_class": { "type": "boolean", "default": true },
      "landmarks": {
        "type": "array",
        "minItems": 21,
        "maxItems": 21,
        "items": {
          "type": "object",
          "properties": {
            "id": { "type": "integer", "minimum": 0, "maximum": 20 },
            "x": { "type": "number", "minimum": 0.0, "maximum": 1.0, "description": "X coordinate normalized by image width" },
            "y": { "type": "number", "minimum": 0.0, "maximum": 1.0, "description": "Y coordinate normalized by image height" },
            "z": { "type": "number", "description": "Z depth coordinate relative to wrist 0 landmark" }
          },
          "required": ["id", "x", "y", "z"]
        }
      }
    },
    "required": ["image_id", "mudra_label", "landmarks"]
  }
}
```
