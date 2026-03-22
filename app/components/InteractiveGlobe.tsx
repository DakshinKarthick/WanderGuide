"use client"

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15
    }
  })

  // Create a stylized material for the globe
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.9, // glass-like
    thickness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  }), [])

  // Inner core to give depth
  const coreMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fbbf24', // amber-400
    roughness: 0.4,
    metalness: 0.8,
    emissive: '#d97706',
    emissiveIntensity: 0.5,
  }), [])

  return (
    <group>
      <Sphere ref={meshRef} args={[2.5, 32, 32]}>
        <primitive object={material} attach="material" />
      </Sphere>
      <Sphere args={[1.2, 32, 32]}>
        <primitive object={coreMaterial} attach="material" />
      </Sphere>
    </group>
  )
}

export function InteractiveGlobe({ className = "" }: { className?: string }) {
  return (
    <div className={`relative cursor-grab active:cursor-grabbing ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, 10, -10]} intensity={2} color="#4f46e5" /> {/* indigo */}
        <pointLight position={[10, -10, 10]} intensity={2} color="#f59e0b" /> {/* amber */}
        
        <Globe />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={1.5} 
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
