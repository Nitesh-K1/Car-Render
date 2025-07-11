import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useState } from 'react'
import MovingCar from './components/MovingCar'
import Football from './components/Football'
import Ground from './components/Ground'
import GoalPosts from './components/GoalPosts'
import Walls from './components/Walls'
import CameraRig from './components/CameraRig'
import { carObjectRef, ballObjectRef } from './refs' // Import ballObjectRef
import { OrbitControls } from '@react-three/drei';


export default function App() {
  const [score, setScore] = useState({ teamA: 0, teamB: 0 })

  const handleGoal = (team) => {
    setScore((prev) => ({ ...prev, [team]: prev[team] + 1 }));
    if (ballObjectRef.current && typeof ballObjectRef.current.triggerResetAndCooldown === 'function') {
      ballObjectRef.current.triggerResetAndCooldown();
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}> {/* Initial camera pos, CameraRig will take over */}
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} castShadow />
        <directionalLight position={[0, 10, 0]} intensity={3} castShadow />
        <hemisphereLight intensity={1} />
        <Physics>
          <MovingCar />
          {/* Pass ballObjectRef to Football and remove onGoal as it's handled by GoalPosts + App's handleGoal */}
          <Football ref={ballObjectRef} position={[0, 1, 0]} />
          <Ground />
          <GoalPosts onGoal={handleGoal} />
          <Walls />
        </Physics>
        {/* Pass ballObjectRef to CameraRig */}
        <CameraRig targetRef={ballObjectRef} />
        {/* The OrbitControls are now managed by CameraRig.jsx, so the instance here is removed. */}
      </Canvas>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        fontSize: '1.5rem',
        color: 'white',
        background: 'rgba(0,0,0,0.5)',
        padding: '10px',
        borderRadius: '10px'
      }}>
        🟥 Team A: {score.teamA} | 🟦 Team B: {score.teamB}
      </div>
    </div>
  )
}
