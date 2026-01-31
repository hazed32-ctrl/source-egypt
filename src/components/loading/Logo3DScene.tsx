import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, useTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';
import sourceLogo from '@/assets/source-logo.svg';

const Logo3D = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Create texture from SVG
  const texture = useTexture(sourceLogo);
  
  // Configure texture
  useMemo(() => {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  // Slow rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      // Slow Y-axis rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      // Subtle X tilt
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
    if (glowRef.current) {
      // Pulsing glow
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  // Gold color for rim light effect
  const goldColor = new THREE.Color('#C9A962');

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.1}
      floatIntensity={0.3}
    >
      <group>
        {/* Glow plane behind logo */}
        <mesh ref={glowRef} position={[0, 0, -0.1]}>
          <planeGeometry args={[2.5, 2.5]} />
          <meshBasicMaterial
            color={goldColor}
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Main logo plane */}
        <mesh ref={meshRef}>
          <planeGeometry args={[2, 2]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
            metalness={0.3}
            roughness={0.4}
            emissive={goldColor}
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Rim light effect - subtle gold edge */}
        <mesh position={[0, 0, -0.05]} scale={1.02}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial
            color={goldColor}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </Float>
  );
};

const Logo3DScene = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        {/* Ambient light */}
        <ambientLight intensity={0.4} />
        
        {/* Gold-tinted rim lights */}
        <pointLight
          position={[3, 3, 2]}
          intensity={1}
          color="#C9A962"
        />
        <pointLight
          position={[-3, -1, 2]}
          intensity={0.5}
          color="#C9A962"
        />
        
        {/* Subtle backlight for depth */}
        <pointLight
          position={[0, 0, -3]}
          intensity={0.3}
          color="#ffffff"
        />

        {/* Environment for realistic reflections */}
        <Environment preset="night" />
        
        <Logo3D />
      </Canvas>
    </div>
  );
};

export default Logo3DScene;
