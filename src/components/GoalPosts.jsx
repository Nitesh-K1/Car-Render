import { RigidBody } from '@react-three/rapier'

export default function GoalPosts({ onGoal }) {
  return (
    <>
      {/* Team A Goal (Blue Side) */}
      <RigidBody 
        type="fixed" 
        sensor // Makes it a trigger (no physical collision)
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === "ball") {
            onGoal('teamA') // Trigger goal for Team A
          }
        }}
      >
        <mesh position={[0, 1, 48]}>
          <boxGeometry args={[10, 2, 0.1]} /> {/* Thin, barely visible */}
          <meshStandardMaterial color="yellow" transparent opacity={0.5} />
        </mesh>
      </RigidBody>

      {/* Team B Goal (Red Side) */}
      <RigidBody 
        type="fixed" 
        sensor 
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === "ball") {
            onGoal('teamB') // Trigger goal for Team B
          }
        }}
      >
        <mesh position={[0, 1, -48]}>
          <boxGeometry args={[10, 2, 0.1]} />
          <meshStandardMaterial color="yellow" transparent opacity={0.5} />
        </mesh>
      </RigidBody>
    </>
  )
}