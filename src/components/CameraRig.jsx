import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'

export default function CameraRig({ targetRef }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  
  // Camera settings
  const cameraOffset = new THREE.Vector3(0, 5, -10) // Slightly lower height
  const cameraTarget = new THREE.Vector3()
  const cameraLookAhead = new THREE.Vector3()
  
  // For smooth damping
  const positionDamping = 0.15
  const targetDamping = 0.15
  const velocityFactor = 0.5 // How much velocity affects look-ahead

  useFrame((state, delta) => {
    const body = targetRef.current
    if (!body || typeof body.translation !== 'function') return

    // Get current position and velocity (if available)
    const pos = body.translation()
    const velocity = body.linvel ? body.linvel() : new THREE.Vector3()
    
    // Calculate look-ahead based on velocity
    cameraLookAhead.copy(velocity).multiplyScalar(velocityFactor)
    
    // Target position with look-ahead
    cameraTarget.set(
      pos.x + cameraLookAhead.x,
      pos.y + cameraLookAhead.y * 0.5, // Reduce vertical look-ahead
      pos.z + cameraLookAhead.z
    )
    
    // Calculate desired camera position
    const desiredCameraPos = new THREE.Vector3().copy(cameraTarget).add(cameraOffset)
    
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
      enablePan={false}
      enableZoom={false} // Disabled zoom for Rocket League feel
      maxPolarAngle={Math.PI * 0.45} // Limit how much you can look down
      minPolarAngle={Math.PI * 0.25} // Limit how much you can look up
      enableDamping
      dampingFactor={0.25} // Smoother damping
      rotateSpeed={0.5} // Slower rotation
    />
  )
}