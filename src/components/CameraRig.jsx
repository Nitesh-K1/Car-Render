import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'

export default function CameraRig({ targetRef }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  
  // Camera settings for FIFA style (will need tuning)
  const cameraOffset = new THREE.Vector3(0, 15, 25) // Higher, further back
  const cameraTarget = new THREE.Vector3()
  // const cameraLookAhead = new THREE.Vector3() // May not use lookAhead as much, or differently
  
  // For smooth damping
  const positionDamping = 0.1 // Adjusted damping
  const targetDamping = 0.1   // Adjusted damping
  // const velocityFactor = 0.2 // Reduced velocity factor for look-ahead if used

  useFrame((state, delta) => {
    if (!targetRef.current) return;
    
    const footballComponent = targetRef.current;
    const body = typeof footballComponent.getRigidBody === 'function' ? footballComponent.getRigidBody() : null;
    
    if (!body || typeof body.translation !== 'function') return;

    // Get current ball position
    const ballWorldPos = body.translation(); // This is a {x, y, z} object from Rapier
    
    // For FIFA, the camera target is usually just the ball's position or slightly above it.
    // Let's try focusing directly on the ball's XZ plane, with a slight Y offset for height.
    cameraTarget.set(ballWorldPos.x, ballWorldPos.y + 1, ballWorldPos.z); // Look at the ball, slightly elevated

    // Calculate desired camera position based on offset from the ball
    // The offset determines the camera's angle and distance.
    // For a typical side-view FIFA camera, X offset might change based on ball position relative to field center.
    // For a simpler "behind the ball" FIFA cam:
    const desiredCameraPos = new THREE.Vector3(ballWorldPos.x, ballWorldPos.y, ballWorldPos.z).add(cameraOffset);
    
    // Smooth damping for camera position
    camera.position.lerp(desiredCameraPos, positionDamping * delta * 60)
    
    // Update controls target with damping
    if (controlsRef.current) {
      const currentTarget = controlsRef.current.target
      currentTarget.lerp(cameraTarget, targetDamping * delta * 60)
      controlsRef.current.update()
    }
    
    // Make camera always look slightly ahead of the car
    camera.lookAt(cameraTarget)
  })

  return (
    <OrbitControls
      ref={controlsRef}
      target={cameraTarget} // Ensure OrbitControls also uses the damped target
      enablePan={true} // Re-enable pan if needed, or keep false for strict FIFA cam
      enableZoom={true} // Re-enable zoom if needed
      enableRotate={false} // Disable user rotation for a fixed FIFA style camera for now
      // maxPolarAngle={Math.PI * 0.45} // Adjust as needed for FIFA style
      // minPolarAngle={Math.PI * 0.25} // Adjust as needed
      minDistance={5} // Example: min zoom distance
      maxDistance={50} // Example: max zoom distance
      enableDamping
      dampingFactor={0.1} // Match damping
      // rotateSpeed={0.5}
    />
  )
}