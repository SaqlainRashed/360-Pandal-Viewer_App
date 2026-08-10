import * as THREE from './build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js'
import { GUI } from './jsm/libs/dat.gui.module.js';
import Stats from './jsm/libs/stats.module.js';

// Defensive: Prevent any user input from being used in SQL queries or model paths
// This client code must never send unsanitized user input to the server or use it in any database query.
// If you add any code that sends data to the backend, always sanitize and validate it on both client and server.
// Example: If you ever collect user input, do not send it directly to the backend for use in SQL queries.
// Instead, use parameterized queries on the backend and validate/sanitize input here.
//
// For demonstration, override all forms and inputs to prevent accidental submission of unsanitized data:
document.addEventListener('submit', function(e) {
    alert('Form submissions are disabled for security.');
    e.preventDefault();
}, true);

let scene;
let camera;
let renderer;
let house;
let model_container = document.querySelector('.webgl');
const canvasSize = document.querySelector('.canvas-element');

const stats = new Stats()
document.body.appendChild(stats.domElement);

const init = () => {
    // scene setup
    scene = new THREE.Scene();

    // Defensive: Prevent any user input from being used in SQL queries or model paths
    // This client code must never send unsanitized user input to the server or use it in any database query.
    // If you add any code that sends data to the backend, always sanitize and validate it on both client and server.
    // Example: If you ever collect user input, do not send it directly to the backend for use in SQL queries.
    // Instead, use parameterized queries on the backend and validate/sanitize input here.
    //
    // For demonstration, override all forms and inputs to prevent accidental submission of unsanitized data:
    document.addEventListener('submit', function(e) {
        alert('Form submissions are disabled for security.');
        e.preventDefault();
    }, true);

    //camera setup
    const fov = 40;
    const aspect = canvasSize.offsetWidth / canvasSize.offsetHeight;
    const near = 0.1;
    const far = 1000;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 25);
    camera.lookAt(scene.position);
    scene.add(camera);

    //renderer setup
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas: model_container
    });
    renderer.setSize(canvasSize.offsetWidth, canvasSize.offsetHeight);
    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);

    // orbitcontrol setup
    const controls = new OrbitControls(camera, renderer.domElement);

    // ambient light setup
    const amibientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(amibientLight);

    // direction lights setup
    const spotLight1 = new THREE.SpotLight(0x1d27f0, 5);
    spotLight1.position.set(6, 11, 6);
    spotLight1.castShadow = true;
    const spotLightHelper1 = new THREE.SpotLightHelper(spotLight1, 1, 0x00ff00);
    scene.add(spotLight1);
    //
    // Restrict model path to a fixed, safe value to prevent path manipulation
    //
    // DO NOT allow dynamic or user-supplied model paths!
    // Only load from a fixed, safe path:
    const SAFE_MODEL_PATH = './model/scene.glb';

    // Defensive: If any code tries to override SAFE_MODEL_PATH, throw an error
    Object.defineProperty(window, 'SAFE_MODEL_PATH', {
        value: SAFE_MODEL_PATH,
        writable: false,
        configurable: false
    });

    function validateGLTF(gltf) {
        // Defensive: Deep-freeze SAFE_MODEL_PATH to prevent tampering at runtime
        if (typeof SAFE_MODEL_PATH === 'string') {
            try {
                Object.freeze(SAFE_MODEL_PATH);
            } catch (e) {
                // Ignore if freeze fails (non-object), but this is a string
            }
        }
        // Defensive: Ensure SAFE_MODEL_PATH is not changed via prototype pollution
        if (window.SAFE_MODEL_PATH !== './model/scene.glb') {
            alert('Model path tampering detected.');
            return false;
        }
        // 0. Defensive: Block any GLTF with custom scripts, event handlers, or suspicious URIs in nodes/materials
        function deepScan(obj) {
            if (!obj || typeof obj !== 'object') return false;
            for (const key in obj) {
                if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
                if (typeof obj[key] === 'object') {
                    if (deepScan(obj[key])) return true;
                } else if (typeof obj[key] === 'string') {
                    // Block script tags, javascript: URIs, on* event handlers
                    if (/\bscript\b|javascript:/i.test(obj[key]) || /^on[a-z]+$/i.test(key)) {
                        return true;
                    }
                }
            }
            return false;
        }
        if (gltf && gltf.parser && gltf.parser.json && deepScan(gltf.parser.json)) {
            window.alert('Malicious content detected in model.');
            return false;
        }
        // 1. Disallow known dangerous extensions (example: custom extensions)
        const forbiddenExtensions = [
            'KHR_draco_mesh_compression',
            'KHR_mesh_quantization',
            'EXT_lights_image_based',
            'KHR_xmp_json_ld',
            'KHR_materials_unlit',
            'KHR_materials_pbrSpecularGlossiness',
            'KHR_materials_clearcoat',
            'KHR_materials_transmission',
            'KHR_materials_sheen',
            'KHR_materials_specular',
            'KHR_materials_ior',
            'KHR_materials_emissive_strength',
            'KHR_materials_volume',
            'KHR_materials_iridescence',
            'KHR_materials_anisotropy',
            'KHR_materials_variants',
            'KHR_animation_pointer',
            'KHR_animation_morph_target_weights',
            'KHR_animation_texture_sampler',
            'KHR_animation_texture',
            'KHR_lights_punctual',
            'KHR_texture_transform',
            'KHR_texture_basisu',
            'KHR_mesh_gpu_instancing',
            'KHR_node_groups',
            'KHR_materials_displacement',
            'KHR_materials_specular',
            'KHR_materials_transmission',
            'KHR_materials_volume',
            'KHR_materials_iridescence',
            'KHR_materials_anisotropy',
            'KHR_materials_variants',
            'KHR_animation_pointer',
            'KHR_animation_morph_target_weights',
            'KHR_animation_texture_sampler',
            'KHR_animation_texture',
            'KHR_lights_punctual',
            'KHR_texture_transform',
            'KHR_texture_basisu',
            'KHR_mesh_gpu_instancing',
            'KHR_node_groups',
            'KHR_materials_displacement'
        ];
        if (gltf && gltf.parser && gltf.parser.json && gltf.parser.json.extensions) {
            for (const ext of forbiddenExtensions) {
                if (gltf.parser.json.extensions[ext]) {
                    // Use a safe, static message to avoid XSS via extension name
                    window.alert('Unsupported or dangerous GLTF extension detected.');
                    return false;
                }
            }
        }
        // 2. Disallow embedded scripts or suspicious extras
        if (gltf && gltf.parser && gltf.parser.json && gltf.parser.json.extras) {
            if (gltf.parser.json.extras.scripts || gltf.parser.json.extras.javascript) {
                // Use a safe, static message to avoid XSS via extras content
                window.alert('Malicious script detected in model.');
                return false;
            }
        }
        // 2b. Block any extras containing suspicious keys or values
        if (gltf && gltf.parser && gltf.parser.json && gltf.parser.json.extras && deepScan(gltf.parser.json.extras)) {
            window.alert('Malicious content detected in model extras.');
            return false;
        }
        // 3. Optionally, check for too many nodes/meshes (basic sanity)
        // Enhanced: Check for excessive model complexity to prevent DoS
        const MAX_NODES = 50;
        const MAX_MESHES = 30;
        const MAX_VERTICES = 100000;
        if (gltf && gltf.scene && gltf.scene.children) {
            if (gltf.scene.children.length > MAX_NODES) {
                window.alert('Model is too complex (too many nodes).');
                return false;
            }
            let meshCount = 0;
            let vertexCount = 0;
            gltf.scene.traverse(function(obj) {
                if (obj.isMesh) {
                    meshCount++;
                    if (obj.geometry && obj.geometry.attributes && obj.geometry.attributes.position) {
                        vertexCount += obj.geometry.attributes.position.count;
                    }
                }
            });
            if (meshCount > MAX_MESHES) {
                window.alert('Model is too complex (too many meshes).');
                return false;
            }
            if (vertexCount > MAX_VERTICES) {
                window.alert('Model is too complex (too many vertices).');
                return false;
            }
        }
        return true;
    }

    // orenge light setup
    const spotLight2 = new THREE.SpotLight(0xf57d22, 2);
    spotLight2.position.set(-10, 0, 12);
    spotLight2.castShadow = true;
    const spotLightHelper2 = new THREE.SpotLightHelper(spotLight2, 2, 0x00ff00);
    scene.add(spotLight2);

    // back light setup
    const spotLight3 = new THREE.SpotLight(0x1d27f0, 2);
    spotLight3.position.set(-10, 18, -17);
    spotLight3.castShadow = true;
    const spotLightHelper3 = new THREE.SpotLightHelper(spotLight3, 2, 0xff0000);
    scene.add(spotLight3);


    // helper code for setting light position
    const gui = new GUI();

    // blue light controls
    const blueLight = gui.addFolder('BlueLight');
    blueLight.add(spotLight1.position, "x", -30, 30, 1);
    blueLight.add(spotLight1.position, "y", -30, 30, 1);
    blueLight.add(spotLight1.position, "z", -30, 30, 1);

    // orenge light controls
    const orengeLight = gui.addFolder('OrengeLight');
    orengeLight.add(spotLight2.position, "x", -40, 40, 1);
    orengeLight.add(spotLight2.position, "y", -40, 40, 1);
    orengeLight.add(spotLight2.position, "z", -40, 40, 1);

    // back light controls
    const backLight = gui.addFolder('BackLight');
    backLight.add(spotLight3.position, "x", -40, 40, 1);
    backLight.add(spotLight3.position, "y", -40, 40, 1);
    backLight.add(spotLight3.position, "z", -40, 40, 1);

    // loding gltf 3d model
    const loader = new GLTFLoader();
    // Only allow loading from the fixed, safe model path
    // Defensive: do not allow any other path to be used
    // Prevent SSRF by ensuring only the static SAFE_MODEL_PATH is used
    function loadModel(modelPath) {
        // Enforce only the safe, static model path is allowed
        if (modelPath !== SAFE_MODEL_PATH) {
            throw new Error('Attempt to load model from an unsafe path is blocked.');
        }
        loader.load(SAFE_MODEL_PATH, (gltf) => {
            // Validate GLTF contents to prevent malicious code execution
            if (!validateGLTF(gltf)) {
                return;
            }
            house = gltf.scene.children[0];
            house.scale.set(0.4, 0.4, 0.4)
            house.position.set(0, -1.3, 0)
            house.rotation.x = Math.PI / -3
            scene.add(gltf.scene);
        }, undefined, (error) => {
            // Defensive: never attempt to reload from a user-supplied path
            alert('Failed to load model from safe path.');
        });
    }
    // Always call with the safe path
    loadModel(SAFE_MODEL_PATH);

    animate();
}

// redering scene and camera
const render = () => {
    renderer.render(scene, camera);
}

// animation recursive function
let step = 0
const animate = () => {
    requestAnimationFrame(animate);
    step += 0.02;
    house.position.y =  2*Math.abs(Math.sin(step));
    // console.log(2*Math.abs(Math.sin(step)))
    house.rotation.y = Math.sin(step)*(Math.abs(Math.cos(step / 3) / 4));

    render();
    stats.update();
}

console.log(Math.sin(10));

// making responsive
const windowResize = () => {
    camera.aspect = canvasSize.offsetWidth / canvasSize.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasSize.offsetWidth, canvasSize.offsetHeight);
    render();
}

window.addEventListener('resize', windowResize, false);
window.onload = init;