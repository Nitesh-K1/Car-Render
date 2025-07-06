import { RigidBody } from '@react-three/rapier'
import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'

export default function Ground() {
  const { scene } = useGLTF('/models/ground/scene.gltf')

  useEffect(() => {
    scene.scale.set(1.5, 2, 1)
    scene.position.set(0, 0, 0)
    scene.rotation.set(Math.PI, 0, Math.PI)
  }, [scene])

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={scene} receiveShadow />
    </RigidBody>
  )
}

useGLTF.preload('/models/ground/scene.gltf')
