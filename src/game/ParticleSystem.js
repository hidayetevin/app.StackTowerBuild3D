import * as THREE from 'three';

export class ParticleSystem {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.particles = [];
        this.maxParticles = 50;

        // Geometry for a single particle (reused)
        this.particleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        this.particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    }

    spawnParticles(position, color, count = 10) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break; // Limit active particles

            const mesh = new THREE.Mesh(this.particleGeometry, this.particleMaterial.clone());
            mesh.material.color.setHex(color);
            mesh.position.copy(position);

            // Random offset
            mesh.position.x += (Math.random() - 0.5) * 1.0;
            mesh.position.y += (Math.random() - 0.5) * 0.2;
            mesh.position.z += (Math.random() - 0.5) * 1.0;

            const particle = {
                mesh: mesh,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 5,
                    (Math.random() * 5) + 2, // Upward burst
                    (Math.random() - 0.5) * 5
                ),
                life: 1.0 // 1 second life
            };

            this.sceneManager.add(mesh);
            this.particles.push(particle);
        }
    }

    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Physics
            p.velocity.y -= 15 * delta; // Gravity
            p.mesh.position.addScaledVector(p.velocity, delta);
            p.mesh.rotation.x += p.velocity.z * delta;
            p.mesh.rotation.z += p.velocity.x * delta;

            // Life
            p.life -= delta;
            p.mesh.scale.setScalar(p.life); // Shrink

            if (p.life <= 0) {
                this.sceneManager.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }
    }
}
