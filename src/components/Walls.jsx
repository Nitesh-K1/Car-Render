import { RigidBody } from '@react-three/rapier'

export default function FutsalWalls() {
  const wallThickness = 1
  const wallHeight = 5
  const fieldSize = 50

  return (
    <>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, wallHeight / 2, fieldSize]}>
          <boxGeometry args={[fieldSize * 2, wallHeight, wallThickness]} />
          <meshStandardMaterial color="red" transparent opacity={0.3} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, wallHeight / 2, -fieldSize]}>
          <boxGeometry args={[fieldSize * 2, wallHeight, wallThickness]} />
          <meshStandardMaterial color="red" transparent opacity={0.3} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-fieldSize, wallHeight / 2, 0]}>
          <boxGeometry args={[wallThickness, wallHeight, fieldSize * 2]} />
          <meshStandardMaterial color="red" transparent opacity={0.3} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[fieldSize, wallHeight / 2, 0]}>
          <boxGeometry args={[wallThickness, wallHeight, fieldSize * 2]} />
          <meshStandardMaterial color="red" transparent opacity={0.3} />
        </mesh>
      </RigidBody>
    </>
  )
}
