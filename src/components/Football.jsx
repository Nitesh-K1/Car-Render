import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { Vector3 } from 'three'; // Import Vector3 from Three.js

export default function Football({ position, onGoal }) {
  const body = useRef();
  const { scene } = useGLTF('/models/football/scene.gltf');
  const velocity = new Vector3(); // Reusable Vector3 for calculations

  useEffect(() => {
    scene.scale.set(3, 3, 3);
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
  }, [scene]);

  useFrame(() => {
    if (!body.current) return;

    // Goal detection logic
    // const pos = body.current.translation();
    // if (pos.z < -48 && Math.abs(pos.x) < 5) {
    //   onGoal('teamB');
    //   reset();
    // } else if (pos.z > 48 && Math.abs(pos.x) < 5) {
    //   onGoal('teamA');
    //   reset();
    // }

    // Speed limiting logic
    const currentVelocity = body.current.linvel();
    velocity.set(currentVelocity.x, currentVelocity.y, currentVelocity.z); // Convert to Vector3
    const maxSpeed = 40; // Adjust this value

    if (velocity.length() > maxSpeed) {
      velocity.normalize().multiplyScalar(maxSpeed); // Clamp speed
      body.current.setLinvel(velocity, true);
    }
  });

  const reset = () => {
    if (!body.current) return;
    body.current.setTranslation({ x: 0, y: 1, z: 0 }, true);
    body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
  };

  return (
    <RigidBody
      ref={body}
      colliders="ball"
      restitution={1}  // Reduced for less bounce
      friction={0.7}
      linearDamping={0.3} 
      position={position}
    >
      <primitive object={scene} />
    </RigidBody>
  );
}

useGLTF.preload('/models/football/scene.gltf');