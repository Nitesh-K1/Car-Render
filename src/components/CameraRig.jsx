import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useRef, useEffect } from 'react'

export default function CameraRig({ targetRef }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  const cameraOffset = new THREE.Vector3(0, 6, -10)
  const cameraTarget = new THREE.Vector3()

  useEffect(() => {
    camera.fov = 75
    camera.updateProjectionMatrix()
  }, [])

  useFrame(() => {
    const body = targetRef.current
    if (!body || typeof body.translation !== 'function') return

    const pos = body.translation()
    cameraTarget.set(pos.x, pos.y, pos.z)
    const finalCameraPos = cameraTarget.clone().add(cameraOffset)
    camera.position.lerp(finalCameraPos, 0.1)

    if (controlsRef.current) {
      controlsRef.current.target.lerp(cameraTarget, 0.1)
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      maxDistance={20}
      minDistance={5}
      enableDamping
      dampingFactor={0.1}
    />
  )
}
