import { RigidBody } from '@react-three/rapier'

export default function GoalPosts() {
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1, -48]}>
          <boxGeometry args={[10, 2, 1]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1, 48]}>
          <boxGeometry args={[10, 2, 1]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      </RigidBody>
    </>
  )
}
