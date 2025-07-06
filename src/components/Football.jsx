import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { Vector3 } from 'three';
export default function Football({ position, onGoal }) {
  const body = useRef();
  const { scene } = useGLTF('/models/football/scene.gltf');
  const velocity = new Vector3();
  let goalCooldown = useRef(false);
  useEffect(() => {
    scene.scale.set(3, 3, 3);
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
  }, [scene]);
  const reset = () => {
    if (!body.current) return;
    body.current.setTranslation({ x: 0, y: 1, z: 0 }, true);
    body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
  };
  useFrame(() => {
    if (!body.current) return;
    if (goalCooldown.current) return;

    const pos = body.current.translation();

    if (pos.z < -48 && Math.abs(pos.x) < 5) {
      goalCooldown.current = true;
      onGoal('teamB');
      reset();
      setTimeout(() => {
        goalCooldown.current = false;
      }, 2000);
    } else if (pos.z > 48 && Math.abs(pos.x) < 5) {
      goalCooldown.current = true;
      onGoal('teamA');
      reset();
      setTimeout(() => {
        goalCooldown.current = false;
      }, 2000);
    }
    const currentVelocity = body.current.linvel();
    velocity.set(currentVelocity.x, currentVelocity.y, currentVelocity.z);
    const maxSpeed = 40;
    if (velocity.length() > maxSpeed) {
      velocity.normalize().multiplyScalar(maxSpeed);
      body.current.setLinvel(velocity, true);
    }
  });
  return (
    <RigidBody
      ref={body}
      colliders="ball"
      restitution={1}
      friction={0.7}
      linearDamping={0.3}
      position={position}
    >
      <primitive object={scene} />
    </RigidBody>
  );
}
useGLTF.preload('/models/football/scene.gltf');