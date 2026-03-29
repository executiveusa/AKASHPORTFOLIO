# BLENDER SCENE SPECIFICATION: El Panorama™ Rooftop
## For: Blender artist or AI-assisted generation
## Output: el-panorama-rooftop.glb (Draco compressed)
## Target: apps/control-room/public/models/el-panorama-rooftop.glb

---

## Reference
**Restaurant & Bar El Panorama** — Miramar 689, Centro, Puerto Vallarta, MX (est. 1973)
Top of Hotel Suites La Siesta. Hillside above the city. 360° Bay of Banderas view.

---

## Scene: Rooftop Terrace at Night

### Camera-Facing Environment
- **Night sky**: deep navy-black with visible stars, slight orange glow at horizon (city heat)
- **Bay of Banderas**: dark water in full background, city lights reflecting on surface
- **Puerto Vallarta city lights**: warm amber/orange below and behind the restaurant
- **Red clay tile rooftops**: visible below terrace edge in mid-ground
- **Slight coastal haze/mist** in distance

### Restaurant Structure (foreground)
- **Open-air rooftop terrace**: ~15m × 20m
- **Wrought-iron railings** at terrace edges with ornate detail
- **Stone/tile floor**: warm terracotta or stone tile
- **Partial interior visible**: large windows, soft warm light from inside
- **Columns or archways** framing the interior
- **2 terrace levels** visible: main level + upper step

### Tables (6 required — these are agent seats)
- **Round tables**, diameter ~90cm
- **White linen tablecloths**, slightly weighted at edges
- **1 pillar candle per table**, lit, warm flame animation possible
- **2–3 place settings** per table (not all occupied — spheres choose seats)
- **Crystal glasses**: 1 per place setting (for Tescito de Labrador™ liquid)
- **Chairs**: wrought iron or cane, classic Mexican fine dining style
- **Table positions**: spread naturally across terrace
  - 2 near railing (bay view)
  - 2 center
  - 2 near interior

### Lighting
- **Primary**: HDRI night sky (warmly lit urban night)
- **Accent**: 6 candle point lights (warm, ~2700K, low intensity, flickering possible)
- **Fill**: city glow from below (orange-amber, bounces off floor and lower walls)
- **Rim**: faint moonlight from above (cool blue, very subtle)
- **Interior**: warm light bleeds through windows

### Performance Constraints
- **Total polygon count**: < 180,000 for mobile compatibility
- **Texture resolution**: max 1024×1024 per material
- **Texture baking**: apply to static geometry to reduce draw calls
- **LOD levels**: 2 (full for desktop, 50% for mobile)
- **Materials**: use principled BSDF, avoid complex node trees

### Export Settings
- **Format**: glTF 2.0 binary (.glb)
- **Draco compression**: enabled (compression level 6)
- **Include**: geometry, materials, UV maps
- **Exclude**: armatures, shape keys, cameras, particles
- **Apply all transforms** before export
- **Y-up orientation** (default Three.js)

### Notes for Agent Integration
- **Tables** must be consistently positioned (Three.js will place sphere agents above each)
- **Keep table centers clear** (spheres float ~1m above table surface)
- **Railing areas**: keep clear for sphere "deep thinking" hover positions
- **Interior**: no need for detail — soft warm glow visible through glass is enough

---

## Three.js Integration Checklist
- [ ] Load model via THREE.GLTFLoader with Draco decoder
- [ ] Place 6 sphere agents above tables at correct positions
- [ ] Animate ambient light to match day/night cycle
- [ ] Candle lights with flicker animation (optional)
- [ ] Bay reflection material (water shader)
- [ ] Camera orbit behavior with bay always visible
- [ ] Energy arcs between spheres (procedural lines)
- [ ] Council mode: spheres move to center table formation

