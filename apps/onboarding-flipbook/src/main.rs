use bevy::{
    prelude::*,
    window::WindowResolution,
    color::palettes::css::*,
};

/// Entry point for the WASM sidecar onboarding app
fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "Kupuri Media Onboarding".into(),
                resolution: WindowResolution::new(800., 600.).with_scale_factor_override(1.0),
                fit_canvas_to_parent: true,
                prevent_default_event_handling: false,
                ..default()
            }),
            ..default()
        }))
        .insert_resource(ClearColor(Color::srgba(0.02, 0.02, 0.04, 1.0)))
        .add_systems(Startup, setup)
        .add_systems(Update, animate_flipbook)
        .run();
}

#[derive(Component)]
struct FlipbookPage {
    rotation_speed: f32,
    angle: f32,
}

fn setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    // 3D Camera with blooming immersive angle
    commands.spawn(Camera3dBundle {
        transform: Transform::from_xyz(0.0, 4.0, 8.0).looking_at(Vec3::ZERO, Vec3::Y),
        ..default()
    });

    // Dramatic Lighting
    commands.spawn(PointLightBundle {
        point_light: PointLight {
            intensity: 8000.0,
            shadows_enabled: true,
            color: Color::Srgba(Srgba::new(0.83, 0.68, 0.21, 1.0)), // ALEX Gold
            ..default()
        },
        transform: Transform::from_xyz(4.0, 5.0, 4.0),
        ..default()
    });
    
    commands.spawn(PointLightBundle {
        point_light: PointLight {
            intensity: 6000.0,
            color: Color::Srgba(Srgba::new(0.54, 0.36, 0.96, 1.0)), // SYNTHIA Violet
            ..default()
        },
        transform: Transform::from_xyz(-4.0, -2.0, 4.0),
        ..default()
    });

    // Central flipbook "pages" floating
    let page_mesh = meshes.add(Cuboid::new(4.0, 5.0, 0.1));
    
    // Page 1
    commands.spawn((
        PbrBundle {
            mesh: page_mesh.clone(),
            material: materials.add(StandardMaterial {
                base_color: Color::Srgba(Srgba::new(0.93, 0.26, 0.26, 1.0)), // CAZADORA Red
                metallic: 0.8,
                perceptual_roughness: 0.2,
                ..default()
            }),
            transform: Transform::from_xyz(0.0, 0.0, 0.0),
            ..default()
        },
        FlipbookPage { rotation_speed: 1.0, angle: 0.0 }
    ));

    // Page 2
    commands.spawn((
        PbrBundle {
            mesh: page_mesh.clone(),
            material: materials.add(StandardMaterial {
                base_color: Color::Srgba(Srgba::new(0.13, 0.77, 0.36, 1.0)), // FORJADORA Green
                metallic: 0.8,
                perceptual_roughness: 0.2,
                ..default()
            }),
            transform: Transform::from_xyz(0.0, 0.0, 0.0),
            ..default()
        },
        FlipbookPage { rotation_speed: 1.2, angle: std::f32::consts::PI / 4.0 }
    ));
}

fn animate_flipbook(
    time: Res<Time>,
    mut query: Query<(&mut Transform, &mut FlipbookPage)>,
) {
    for (mut transform, mut page) in &mut query {
        page.angle += page.rotation_speed * time.delta_seconds();
        // Create an immersive 3D flipping card effect
        transform.rotation = Quat::from_rotation_y(page.angle.sin() * 0.5) * Quat::from_rotation_x((page.angle * 0.5).cos() * 0.2);
        transform.translation.y = (page.angle * 2.0).sin() * 0.2;
    }
}
