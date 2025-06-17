import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { carObjectRef } from '../refs'

export default function MovingCar() {
  const carRef = useRef()
  carObjectRef.current = carRef

  const maxSpeed = 10
  const acceleration = 0.2
  const turnSpeed = 1.5
  const [keysPressed, setKeysPressed] = useState({})
  const [velocity, setVelocity] = useState(0)
  const [rotation, setRotation] = useState(0)

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

  useFrame((state, delta) => {
  const body = carRef.current
  if (!body || !body.translation) return

  const pos = body.translation()
  const position = new THREE.Vector3(pos.x, pos.y, pos.z)

  const moveForward = keysPressed['w'] || keysPressed['arrowup']
  const moveBackward = keysPressed['s'] || keysPressed['arrowdown']
  const turnLeft = keysPressed['a'] || keysPressed['arrowleft']
  const turnRight = keysPressed['d'] || keysPressed['arrowright']
  const braking = keysPressed['f']

  let newVelocity = velocity

  if (braking) {
    newVelocity = 0
    body.setLinvel({ x: 0, y: body.linvel().y, z: 0 }, true) // stop immediately
  } else if (moveForward) {
    newVelocity = Math.max(-maxSpeed, velocity - acceleration)
  } else if (moveBackward) {
    newVelocity = Math.min(maxSpeed, velocity + acceleration)
  } else {
    newVelocity *= 0.95 // natural deceleration
  }

  setVelocity(newVelocity)

  let newRotation = rotation
  if (turnLeft) newRotation += turnSpeed * delta
  if (turnRight) newRotation -= turnSpeed * delta
  setRotation(newRotation)

  const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, newRotation, 0))
  const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(quat).normalize()
  const movement = forwardDir.clone().multiplyScalar(newVelocity)

  body.setLinvel({ x: movement.x, y: body.linvel().y, z: movement.z }, true)
  body.setRotation(quat, true)

  const cameraOffset = new THREE.Vector3(0, 6, -12).applyQuaternion(quat)
  const camPos = position.clone().add(cameraOffset)
  state.camera.position.lerp(camPos, 0.1)
  state.camera.lookAt(position)
})



  return (
    <RigidBody
      ref={carRef}
      type="dynamic"
      colliders="hull"
      linearDamping={1.5}
      angularDamping={3}
      friction={1}
    >
      <group scale={[1.5, 1.5, 1.5]}>
        <primitive object={scene} />
      </group>
    </RigidBody>
  )
}

useGLTF.preload('/models/car/scene.gltf')
