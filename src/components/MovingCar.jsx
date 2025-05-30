import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { carObjectRef } from '../refs'

export default function MovingCar() {
  const carRef = useRef()
  carObjectRef.current = carRef

  const speed = 0.3
  const turnSpeed = 0.01
  const [rotationY, setRotationY] = useState(0)
  const [keysPressed, setKeysPressed] = useState({})

  // Use scene instead of nodes
  const { scene } = useGLTF('/models/scene.gltf')

  useEffect(() => {
    const handleKeyDown = (e) =>
      setKeysPressed((k) => ({ ...k, [e.key.toLowerCase()]: true }))
    const handleKeyUp = (e) =>
      setKeysPressed((k) => ({ ...k, [e.key.toLowerCase()]: false }))

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(({ camera }) => {
    if (!carRef.current) return

    const body = carRef.current
    const posRaw = body.translation()
    const pos = new THREE.Vector3(posRaw.x, posRaw.y, posRaw.z)

    // Steering
    if (keysPressed['a'] || keysPressed['arrowleft'])
      setRotationY((r) => r + turnSpeed)
    if (keysPressed['d'] || keysPressed['arrowright'])
      setRotationY((r) => r - turnSpeed)

    // Movement
    let direction = 0
    if (keysPressed['w'] || keysPressed['arrowup']) direction = 1
    if (keysPressed['s'] || keysPressed['arrowdown']) direction = -1

    const forwardX = Math.sin(rotationY) * direction
    const forwardZ = Math.cos(rotationY) * direction
    const move = new THREE.Vector3(forwardX, 0, forwardZ)
      .normalize()
      .multiplyScalar(speed)

    body.setNextKinematicTranslation({
      x: pos.x + move.x,
      y: pos.y,
      z: pos.z + move.z
    })

    const quaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, rotationY, 0)
    )
    body.setNextKinematicRotation(quaternion)

    // Camera follow
    const scaleFactor = 0.5
    const cameraOffset = new THREE.Vector3(
      Math.sin(rotationY + Math.PI) * 20 * scaleFactor,
      12 * scaleFactor,
      Math.cos(rotationY + Math.PI) * 20 * scaleFactor
    )
    const cameraTarget = pos.clone().add(cameraOffset)
    camera.position.lerp(cameraTarget, 0.1)
    camera.lookAt(pos)
  })

  return (
    <RigidBody
      ref={carRef}
      type="kinematicPosition"
      colliders="hull"
    >
      <group
        scale={[1.5, 1.5, 1.5]}
        dispose={null}
      >
        <primitive object={scene} />
      </group>
    </RigidBody>
  )
}

// Preload GLTF
useGLTF.preload('/models/scene.gltf')
