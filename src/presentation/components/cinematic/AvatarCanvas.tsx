'use client'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { Box3, MathUtils, Vector3, type Group } from 'three'

type AvatarCanvasProps = { url: string; active: boolean; mobile: boolean; onReady: () => void }

const AVATAR_HEIGHT = 1.7
const MIN_EXTENT = 0.0001
const YAW_RANGE = 0.35
const PITCH_RANGE = 0.15
const FOLLOW_DAMPING = 4
const BREATH_SPEED = 1.2
const BREATH_AMPLITUDE = 0.02
const MAX_DPR_DESKTOP = 2
const MAX_DPR_MOBILE = 1.5
const CAMERA = { position: [0, 0, 3.4] as [number, number, number], fov: 30 }

function Avatar({ url, onReady }: Pick<AvatarCanvasProps, 'url' | 'onReady'>) {
  // useGLTF(url, useDraco=false, useMeshopt=true) : aucun décodeur n'est chargé depuis un CDN.
  const { scene } = useGLTF(url, false, true)
  const group = useRef<Group>(null)

  // Recadre n'importe quel GLB : centré, hauteur normalisée.
  useLayoutEffect(() => {
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const scale = AVATAR_HEIGHT / Math.max(size.y, MIN_EXTENT)
    scene.scale.setScalar(scale)
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
  }, [scene])

  useEffect(() => {
    onReady()
  }, [onReady])

  useFrame((state, delta) => {
    const target = group.current
    if (!target) return
    target.rotation.y = MathUtils.damp(
      target.rotation.y,
      state.pointer.x * YAW_RANGE,
      FOLLOW_DAMPING,
      delta,
    )
    target.rotation.x = MathUtils.damp(
      target.rotation.x,
      -state.pointer.y * PITCH_RANGE,
      FOLLOW_DAMPING,
      delta,
    )
    target.position.y = Math.sin(state.clock.elapsedTime * BREATH_SPEED) * BREATH_AMPLITUDE
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}

export default function AvatarCanvas({ url, active, mobile, onReady }: AvatarCanvasProps) {
  return (
    <Canvas
      dpr={[1, mobile ? MAX_DPR_MOBILE : MAX_DPR_DESKTOP]}
      camera={CAMERA}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 3, 4]} intensity={1.6} />
      {/* Environnement procédural : aucun HDR distant. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[0, 3, -2]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-4, 1, 2]} scale={[2, 4, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <Avatar url={url} onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
