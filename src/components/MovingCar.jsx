import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, useRapier } from '@react-three/rapier'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { carObjectRef } from '../refs'

export default function MovingCar() {
  const carRef = useRef()
  carObjectRef.current = carRef
  const maxSpeed = 20
  const acceleration = 0.8
  const turnSpeed = 1.5
  const [keysPressed, setKeysPressed] = useState({})
  const [velocity, setVelocity] = useState(0)
  const [rotation, setRotation] = useState(0)
  const { camera } = useThree()
  const engineSoundRef = useRef()
  const bouncingRef = useRef(false)
  const { scene } = useGLTF('/models/car/scene.gltf')
  const { world } = useRapier()

  useEffect(() => {
    const listener = new THREE.AudioListener()
    camera.add(listener)
    const sound = new THREE.Audio(listener)
    const loader = new THREE.AudioLoader()
    loader.load('/models/engine.mp3', (buffer) => {
      sound.setBuffer(buffer)
      sound.setLoop(true)
      sound.setVolume(0.5)
    })
    engineSoundRef.current = sound
    return () => {
      camera.remove(listener)
      sound.stop()
    }
  }, [camera])

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
    if (bouncingRef.current) return
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
      body.setLinvel({ x: 0, y: body.linvel().y, z: 0 }, true)
    } else if (moveForward) {
      newVelocity = Math.max(-maxSpeed, velocity - acceleration)
    } else if (moveBackward) {
      newVelocity = Math.min(maxSpeed, velocity + acceleration)
    } else {
      newVelocity *= 0.95
    }
    setVelocity(newVelocity)

    const sound = engineSoundRef.current
    if (sound && sound.buffer) {
      if (Math.abs(newVelocity) > 0.1) {
        if (!sound.isPlaying) sound.play()
      } else {
        if (sound.isPlaying) sound.stop()
      }
    }

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
  restitution={1}
  onCollisionEnter={({ other }) => {
    if (other.rigidBodyObject?.name === 'wall') {
      bouncingRef.current = true
      setTimeout(() => {
        bouncingRef.current = false
      }, 200)
    }
  }}
>
  <group scale={[1.5, 1.5, 1.5]}>
    <primitive object={scene} />
  </group>
</RigidBody>

  )
}

useGLTF.preload('/models/car/scene.gltf')
