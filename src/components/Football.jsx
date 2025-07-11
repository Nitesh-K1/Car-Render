import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { Vector3 } from 'three';

const Football = forwardRef(({ position }, ref) => {
  const body = useRef();
  const { scene } = useGLTF('/models/football/scene.gltf');
  const velocity = new Vector3();
  let goalCooldown = useRef(false); // To prevent multiple goal triggers in quick succession

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

  // This function will be called by App.js after a goal is scored
  const triggerResetAndCooldown = () => {
    if (goalCooldown.current) return;

    goalCooldown.current = true;
    reset(); // Reset ball position and velocity

    setTimeout(() => {
      goalCooldown.current = false;
    }, 2000); // Cooldown period
  };

  useFrame(() => {
    if (!body.current) return;
    // Speed clamping logic:
    const currentVelocity = body.current.linvel();
    velocity.set(currentVelocity.x, currentVelocity.y, currentVelocity.z);
    const maxSpeed = 40;
    if (velocity.length() > maxSpeed) {
      velocity.normalize().multiplyScalar(maxSpeed);
      body.current.setLinvel(velocity, true);
    }
  });

  useImperativeHandle(ref, () => ({
    triggerResetAndCooldown,
    getWorldPosition: () => { // Needed for camera to follow the ball
      if (body.current) {
        const pos = body.current.translation();
        return new Vector3(pos.x, pos.y, pos.z);
      }
      return new Vector3();
    },
    // Expose the body ref itself if direct manipulation is needed by CameraRig, though getWorldPosition is safer
    getRigidBody: () => body.current
  }));

  return (
    <RigidBody
      ref={body}
      name="ball" // Added name for GoalPosts detection
      colliders="ball"
      restitution={1}
      friction={0.7}
      linearDamping={0.3}
      position={position}
    >
      <primitive object={scene} />
    </RigidBody>
  );
});

useGLTF.preload('/models/football/scene.gltf');
export default Football;