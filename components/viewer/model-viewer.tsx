'use client';

import { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  Environment, 
  Center,
  Html,
  PerspectiveCamera,
  GizmoHelper,
  GizmoViewport
} from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Camera,
  Box,
  Grid3X3,
  Ruler
} from 'lucide-react';

interface ModelViewerProps {
  modelData?: {
    type: 'box' | 'custom';
    dimensions: { length: number; width: number; height: number };
    wallThickness?: number;
    cornerRadius?: number;
  };
  showGrid?: boolean;
  showDimensions?: boolean;
}

// Enclosure preview component
function EnclosurePreview({ 
  dimensions, 
  wallThickness = 2.5,
  showDimensions = true 
}: { 
  dimensions: { length: number; width: number; height: number };
  wallThickness?: number;
  showDimensions?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lidRef = useRef<THREE.Mesh>(null);
  
  // Convert mm to scene units (1 unit = 10mm for better viewport)
  const scale = 0.01;
  const l = dimensions.length * scale;
  const w = dimensions.width * scale;
  const h = dimensions.height * scale;
  const wall = wallThickness * scale;
  const lidHeight = 0.05; // 5mm lid

  return (
    <group>
      {/* Base/Bottom shell */}
      <mesh ref={meshRef} position={[0, h / 2 - lidHeight / 2, 0]}>
        <boxGeometry args={[l, h - lidHeight, w]} />
        <meshStandardMaterial 
          color="#4a9c6d" 
          transparent 
          opacity={0.85}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Inner cavity visualization */}
      <mesh position={[0, h / 2 - lidHeight / 2, 0]}>
        <boxGeometry args={[l - wall * 2, h - lidHeight - wall, w - wall * 2]} />
        <meshStandardMaterial 
          color="#2d5a40" 
          transparent 
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Lid */}
      <mesh ref={lidRef} position={[0, h - lidHeight / 2, 0]}>
        <boxGeometry args={[l, lidHeight, w]} />
        <meshStandardMaterial 
          color="#5ab87a" 
          transparent 
          opacity={0.9}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Dimension labels */}
      {showDimensions && (
        <>
          {/* Length label */}
          <Html position={[0, -0.15, w / 2 + 0.1]} center>
            <div className="bg-background/90 text-foreground px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap border border-border">
              {dimensions.length}mm
            </div>
          </Html>
          
          {/* Width label */}
          <Html position={[l / 2 + 0.1, -0.15, 0]} center>
            <div className="bg-background/90 text-foreground px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap border border-border">
              {dimensions.width}mm
            </div>
          </Html>
          
          {/* Height label */}
          <Html position={[l / 2 + 0.1, h / 2, w / 2 + 0.1]} center>
            <div className="bg-background/90 text-foreground px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap border border-border">
              {dimensions.height}mm
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

// Empty state placeholder
function EmptyState() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <Box className="w-12 h-12 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No Model Loaded</p>
          <p className="text-xs text-muted-foreground mt-1">
            Chat with the AI to generate an enclosure
          </p>
        </div>
      </div>
    </Html>
  );
}

// Camera controls component
function CameraController({ onReset }: { onReset: () => void }) {
  const { camera } = useThree();
  
  const resetCamera = useCallback(() => {
    camera.position.set(2, 1.5, 2);
    camera.lookAt(0, 0, 0);
    onReset();
  }, [camera, onReset]);

  return null;
}

// Loading spinner
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading viewer...</span>
      </div>
    </Html>
  );
}

export function ModelViewer({ 
  modelData,
  showGrid = true,
  showDimensions = true 
}: ModelViewerProps) {
  const controlsRef = useRef<any>(null);
  const [gridVisible, setGridVisible] = useState(showGrid);
  const [dimensionsVisible, setDimensionsVisible] = useState(showDimensions);

  const resetView = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `enclosure-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-viewer-bg rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={resetView}
          className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setGridVisible(!gridVisible)}
          className={`h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background ${gridVisible ? 'text-primary' : ''}`}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setDimensionsVisible(!dimensionsVisible)}
          className={`h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background ${dimensionsVisible ? 'text-primary' : ''}`}
        >
          <Ruler className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleScreenshot}
          className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      {/* Model info badge */}
      {modelData && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-border">
            <p className="text-xs font-mono text-muted-foreground">
              {modelData.dimensions.length} x {modelData.dimensions.width} x {modelData.dimensions.height} mm
            </p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas 
        shadows={false}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<LoadingFallback />}>
          <PerspectiveCamera makeDefault position={[2, 1.5, 2]} fov={45} />
          
          {/* Lighting - simplified without shadows */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-3, 3, -3]} intensity={0.4} />
          <directionalLight position={[0, -5, 0]} intensity={0.2} />

          {/* Grid */}
          {gridVisible && (
            <Grid
              args={[10, 10]}
              cellSize={0.1}
              cellThickness={0.5}
              cellColor="#3a4a5a"
              sectionSize={1}
              sectionThickness={1}
              sectionColor="#4a5a6a"
              fadeDistance={15}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid
            />
          )}

          {/* Model or empty state */}
          <Center>
            {modelData ? (
              <EnclosurePreview 
                dimensions={modelData.dimensions}
                wallThickness={modelData.wallThickness}
                showDimensions={dimensionsVisible}
              />
            ) : (
              <EmptyState />
            )}
          </Center>

          {/* Controls */}
          <OrbitControls 
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.05}
            minDistance={0.5}
            maxDistance={10}
          />

          {/* Gizmo helper */}
          <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
            <GizmoViewport 
              axisColors={['#ef4444', '#22c55e', '#3b82f6']} 
              labelColor="white"
            />
          </GizmoHelper>
        </Suspense>
      </Canvas>

      {/* Bottom info bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
          Scroll to zoom, drag to rotate, right-click to pan
        </div>
        {modelData && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Wall: {modelData.wallThickness ?? 2.5}mm</span>
          </div>
        )}
      </div>
    </div>
  );
}
