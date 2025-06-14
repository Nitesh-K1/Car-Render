import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { carObjectRef } from '../refs'

export default function MovingCar() {
  const carRef = useRef()
  carObjectRef.current = carRef

  const speed = 20
  const turnSpeed = 5
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

  useFrame((state, delta) => {
    const body = carRef.current
    if (!body) return

    const impulse = new THREE.Vector3()
    const torque = new THREE.Vector3()

    const rot = body.rotation()
    const quaternion = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)

    if (keysPressed['w'] || keysPressed['arrowup']) {
      impulse.z = -speed * delta
    }
    if (keysPressed['s'] || keysPressed['arrowdown']) {
      impulse.z = speed * delta
    }

    if (impulse.lengthSq() > 0) {
      impulse.applyQuaternion(quaternion)
      body.applyImpulse(impulse, true)
    }

    if (keysPressed['a'] || keysPressed['arrowleft']) {
      torque.y += turnSpeed * delta
    }
    if (keysPressed['d'] || keysPressed['arrowright']) {
      torque.y -= turnSpeed * delta
    }

    if (torque.lengthSq() > 0) {
      body.applyTorqueImpulse(torque, true)
    }

    const pos = body.translation()
    const camOffset = new THREE.Vector3(0, 6, -12).applyQuaternion(quaternion)
    const camPos = new THREE.Vector3(pos.x, pos.y, pos.z).add(camOffset)
    state.camera.position.lerp(camPos, 0.1)
    state.camera.lookAt(pos.x, pos.y, pos.z)
  })

  return (
    <RigidBody
      ref={carRef}
      type="dynamic"
      mass={1}
      friction={1}
      restitution={0.3}
      angularDamping={4}
      linearDamping={1}
      colliders="hull"
    >
      <group scale={[1.5, 1.5, 1.5]}>
        <primitive object={scene} />
      </group>
    </RigidBody>
  )
}

useGLTF.preload('/models/car/scene.gltf')
