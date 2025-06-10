import { useEffect } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useGLTF } from '@react-three/drei'

export default function GoalPosts({ onGoal }) {
  const { scene: originalModel } = useGLTF('/models/goalpost/scene.gltf')
  
  // Create properly oriented copies for each side
  const teamAModel = originalModel.clone()
  const teamBModel = originalModel.clone()

  useEffect(() => {
    const scale = 1 // Adjust this as needed
    const goalWidth = 10 // Adjust goal width as needed
    
    // Position and scale both models
    teamAModel.scale.set(scale, scale, scale)
    teamBModel.scale.set(scale, scale, scale)
    
    // Rotate models to face each other
    teamAModel.rotation.y = Math.PI  // Face toward negative Z
    teamBModel.rotation.y = 0        // Face toward positive Z
    
    // Position the actual mesh within each group
    teamAModel.position.set(0, 0, 0)
    teamBModel.position.set(0, 0, 0)
  }, [teamAModel, teamBModel])

  return (
    <>
      {/* Team A Goal (Faces negative Z direction) */}
      <RigidBody 
        type="fixed" 
        sensor
        name="teamAGoal"
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === "ball") {
            onGoal('teamA')
          }
        }}
      >
        <group position={[0, 1, 48]}>
          <primitive object={teamAModel} />
          <mesh visible={false}>
            <boxGeometry args={[10, 2, 0.1]} />
          </mesh>
        </group>
      </RigidBody>

      {/* Team B Goal (Faces positive Z direction) */}
      <RigidBody 
        type="fixed" 
        sensor
        name="teamBGoal"
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === "ball") {
            onGoal('teamB')
          }
        }}
      >
        <group position={[0, 1, -48]}>
          <primitive object={teamBModel} />
          <mesh visible={false}>
            <boxGeometry args={[10, 2, 0.1]} />
          </mesh>
        </group>
      </RigidBody>
    </>
  )
}

useGLTF.preload('/models/goalpost/scene.gltf');