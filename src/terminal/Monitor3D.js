/**
 * Monitor3D.js - Lightweight 3D CRT Monitor with CSS3D Terminal
 * Terminal is mapped directly to the 3D screen using CSS3DRenderer
 * Interactive Power Button included
 */

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { TerminalPortfolio } from './TerminalPortfolio.js';

class Monitor3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cssRenderer = null;
        this.monitor = null;
        this.led = null;
        this.screenLight = null;
        this.cssObject = null;

        this.isOn = true;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();
    }

    init() {
        this.setupScene();
        this.createMonitor();
        this.setupLights();
        this.attachTerminalToScreen();
        this.setupEventListeners();
        this.animate();

        // Start BIOS sequence on boot
        setTimeout(() => this.runBiosSequence(), 100);
    }

    setupScene() {
        const container = document.getElementById('scene-container');

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x2a2015);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0.3, 5);

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // CSS3D Renderer (for HTML elements in 3D space)
        this.cssRenderer = new CSS3DRenderer();
        this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        this.cssRenderer.domElement.style.position = 'absolute';
        this.cssRenderer.domElement.style.top = '0';
        this.cssRenderer.domElement.style.left = '0';
        this.cssRenderer.domElement.style.pointerEvents = 'none'; // Allow clicking through to WebGL
        container.appendChild(this.cssRenderer.domElement);

        // Make terminal wrapper receive pointer events for typing/scrolling
        document.getElementById('terminal-wrapper').style.pointerEvents = 'auto';
    }

    createMonitor() {
        this.monitor = new THREE.Group();

        // Colors
        const beigeColor = 0xd4c8b0;
        const darkBeige = 0xa89880;

        // Materials
        const beigeMaterial = new THREE.MeshStandardMaterial({
            color: beigeColor,
            roughness: 0.8,
            metalness: 0.1
        });

        const darkBeigeMaterial = new THREE.MeshStandardMaterial({
            color: darkBeige,
            roughness: 0.9,
            metalness: 0.1
        });

        // Monitor body (main frame)
        const bodyGeometry = new THREE.BoxGeometry(3.2, 2.5, 1.6);
        const body = new THREE.Mesh(bodyGeometry, beigeMaterial);
        body.position.y = 0.25;
        body.castShadow = true;
        body.receiveShadow = true;

        // Screen bezel (dark inset)
        const bezelGeometry = new THREE.BoxGeometry(2.75, 2.1, 0.12);
        const bezel = new THREE.Mesh(bezelGeometry, darkBeigeMaterial);
        bezel.position.set(0, 0.3, 0.75);

        // Bottom panel with brand
        const panelGeometry = new THREE.BoxGeometry(3.2, 0.22, 0.25);
        const panel = new THREE.Mesh(panelGeometry, beigeMaterial);
        panel.position.set(0, -0.95, 0.68);

        // Control knobs
        const knobGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.07, 16);
        const knobMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });

        const knob1 = new THREE.Mesh(knobGeometry, knobMaterial);
        knob1.rotation.x = Math.PI / 2;
        knob1.position.set(1.1, -0.95, 0.83);

        const knob2 = new THREE.Mesh(knobGeometry, knobMaterial);
        knob2.rotation.x = Math.PI / 2;
        knob2.position.set(1.28, -0.95, 0.83);

        // Power LED / Button
        const ledGeometry = new THREE.SphereGeometry(0.04, 16, 16); // Slightly larger for clicking
        const ledMaterial = new THREE.MeshBasicMaterial({ color: 0x33ff33 });
        this.led = new THREE.Mesh(ledGeometry, ledMaterial);
        this.led.position.set(1.45, -0.95, 0.83);
        this.led.userData = { isPowerButton: true };

        // Invisible hit box for easier clicking
        const hitBoxGeo = new THREE.BoxGeometry(0.15, 0.15, 0.1);
        const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
        hitBox.position.copy(this.led.position);
        hitBox.userData = { isPowerButton: true };
        this.monitor.add(hitBox);

        // Stand neck
        const neckGeometry = new THREE.BoxGeometry(0.45, 0.35, 0.55);
        const neck = new THREE.Mesh(neckGeometry, beigeMaterial);
        neck.position.set(0, -1.35, 0);
        neck.castShadow = true;

        // Stand base
        const baseGeometry = new THREE.CylinderGeometry(0.7, 0.9, 0.12, 32);
        const base = new THREE.Mesh(baseGeometry, beigeMaterial);
        base.position.set(0, -1.58, 0);
        base.castShadow = true;
        base.receiveShadow = true;

        // Add all parts to monitor group
        this.monitor.add(body);
        this.monitor.add(bezel);
        this.monitor.add(panel);
        this.monitor.add(knob1);
        this.monitor.add(knob2);
        this.monitor.add(this.led);
        this.monitor.add(neck);
        this.monitor.add(base);

        this.scene.add(this.monitor);

        // Desk surface
        const deskGeometry = new THREE.BoxGeometry(7, 0.08, 3.5);
        const deskMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b6914,
            roughness: 0.6,
            metalness: 0.1
        });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.set(0, -1.65, 0.5);
        desk.receiveShadow = true;
        this.scene.add(desk);

        // Back wall
        const wallGeometry = new THREE.PlaneGeometry(9, 5);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xc4b090,
            roughness: 0.9
        });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(0, 0.5, -1.5);
        wall.receiveShadow = true;
        this.scene.add(wall);
    }

    setupLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xfff5e6, 0.5);
        this.scene.add(ambient);

        // Key light (warm, from side)
        const keyLight = new THREE.DirectionalLight(0xfff0d0, 0.9);
        keyLight.position.set(3, 3, 4);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.radius = 4;
        this.scene.add(keyLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0xe0f0ff, 0.3);
        fillLight.position.set(-2, 2, 2);
        this.scene.add(fillLight);

        // Screen glow light
        this.screenLight = new THREE.PointLight(0xff8c00, 0.4, 3);
        this.screenLight.position.set(0, 0.3, 1.8);
        this.scene.add(this.screenLight);
    }

    attachTerminalToScreen() {
        // Get the terminal wrapper element
        const terminalWrapper = document.getElementById('terminal-wrapper');

        // Create CSS3D object from the terminal
        this.cssObject = new CSS3DObject(terminalWrapper);

        // Scale and position to match the 3D screen (2.6 units wide / 800px = 0.00325)
        // CSS3DObject uses pixel units, so we scale down
        this.cssObject.scale.set(0.00325, 0.00325, 0.00325);
        this.cssObject.position.set(0, 0.35, 0.94); // Moved slightly forward to avoid z-fighting

        // Add to monitor group so it rotates with the monitor
        this.monitor.add(this.cssObject);
    }

    setupEventListeners() {
        // Click listener for power button
        window.addEventListener('click', (e) => this.handleClick(e));

        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    handleClick(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.monitor.children, true);

        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.userData.isPowerButton) {
                this.togglePower();
                break;
            }
        }
    }

    togglePower() {
        this.isOn = !this.isOn;
        this.playClickSound();

        if (this.isOn) {
            // TURN ON
            this.led.material.color.setHex(0x33ff33); // Green
            this.screenLight.intensity = 0.4;

            // Show CSS object but keep terminal hidden initially
            if (this.cssObject) this.cssObject.visible = true;

            // Run BIOS Sequence
            this.runBiosSequence();

        } else {
            // TURN OFF
            this.led.material.color.setHex(0x330000); // Dark red/off
            this.screenLight.intensity = 0;

            // Hide everything
            if (this.cssObject) this.cssObject.visible = false;
            document.getElementById('bios-screen').style.display = 'none';
            document.getElementById('terminal').style.display = 'none';
        }
    }

    runBiosSequence() {
        const biosScreen = document.getElementById('bios-screen');
        const terminal = document.getElementById('terminal');
        const memoryCount = document.getElementById('memory-count');
        const biosCheckList = document.getElementById('bios-check-list');
        const biosStatus = document.getElementById('bios-status');

        // Reset state
        biosScreen.style.display = 'flex';
        terminal.style.display = 'none';
        memoryCount.textContent = '0';
        if (biosCheckList) biosCheckList.innerHTML = '';
        if (biosStatus) biosStatus.innerHTML = '';

        let memory = 0;
        const totalMemory = 64000;
        const step = 1200;

        const countMemory = () => {
            memory += step;
            if (memory > totalMemory) memory = totalMemory;
            memoryCount.textContent = memory;

            if (memory < totalMemory) {
                requestAnimationFrame(countMemory);
            } else {
                // Memory done, start check sequence
                startSystemChecks();
            }
        };

        const addCheck = (text, delay) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    if (!biosCheckList) { resolve(); return; }

                    const line = document.createElement('div');
                    line.className = 'check-item';
                    line.innerHTML = `<span>${text}</span><span class="check-status">...</span>`;
                    biosCheckList.appendChild(line);

                    setTimeout(() => {
                        const status = line.querySelector('.check-status');
                        if (status) status.textContent = 'OK';
                        resolve();
                    }, 300);
                }, delay);
            });
        };

        const startSystemChecks = async () => {
            await addCheck('Initializing QUANTUM-CORE CPU', 400);
            await addCheck('Verifying NEURAL-DISPLAY Adapter', 300);
            await addCheck('Checking NVRAM Integrity', 200);
            await addCheck('Mounting SPANDAN-FS Volume', 300);
            await addCheck('Loading KERNEL Modules', 300);

            setTimeout(() => {
                const line = document.createElement('div');
                line.style.marginTop = '10px';
                line.style.color = '#fff';
                line.textContent = 'Booting Operating System...';
                biosStatus.appendChild(line);

                setTimeout(() => {
                    // Transition to terminal
                    biosScreen.style.display = 'none';
                    terminal.style.display = 'flex';

                    // Clear terminal and start boot
                    const terminalOutput = document.getElementById('terminal-output');
                    if (terminalOutput) terminalOutput.innerHTML = '';
                    new TerminalPortfolio();
                }, 1500);
            }, 500);
        };

        // Start sequence
        setTimeout(countMemory, 500);
    }

    playClickSound() {
        // Simple mechanical click sound
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Monitor stays fixed - no rotation

        this.renderer.render(this.scene, this.camera);
        this.cssRenderer.render(this.scene, this.camera);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new Monitor3D();
});
