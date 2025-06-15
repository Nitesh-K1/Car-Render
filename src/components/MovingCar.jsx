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
  const turnSpeed = 0.02
  const [rotationY, setRotationY] = useState(0)
  const [keysPressed, setKeysPressed] = useState({})
  const { scene } = useGLTF('/models/car/scene.gltf')

  useEffect(() => {
    const down = (e) => setKeysPressed((k) => ({ ...k, [e.key.toLowerCase()]: true }))
    const up = (e) => setKeysPressed((k) => ({ ...k, [e.key.toLowerCase()]: false }))
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((state) => {
    const body = carRef.current
    if (!body || !body.translation) return

    const pos = body.translation()
    const position = new THREE.Vector3(pos.x, pos.y, pos.z)

    if (keysPressed['a'] || keysPressed['arrowleft']) {
      setRotationY((r) => r + turnSpeed)
    }
    if (keysPressed['d'] || keysPressed['arrowright']) {
      setRotationY((r) => r - turnSpeed)
    }

    let direction = 0
    if (keysPressed['w'] || keysPressed['arrowup']) direction = 1
    if (keysPressed['s'] || keysPressed['arrowdown']) direction = -1

    const forwardX = Math.sin(rotationY) * direction
    const forwardZ = Math.cos(rotationY) * direction
    const move = new THREE.Vector3(forwardX, 0, forwardZ).normalize().multiplyScalar(speed)

    body.setNextKinematicTranslation({
      x: position.x + move.x,
      y: position.y,
      z: position.z + move.z,
    })

    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotationY, 0))
    body.setNextKinematicRotation(quat)

    const cameraOffset = new THREE.Vector3(0, 6, -12).applyQuaternion(quat)
    const camPos = position.clone().add(cameraOffset)
    state.camera.position.lerp(camPos, 0.1)
    state.camera.lookAt(position)
  })

  return (
    <RigidBody
      ref={carRef}
      type="kinematicPosition"
      colliders="hull"
    >
      <group scale={[1.5, 1.5, 1.5]}>
        <primitive object={scene} />
      </group>
    </RigidBody>
  )
}

useGLTF.preload('/models/car/scene.gltf')
