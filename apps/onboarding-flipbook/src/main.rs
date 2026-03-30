//! Kupuri Media — 3D Interactive Onboarding Flipbook
//!
//! Architecture:
//!  - Bevy 0.13 + WebGL2 (WASM target)
//!  - Interactive cover: drag/touch → Y-axis pivot rotation around spine edge
//!  - Snap physics: spring-damper lerp snaps to 0° (closed) or 90° (open)
//!  - Bloom post-processing: metallic ALEX Gold edges catch light dynamically
//!  - JS bridge: dispatches `flipbook:open` and `flipbook:video-trigger` DOM events
//!    so the HTML layer can sync video playback and UI micro-animations.

use bevy::{
    core_pipeline::{
        bloom::BloomSettings,
        tonemapping::Tonemapping,
    },
    input::{
        mouse::MouseMotion,
        touch::TouchPhase,
    },
    prelude::*,
    window::WindowResolution,
};

// ---------------------------------------------------------------------------
// Brand constants (from AGENTS.md Sphere OS™ palette)
// ---------------------------------------------------------------------------

const ALEX_GOLD:      Srgba = Srgba { red: 0.83, green: 0.68, blue: 0.21, alpha: 1.0 };
const SYNTHIA_VIOLET: Srgba = Srgba { red: 0.54, green: 0.36, blue: 0.96, alpha: 1.0 };
const SPINE_DARK:     Srgba = Srgba { red: 0.06, green: 0.06, blue: 0.10, alpha: 1.0 };
const INNER_PAGE_BG:  Srgba = Srgba { red: 0.05, green: 0.04, blue: 0.09, alpha: 1.0 };

// Cover page pivot: left edge of a 4.0-wide mesh is at x = -2.0 in world space
const COVER_WIDTH:    f32   = 4.0;
const COVER_HALF:     f32   = COVER_WIDTH * 0.5; // 2.0
const COVER_HEIGHT:   f32   = 5.5;
const PAGE_DEPTH:     f32   = 0.06;

// Physics
const SNAP_THRESHOLD: f32   = std::f32::consts::FRAC_PI_4; // 45° = snap point
const SPRING_K:       f32   = 10.0;
const DAMPING_B:      f32   = 5.5;
const MAX_OPEN:       f32   = std::f32::consts::FRAC_PI_2; // 90°

// ---------------------------------------------------------------------------
// Components + Resources
// ---------------------------------------------------------------------------

/// The interactive book cover that pivots around its spine (left) edge.
#[derive(Component)]
struct FlipbookCover {
    /// Current open angle in radians. 0.0 = closed, FRAC_PI_2 = fully open.
    rotation: f32,
    /// Angular velocity for spring-damper snap physics.
    velocity: f32,
}

/// Marker: the inner page revealed when the cover opens.
#[derive(Component)]
struct InnerPage;

/// Tracks mouse/touch drag state frame-to-frame.
#[derive(Resource, Default)]
struct DragState {
    active: bool,
    /// Accumulated horizontal delta since drag start (mouse only)
    accumulated_delta: f32,
    /// Cover.rotation at drag start (anchor point)
    start_rotation: f32,
    /// Last emitted JS open-state (0.0–1.0) to avoid spamming events
    last_js_fraction: f32,
    /// Whether the video-trigger event has been fired this open session
    video_triggered: bool,
}

// ---------------------------------------------------------------------------
// App entry point
// ---------------------------------------------------------------------------

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "Kupuri Media — Bienvenida".into(),
                resolution: WindowResolution::new(900.0, 640.0)
                    .with_scale_factor_override(1.0),
                fit_canvas_to_parent: true,
                // Allow JS to handle default pointer events (needed for touch scroll fallback)
                prevent_default_event_handling: false,
                ..default()
            }),
            ..default()
        }))
        .insert_resource(ClearColor(Color::srgba(0.012, 0.012, 0.022, 1.0)))
        .insert_resource(DragState::default())
        .add_systems(Startup, setup_scene)
        .add_systems(
            Update,
            (
                handle_mouse_input,
                handle_touch_input,
                update_cover_physics,
                sync_cover_transform,
                sync_js_state,
            )
                .chain(),
        )
        .run();
}

// ---------------------------------------------------------------------------
// Startup: build the 3D scene
// ---------------------------------------------------------------------------

fn setup_scene(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    // ------------------------------------------------------------------
    // Camera — HDR required for Bloom
    // ------------------------------------------------------------------
    commands.spawn((
        Camera3dBundle {
            camera: Camera {
                hdr: true,
                ..default()
            },
            tonemapping: Tonemapping::TonyMcMapFace,
            transform: Transform::from_xyz(0.5, 1.2, 8.0)
                .looking_at(Vec3::new(0.0, 0.2, 0.0), Vec3::Y),
            ..default()
        },
        // Bloom — metallic ALEX Gold edges catch light dynamically (Phase C)
        BloomSettings {
            intensity: 0.25,
            high_pass_frequency: 1.0,
            ..default()
        },
    ));

    // ------------------------------------------------------------------
    // Lighting — ALEX Gold key + SYNTHIA Violet fill + ambient
    // ------------------------------------------------------------------

    // Ambient: very dim violet tint to prevent pitch-black shadows
    commands.insert_resource(AmbientLight {
        color: Color::Srgba(Srgba {
            red: 0.54, green: 0.36, blue: 0.96, alpha: 1.0,
        }),
        brightness: 80.0,
    });

    // Key light: ALEX Gold — high intensity, positioned top-right-front
    commands.spawn(PointLightBundle {
        point_light: PointLight {
            intensity: 12_000.0,
            shadows_enabled: true,
            shadow_depth_bias: 0.02,
            color: Color::Srgba(ALEX_GOLD),
            range: 30.0,
            ..default()
        },
        transform: Transform::from_xyz(5.0, 6.0, 5.0),
        ..default()
    });

    // Fill light: SYNTHIA Violet — softer, left-low-back
    commands.spawn(PointLightBundle {
        point_light: PointLight {
            intensity: 5_500.0,
            color: Color::Srgba(SYNTHIA_VIOLET),
            range: 20.0,
            shadows_enabled: false,
            ..default()
        },
        transform: Transform::from_xyz(-5.0, -1.5, 3.0),
        ..default()
    });

    // Rim light: cool white from behind to outline the pages
    commands.spawn(PointLightBundle {
        point_light: PointLight {
            intensity: 3_000.0,
            color: Color::srgb(0.7, 0.75, 0.9),
            range: 15.0,
            shadows_enabled: false,
            ..default()
        },
        transform: Transform::from_xyz(0.0, 2.0, -6.0),
        ..default()
    });

    // ------------------------------------------------------------------
    // Geometry
    // ------------------------------------------------------------------

    let page_mesh = meshes.add(Cuboid::new(COVER_WIDTH, COVER_HEIGHT, PAGE_DEPTH));
    let spine_mesh = meshes.add(Cuboid::new(0.18, COVER_HEIGHT + 0.1, 0.48));

    // Book spine — static, at left edge where cover pivots
    commands.spawn(PbrBundle {
        mesh: spine_mesh,
        material: materials.add(StandardMaterial {
            base_color: Color::Srgba(SPINE_DARK),
            metallic: 0.95,
            perceptual_roughness: 0.08,
            reflectance: 0.9,
            ..default()
        }),
        transform: Transform::from_xyz(-2.09, 0.0, 0.0),
        ..default()
    });

    // Inner page — always visible behind the cover (slightly behind on Z)
    // Emissive SYNTHIA Violet glow so it reads well when cover is closed
    commands.spawn((
        PbrBundle {
            mesh: page_mesh.clone(),
            material: materials.add(StandardMaterial {
                base_color: Color::Srgba(INNER_PAGE_BG),
                metallic: 0.15,
                perceptual_roughness: 0.85,
                // Subtle emissive glow lights up as cover opens
                emissive: LinearRgba {
                    red:   SYNTHIA_VIOLET.red   * 0.12,
                    green: SYNTHIA_VIOLET.green * 0.12,
                    blue:  SYNTHIA_VIOLET.blue  * 0.12,
                    alpha: 1.0,
                },
                ..default()
            }),
            transform: Transform::from_xyz(0.0, 0.0, -PAGE_DEPTH),
            ..default()
        },
        InnerPage,
    ));

    // Cover — ALEX Gold metallic, high reflectance for bloom catching
    // Positioned with center at (0,0,0); pivot logic applied in sync_cover_transform
    commands.spawn((
        PbrBundle {
            mesh: page_mesh,
            material: materials.add(StandardMaterial {
                base_color: Color::Srgba(ALEX_GOLD),
                metallic: 0.98,
                perceptual_roughness: 0.04,
                reflectance: 1.0,
                // Subtle self-emissive so gold glows even without direct light
                emissive: LinearRgba {
                    red:   ALEX_GOLD.red   * 0.06,
                    green: ALEX_GOLD.green * 0.06,
                    blue:  ALEX_GOLD.blue  * 0.06,
                    alpha: 1.0,
                },
                ..default()
            }),
            // Initial position: closed over the inner page
            transform: Transform::from_xyz(0.0, 0.0, PAGE_DEPTH),
            ..default()
        },
        FlipbookCover { rotation: 0.0, velocity: 0.0 },
    ));
}

// ---------------------------------------------------------------------------
// System: Mouse drag input → update DragState + FlipbookCover.rotation
// ---------------------------------------------------------------------------

fn handle_mouse_input(
    mouse_buttons: Res<ButtonInput<MouseButton>>,
    mut mouse_motion: EventReader<MouseMotion>,
    windows: Query<&Window>,
    mut drag: ResMut<DragState>,
    mut cover_query: Query<&mut FlipbookCover>,
) {
    let Ok(window) = windows.get_single() else { return };
    let window_width = window.width().max(1.0);

    if mouse_buttons.just_pressed(MouseButton::Left) {
        drag.active = true;
        drag.accumulated_delta = 0.0;
        if let Ok(cover) = cover_query.get_single() {
            drag.start_rotation = cover.rotation;
        }
    }

    if drag.active {
        let mut latest_delta = 0.0_f32;
        for motion in mouse_motion.read() {
            drag.accumulated_delta += motion.delta.x;
            latest_delta = motion.delta.x;
        }
        if let Ok(mut cover) = cover_query.get_single_mut() {
            // Scale: full window drag ≈ 90°
            let delta_rotation = (drag.accumulated_delta / window_width) * MAX_OPEN * 1.6;
            cover.rotation = (drag.start_rotation + delta_rotation).clamp(0.0, MAX_OPEN);
            // Seed velocity so snap picks up momentum direction from the last frame's delta
            cover.velocity = (latest_delta / window_width) * MAX_OPEN * 60.0;
        }
    } else {
        // Drain any events that arrived while not dragging (e.g. cursor moves)
        for _ in mouse_motion.read() {}
    }

    if mouse_buttons.just_released(MouseButton::Left) {
        drag.active = false;
    }
}

// ---------------------------------------------------------------------------
// System: Touch input → DragState + FlipbookCover.rotation
// ---------------------------------------------------------------------------

fn handle_touch_input(
    mut touch_events: EventReader<TouchInput>,
    mut drag: ResMut<DragState>,
    mut cover_query: Query<&mut FlipbookCover>,
    windows: Query<&Window>,
) {
    let Ok(window) = windows.get_single() else { return };
    let window_width = window.width().max(1.0);

    for event in touch_events.read() {
        match event.phase {
            TouchPhase::Started => {
                drag.active = true;
                drag.accumulated_delta = 0.0;
                if let Ok(cover) = cover_query.get_single() {
                    drag.start_rotation = cover.rotation;
                }
            }
            TouchPhase::Moved => {
                if drag.active {
                    // Map horizontal touch movement to cover rotation
                    let virtual_start = window_width * 0.25;
                    let total_x = event.position.x;
                    let delta_rotation =
                        ((total_x - virtual_start) / (window_width * 0.5)) * MAX_OPEN;
                    if let Ok(mut cover) = cover_query.get_single_mut() {
                        cover.rotation =
                            (drag.start_rotation + delta_rotation).clamp(0.0, MAX_OPEN);
                    }
                }
            }
            TouchPhase::Ended | TouchPhase::Canceled => {
                // Impart directional momentum before handing off to snap physics
                if let Ok(mut cover) = cover_query.get_single_mut() {
                    cover.velocity = if cover.rotation > SNAP_THRESHOLD { 0.5 } else { -0.5 };
                }
                drag.active = false;
            }
        }
    }
}

// ---------------------------------------------------------------------------
// System: Spring-damper snap physics when not dragging
// ---------------------------------------------------------------------------

fn update_cover_physics(
    time: Res<Time>,
    drag: Res<DragState>,
    mut cover_query: Query<&mut FlipbookCover>,
) {
    let Ok(mut cover) = cover_query.get_single_mut() else { return };
    if drag.active {
        return; // User is driving — physics paused
    }

    // Hysteresis snap: cross 45° midpoint to decide target
    let target = if cover.rotation > SNAP_THRESHOLD {
        MAX_OPEN
    } else {
        0.0
    };

    let dt = time.delta_seconds().min(0.05); // cap at 50ms to prevent spiral

    // Spring force + damping
    let spring_force = SPRING_K * (target - cover.rotation);
    let damping_force = DAMPING_B * cover.velocity;
    cover.velocity += (spring_force - damping_force) * dt;
    cover.rotation = (cover.rotation + cover.velocity * dt).clamp(0.0, MAX_OPEN);
}

// ---------------------------------------------------------------------------
// System: Write cover.rotation → Transform (pivot at spine = left edge)
// ---------------------------------------------------------------------------

fn sync_cover_transform(
    mut cover_query: Query<(&mut Transform, &FlipbookCover)>,
) {
    let Ok((mut transform, cover)) = cover_query.get_single_mut() else { return };

    // Pivot at LEFT edge of the page in world space: x = -COVER_HALF
    // The mesh center is COVER_HALF to the right of the pivot.
    // Rotation around Y (negative = opens away from viewer, like a real book).
    let pivot_world = Vec3::new(-COVER_HALF, 0.0, 0.0);
    let center_from_pivot = Vec3::new(COVER_HALF, 0.0, PAGE_DEPTH);

    let rotation_quat = Quat::from_rotation_y(-cover.rotation);
    let rotated_offset = rotation_quat * center_from_pivot;

    transform.translation = pivot_world + rotated_offset;
    transform.rotation = rotation_quat;

    // Subtle vertical lift as cover opens — feels physical
    transform.translation.y += (cover.rotation / MAX_OPEN) * 0.12;
}

// ---------------------------------------------------------------------------
// System: Dispatch DOM events to JS layer (WASM only)
// Desktop stub: no-op so the function signature compiles on all targets
// ---------------------------------------------------------------------------

#[cfg(not(target_arch = "wasm32"))]
fn sync_js_state(_cover_query: Query<&FlipbookCover>, _drag: ResMut<DragState>) {}

#[cfg(target_arch = "wasm32")]
fn sync_js_state(
    cover_query: Query<&FlipbookCover>,
    mut drag: ResMut<DragState>,
) {
    use wasm_bindgen::prelude::JsValue;

    let Ok(cover) = cover_query.get_single() else { return };

    let open_fraction = (cover.rotation / MAX_OPEN).clamp(0.0, 1.0);

    // Throttle: only dispatch when fraction changes by >1%
    if (open_fraction - drag.last_js_fraction).abs() < 0.01 {
        return;
    }
    drag.last_js_fraction = open_fraction;

    let Some(window) = web_sys::window() else { return };
    let Some(document) = window.document() else { return };

    // --- flipbook:open event (carries open fraction 0.0–1.0 as detail) ---
    let mut init = web_sys::CustomEventInit::new();
    init.detail(&JsValue::from_f64(open_fraction as f64));
    if let Ok(event) =
        web_sys::CustomEvent::new_with_event_init_dict("flipbook:open", &init)
    {
        let _ = document.dispatch_event(&event);
    }

    // --- flipbook:video-trigger fires once when cover reaches 50%+ open ---
    if open_fraction >= 0.5 && !drag.video_triggered {
        drag.video_triggered = true;
        if let Ok(event) = web_sys::Event::new("flipbook:video-trigger") {
            let _ = document.dispatch_event(&event);
        }
    }
    // Reset so video can re-trigger if user closes and reopens the book
    if open_fraction < 0.1 {
        drag.video_triggered = false;
    }
}

