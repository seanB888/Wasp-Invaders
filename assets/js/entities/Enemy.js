// Enemy.js - Enemy (wasp) entity implementation
import { Entity } from './Entity.js';

export class Enemy extends Entity {
    constructor(scene, events) {
        super(scene, events);
    }
    
    /**
     * Create enemy mesh (wasp model)
     */
    createMesh() {
        const waspGroup = new THREE.Group();
        
        // Wasp body (two segments)
        const thoraxGeometry = new THREE.SphereGeometry(1, 16, 16);
        const thoraxMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
        const thorax = new THREE.Mesh(thoraxGeometry, thoraxMaterial);
        
        const abdomenGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const abdomenMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const abdomen = new THREE.Mesh(abdomenGeometry, abdomenMaterial);
        abdomen.position.z = -1.5;
        
        // Wasp head
        const headGeometry = new THREE.SphereGeometry(0.7, 16, 16);
        const head = new THREE.Mesh(headGeometry, thoraxMaterial);
        head.position.z = 1.2;
        
        // Wasp wings
        const wingGeometry = new THREE.PlaneGeometry(2, 1);
        const wingMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-1.2, 0.7, 0);
        leftWing.rotation.y = Math.PI / 4;
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(1.2, 0.7, 0);
        rightWing.rotation.y = -Math.PI / 4;
        
        // Wasp stripes
        for (let i = 0; i < 3; i++) {
            const stripeGeometry = new THREE.TorusGeometry(
                1.2,
                0.15,
                8,
                16,
                Math.PI / 2
            );
            const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.position.z = -1.5 - 0.4 * i;
            stripe.rotation.x = Math.PI / 2;
            waspGroup.add(stripe);
        }
        
        waspGroup.add(thorax);
        waspGroup.add(abdomen);
        waspGroup.add(head);
        waspGroup.add(leftWing);
        waspGroup.add(rightWing);
        
        this.mesh = waspGroup;
    }
    
    /**
     * Enemy shoots a bullet
     */
    shoot() {
        this.events.publish('enemy:shoot', {
            position: new THREE.Vector3(this.position.x, this.position.y - 2, 0),
            direction: -1
        });
    }
}