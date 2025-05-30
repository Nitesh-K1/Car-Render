import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { useGLTF } from '@react-three/drei'
export default function Football({ position, onGoal }) {
  const body = useRef()
  const { scene } = useGLTF('/models/football/scene.gltf')
  scene.scale.set(0.5, 0.5, 0.5)
  scene.position.set(0, 0, 0)
  scene.rotation.set(0, 0, 0)
  useFrame(() => {
    const pos = body.current.translation()
    if (pos.z < -48 && Math.abs(pos.x) < 5) {
      onGoal('teamB')
      reset()
    } else if (pos.z > 48 && Math.abs(pos.x) < 5) {
      onGoal('teamA')
      reset()
    }
  })
  const reset = () => {
    body.current.setTranslation({ x: 0, y: 1, z: 0 }, true)
    body.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    body.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }
  return (
    <RigidBody
      ref={body}
      colliders="ball"
      restitution={0.9}
      friction={0.3}
      position={position}
    >
      <primitive object={scene} />
    </RigidBody>
  )
}
useGLTF.preload('/models/football/scene.gltf')