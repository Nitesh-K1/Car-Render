import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CameraRig({ targetRef }) {
  const cameraTarget = new THREE.Vector3()
  const cameraOffset = new THREE.Vector3(0, 6, -10)

  useFrame(({ camera }) => {
    const body = targetRef.current
    if (!body || typeof body.translation !== 'function') return

    const pos = body.translation()
    cameraTarget.set(pos.x, pos.y, pos.z)
    const finalCameraPos = cameraTarget.clone().add(cameraOffset)

    camera.position.lerp(finalCameraPos, 0.1)
    camera.lookAt(cameraTarget)
  })

  return null
}
